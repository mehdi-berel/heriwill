import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'
import { Database } from '@/lib/database.types'
import { notifyInheritanceTriggered } from '@/lib/services/notificationService'

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

type HeirData = {
  id: string
  email: string
  full_name: string
  vault_id: string
}

/**
 * API endpoint to manually trigger inheritance plan
 * Called when user clicks "Trigger Inheritance Plan Now" button
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, reason } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
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
        logger.error('User not found in auth', authError)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
        logger.error('Failed to create user profile', createError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
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
      logger.error('Error fetching vaults', vaultsError)
      return NextResponse.json({ error: 'Failed to fetch vaults' }, { status: 500 })
    }

    // 3. Get all heirs for these vaults
    const vaultIds = vaults?.map((v) => v.id) || []
    const { data: heirs, error: heirsError } = await supabase
      .from('heirs')
      .select('id, email, full_name, vault_id')
      .in('vault_id', vaultIds)
      .eq('is_active', true) as { data: HeirData[] | null; error: unknown }

    if (heirsError) {
      logger.error('Error fetching heirs', heirsError)
    }

    // Create inheritance trigger record
    const triggerResult = await supabase
      .from('inheritance_triggers')
      .insert({
        user_id: userId,
        trigger_metadata: {
          type: 'manual',
          reason: reason || 'User manually triggered inheritance plan',
          triggered_by: userId
        },
        status: 'pending',
        requires_verification: false,
        triggered_at: new Date().toISOString(),
      } as never)
      .select('id')
      .single()
    const trigger = triggerResult.data
    const triggerError = triggerResult.error

    if (triggerError || !trigger) {
      logger.error('Error creating trigger', triggerError)
      console.error('[TRIGGER-INHERITANCE] Full error details:', JSON.stringify(triggerError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to create trigger',
        details: triggerError 
      }, { status: 500 })
    }

    // 5. Create shared_vaults entries for heirs with user accounts
    // This grants them access to deceased user's vaults
    const { data: activeHeirs } = await supabase
      .from('heirs')
      .select('id, heir_user_id, user_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('heir_user_id', 'is', null) as { data: Array<{ id: string; heir_user_id: string; user_id: string }> | null; error: unknown }

    if (activeHeirs && activeHeirs.length > 0 && vaults && vaults.length > 0) {
      const sharedVaultEntries = []
      
      for (const heir of activeHeirs) {
        for (const vault of vaults) {
          sharedVaultEntries.push({
            vault_id: vault.id,
            owner_id: userId,
            shared_with_user_id: heir.heir_user_id,
            is_active: true,
            accepted: true, // Auto-accept for inheritance
            accepted_at: new Date().toISOString(),
            shared_at: new Date().toISOString()
          })
        }
      }

      if (sharedVaultEntries.length > 0) {
        const { error: sharedVaultsError } = await supabase
          .from('shared_vaults')
          .insert(sharedVaultEntries as never)

        if (sharedVaultsError) {
          logger.error('Error creating shared vaults for heirs', sharedVaultsError)
        } else {
          logger.info(`Created ${sharedVaultEntries.length} shared vault entries for ${activeHeirs.length} heirs`)
        }
      }
    }

    // 6. Send in-app notifications to heirs with user accounts
    if (activeHeirs && activeHeirs.length > 0) {
      for (const heir of activeHeirs) {
        try {
          // Create in-app notification for heir
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

    // 7. Update user status with 30-day deactivation date
    const deactivationDate = new Date()
    deactivationDate.setDate(deactivationDate.getDate() + 30)
    
    const updateResult = await supabase
      .from('users')
      .update({
        inheritance_triggered: true,
        inheritance_triggered_at: new Date().toISOString(),
        account_deactivation_date: deactivationDate.toISOString(),
      } as never)
      .eq('id', userId)
    const updateError = updateResult.error

    if (updateError) {
      logger.error('Error updating user status', updateError)
    }

    logger.info(`Account will be deactivated on ${deactivationDate.toISOString()} if no false alarm is declared`)

    logger.info(`Inheritance plan successfully triggered for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Inheritance plan triggered successfully',
      triggerId: (trigger as Record<string, unknown>)?.id,
      heirsNotified: heirs?.length || 0,
    })
  } catch (error) {
    logger.error('Error in trigger-inheritance endpoint', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
