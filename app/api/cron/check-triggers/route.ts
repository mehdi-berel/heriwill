import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { Database } from '@/lib/database.types'

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
    logger.error('Error in trigger check cron job', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

async function checkInactivityTriggers() {
  try {
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
        // Send warning email if not already sent
        // TODO: Check if warning was already sent
        logger.info(`Sending inactivity warning to user ${user.id}`)
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
    
    // Call the trigger-inheritance endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.heriwill.com'}/api/trigger-inheritance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason })
    })

    if (!response.ok) {
      const errorData = await response.json()
      logger.error(`Failed to trigger inheritance for user ${userId}`, errorData)
      return
    }

    const result = await response.json()
    logger.info(`Successfully triggered inheritance for user ${userId}`, result)
  } catch (error) {
    logger.error(`Error triggering inheritance for user ${userId}`, error)
  }
}
