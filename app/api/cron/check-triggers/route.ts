import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'
import { Database } from '@/lib/database.types'
import { sanitizeApiError } from '@/lib/utils/error-handler'

function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Vercel Cron Job - Check Sign-Off Trigger Conditions
 * 
 * This endpoint is called hourly by Vercel Cron to check if any users
 * have met their death detection trigger conditions.
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-triggers",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */

type Trigger = Database['public']['Tables']['inheritance_triggers']['Row']
type User = Database['public']['Tables']['users']['Row']

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('Starting trigger check cron job')

    // 1. Check inactivity triggers
    await checkInactivityTriggers()

    // 2. Check scheduled date triggers
    await checkScheduledTriggers()

    // 3. Check verification timeouts
    await checkVerificationTimeouts()

    // 4. Check for accounts past deactivation date
    await checkAccountDeactivations()

    return NextResponse.json({ success: true })
  } catch (error) {
    const sanitized = sanitizeApiError(error, { action: 'cron_check_triggers' })
    return NextResponse.json({ error: sanitized.error }, { status: sanitized.statusCode })
  }
}

async function checkInactivityTriggers() {
  try {
    const supabase = createServiceRoleClient()
    // Get all users with inactivity trigger enabled
    const { data, error } = await supabase
      .from('users')
      .select('id, last_activity, global_trigger_settings')
      .eq('global_trigger_method', 'inactivity')
      .eq('is_active', true)

    if (error) {
      logger.error('Error fetching users for inactivity check', error)
      return
    }

    const users = data as unknown as User[]
    if (!users) return

    const now = new Date()

    for (const user of users) {
      const settings = user.global_trigger_settings as Record<string, unknown> | null
      const inactivityDays = (settings?.inactivity_days as number) || 90 // Default 90 days
      const warningDays = (settings?.warning_days as number) || 7 // Default 7 days warning

      if (!user.last_activity) continue // Skip if no last activity
      
      const lastActivity = new Date(user.last_activity)
      const diffTime = Math.abs(now.getTime() - lastActivity.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Check if we need to send a warning
      if (diffDays >= (inactivityDays - warningDays) && diffDays < inactivityDays) {
        // Check if warning was already sent
        const warningKey = 'inactivity_warning_sent'
        const settingsObj = typeof user.global_trigger_settings === 'object' && user.global_trigger_settings !== null 
          ? user.global_trigger_settings as Record<string, unknown>
          : {}
        const warningSent = settingsObj[warningKey]
        
        if (!warningSent) {
          logger.info(`Sending inactivity warning to user ${user.id}`)
          
          // Mark warning as sent in user settings
          const updatedSettings = {
            ...settingsObj,
            [warningKey]: new Date().toISOString()
          }
          
          const supabaseUpdate = createServiceRoleClient()
          await supabaseUpdate
            .from('users')
            .update({ global_trigger_settings: updatedSettings })
            .eq('id', user.id)
        } else {
          logger.info(`Inactivity warning already sent to user ${user.id} at ${warningSent}`)
        }
      }

      // Check if we need to trigger
      if (diffDays >= inactivityDays) {
        logger.info(`Triggering inheritance plan for user ${user.id} due to inactivity`)
        // Trigger the plan
        await triggerPlan(user.id, 'inactivity')
      }
    }
  } catch (error) {
    logger.error('Error checking inactivity triggers', error)
  }
}

async function checkScheduledTriggers() {
  try {
    const supabase = createServiceRoleClient()
    const now = new Date().toISOString()

    // Get all users with scheduled trigger enabled and date passed
    const { data, error } = await supabase
      .from('users')
      .select('id, global_scheduled_date')
      .eq('global_trigger_method', 'scheduled')
      .lte('global_scheduled_date', now)
      .eq('is_active', true)

    if (error) {
      logger.error('Error fetching users for scheduled check', error)
      return
    }

    const users = data as unknown as User[]
    if (!users) return

    for (const user of users) {
      logger.info(`Triggering inheritance plan for user ${user.id} due to scheduled date`)
      await triggerPlan(user.id, 'scheduled')
    }
  } catch (error) {
    logger.error('Error checking scheduled triggers', error)
  }
}

async function checkVerificationTimeouts() {
  try {
    const supabase = createServiceRoleClient()
    // Get pending triggers that have timed out
    const { data, error } = await supabase
      .from('inheritance_triggers')
      .select('*')
      .eq('status', 'pending') // Using 'pending' as the valid status

    if (error) {
      logger.error('Error fetching pending triggers', error)
      return
    }

    const triggers = data as unknown as Trigger[]
    if (!triggers) return

    for (const trigger of triggers) {
      // Logic to handle verification timeouts
      // If verification period expired, either cancel or auto-confirm depending on settings
      // For now, we'll just log
      logger.info(`Checking verification timeout for trigger ${trigger.id}`)
    }
  } catch (error) {
    logger.error('Error checking verification timeouts', error)
  }
}

async function checkAccountDeactivations() {
  try {
    const supabase = createServiceRoleClient()
    const now = new Date().toISOString()

    // Get all users with deactivation date passed and inheritance still triggered
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, account_deactivation_date')
      .eq('inheritance_triggered', true)
      .lte('account_deactivation_date', now)
      .eq('is_active', true)

    if (error) {
      logger.error('Error fetching users for deactivation', error)
      return
    }

    const users = data as unknown as Array<{ id: string; email: string; full_name: string | null; account_deactivation_date: string }>
    if (!users || users.length === 0) return

    for (const user of users) {
      logger.info(`Deactivating account for user ${user.id} (${user.email}) - 30 days passed without false alarm`)
      
      // Deactivate the account
      const { error: deactivateError } = await supabase
        .from('users')
        .update({
          is_active: false,
          account_locked: true,
        } as never)
        .eq('id', user.id)

      if (deactivateError) {
        logger.error(`Error deactivating user ${user.id}`, deactivateError)
      } else {
        logger.info(`Successfully deactivated account for user ${user.id}`)
      }
    }
  } catch (error) {
    logger.error('Error checking account deactivations', error)
  }
}

async function triggerPlan(userId: string, reason: string) {
  try {
    logger.info(`Triggering inheritance plan for user ${userId}, reason: ${reason}`)
    
    const supabase = createServiceRoleClient()

    // Calculate 30-day deactivation date
    const deactivationDate = new Date()
    deactivationDate.setDate(deactivationDate.getDate() + 30)

    // Call the trigger_inheritance_transaction RPC directly with service role
    const { data, error } = await (supabase.rpc as unknown as (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)(
      'trigger_inheritance_transaction',
      {
        p_user_id: userId,
        p_trigger_reason: reason,
        p_deactivation_date: deactivationDate.toISOString()
      }
    )

    if (error) {
      logger.error(`Failed to trigger inheritance for user ${userId}`, error)
      return
    }

    logger.info(`Successfully triggered inheritance for user ${userId}`, { data })
  } catch (error) {
    logger.error(`Error triggering inheritance for user ${userId}`, error)
  }
}
