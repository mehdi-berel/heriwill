import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'
import { Database } from '@/lib/database.types'
import { notifyInheritanceTriggered } from '@/lib/services/notificationService'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'
import { sanitizeApiError } from '@/lib/utils/error-handler'
import { validateUUID, validateReason } from '@/lib/utils/validation'

// Service role client for admin operations (bypasses RLS)
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Type definitions for database operations
type UserData = {
  global_trigger_method: string | null
  full_name: string | null
  email: string
}

type VaultData = {
  id: string
  name: string
  category?: string
}

/**
 * API endpoint to manually trigger inheritance plan
 * Called when user clicks "Trigger Inheritance Plan Now" button
 */
export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting for inheritance triggering
    const rateLimitResult = await rateLimit(RateLimitPresets.strict)(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const { userId, reason } = await request.json()

    // Validate user ID
    const userIdValidation = validateUUID(userId)
    if (!userIdValidation.isValid) {
      return NextResponse.json({ error: userIdValidation.error }, { status: 400 })
    }

    // Validate reason (optional but if provided, must be valid)
    if (reason) {
      const reasonValidation = validateReason(reason, { required: false, minLength: 5, maxLength: 500 })
      if (!reasonValidation.isValid) {
        return NextResponse.json({ error: reasonValidation.error }, { status: 400 })
      }
    }

    logger.info(`Manual trigger initiated for user ${userId}`)

    // Use service role client to bypass RLS for inheritance operations
    const supabase = createServiceRoleClient()

    // 1. Get user data (from auth or users table)
    let userData: UserData | null = null
    const { data: userDataResult, error: userError } = await supabase
      .from('users')
      .select('global_trigger_method, full_name, email')
      .eq('id', userId)
      .single()

    // If user not in users table, get from auth and create profile
    if (userError || !userDataResult) {
      logger.info('User not in users table, fetching from auth')
      
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
      
      if (authError || !authUser) {
        const sanitized = sanitizeApiError(authError || new Error('User not found'), { userId, action: 'trigger_inheritance' })
        return NextResponse.json({ error: sanitized.error }, { status: sanitized.statusCode })
      }

      // Create user profile in users table
      const createResult = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser.user.email!,
          full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0],
          global_trigger_method: 'manual_trigger',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as never)
        .select('global_trigger_method, full_name, email')
        .single()
      const newUser = createResult.data
      const createError = createResult.error

      if (createError) {
        const sanitized = sanitizeApiError(createError, { userId, action: 'create_user_profile' })
        return NextResponse.json({ error: sanitized.error }, { status: sanitized.statusCode })
      }

      userData = newUser as UserData | null
    } else {
      userData = userDataResult
    }

    // Verify manual trigger is enabled (or allow it since we just set it)
    if (userData && userData.global_trigger_method && userData.global_trigger_method !== 'manual_trigger') {
      return NextResponse.json(
        { error: 'Manual trigger method not enabled for this user' },
        { status: 400 }
      )
    }

    // 2. Get all vaults for the user
    const { data: vaults, error: vaultsError } = await supabase
      .from('vaults')
      .select('id, name, category')
      .eq('user_id', userId) as { data: VaultData[] | null; error: unknown }

    if (vaultsError) {
      const sanitized = sanitizeApiError(vaultsError, { userId, action: 'fetch_vaults' })
      return NextResponse.json({ error: sanitized.error }, { status: sanitized.statusCode })
    }

    // 3. Get all heirs for these vaults (for logging purposes)
    const vaultIds = vaults?.map((v) => v.id) || []
    const { error: heirsError } = await supabase
      .from('heirs')
      .select('id, email, full_name, vault_id')
      .in('vault_id', vaultIds)
      .eq('is_active', true)

    if (heirsError) {
      logger.error('Error fetching heirs', heirsError)
    }

    // Calculate 30-day deactivation date
    const deactivationDate = new Date()
    deactivationDate.setDate(deactivationDate.getDate() + 30)

    // Execute all operations in a transaction
    type TransactionResult = {
      trigger_id: string
      shared_vaults_created: number
      vault_count: number
      heir_count: number
    }
    
    const { data, error: transactionError } = await (supabase.rpc as unknown as (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)(
      'trigger_inheritance_transaction',
      {
        p_user_id: userId,
        p_trigger_reason: reason || 'User manually triggered inheritance plan',
        p_deactivation_date: deactivationDate.toISOString()
      }
    )
    
    const transactionResult = data as TransactionResult | null

    if (transactionError) {
      logger.error('Transaction error during inheritance trigger', transactionError, { userId })
      const sanitized = sanitizeApiError(transactionError, { userId, action: 'trigger_inheritance_transaction' })
      return NextResponse.json({ error: sanitized.error }, { status: sanitized.statusCode })
    }

    if (transactionResult) {
      logger.info('Inheritance triggered successfully in transaction', transactionResult)
    }

    // Get active heirs for notifications (outside transaction)
    const { data: activeHeirs } = await supabase
      .from('heirs')
      .select('id, heir_user_id, user_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('heir_user_id', 'is', null) as { data: Array<{ id: string; heir_user_id: string; user_id: string }> | null; error: unknown }

    // Send in-app notifications to heirs (non-critical, outside transaction)
    if (activeHeirs && activeHeirs.length > 0) {
      for (const heir of activeHeirs) {
        try {
          await notifyInheritanceTriggered(
            heir.heir_user_id,
            userData?.full_name || 'Account Owner'
          )
          logger.info(`Created inheritance notification for heir ${heir.heir_user_id}`)
        } catch (notificationError) {
          logger.error(`Failed to create notification for heir ${heir.heir_user_id}`, notificationError)
        }
      }
    }

    logger.info(`Account will be deactivated on ${deactivationDate.toISOString()} if no false alarm is declared`)

    logger.info(`Inheritance plan successfully triggered for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Inheritance plan triggered successfully',
      triggerId: transactionResult?.trigger_id,
      heirsNotified: transactionResult?.heir_count,
      vaultsShared: transactionResult?.shared_vaults_created,
    })
  } catch (error) {
    const sanitized = sanitizeApiError(error, { action: 'trigger_inheritance' })
    return NextResponse.json(
      { error: sanitized.error },
      { status: sanitized.statusCode }
    )
  }
}
