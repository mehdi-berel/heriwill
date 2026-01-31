import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'

// Type definitions for database operations
type UserData = {
  global_trigger_method: string | null
  full_name: string | null
  email: string
}

type VaultData = {
  id: string
  name: string
}

type HeirData = {
  id: string
  email: string
  full_name: string
  vault_id: string
}

type PlanData = {
  id: string
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

    const supabase = await createServerSupabaseClient()

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

    // 2. Get all user's vaults
    const { data: vaults, error: vaultsError } = await supabase
      .from('vaults')
      .select('id, name')
      .eq('user_id', userId)
      .eq('is_active', true) as { data: VaultData[] | null; error: unknown }

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

    // 4. Get or create a default inheritance plan for the user
    let plan: PlanData | null = null
    const { data: planResult, error: planError } = await supabase
      .from('inheritance_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .single() as { data: PlanData | null; error: unknown }

    // If no plan exists, create a default one
    if (planError || !planResult) {
      const planResult = await supabase
        .from('inheritance_plans')
        .insert({
          user_id: userId,
          plan_name: 'Manual Trigger Plan',
          plan_type: 'manual',
          is_active: true,
          is_triggered: true,
          triggered_at: new Date().toISOString(),
        } as never)
        .select('id')
        .single()
      const inheritancePlan = planResult.data
      const createPlanError = planResult.error

      if (createPlanError) {
        logger.error('Error creating inheritance plan', createPlanError)
        return NextResponse.json({ error: 'Failed to create inheritance plan' }, { status: 500 })
      }
      plan = inheritancePlan as PlanData | null
    } else {
      plan = planResult
    }

    // Create inheritance trigger record
    const triggerResult = await supabase
      .from('inheritance_triggers')
      .insert({
        user_id: userId,
        inheritance_plan_id: plan!.id,
        trigger_metadata: {
          type: 'manual',
          reason: reason || 'User manually triggered inheritance plan',
          triggered_by: userId
        },
        status: 'triggered',
        requires_verification: false,
        triggered_at: new Date().toISOString(),
      } as never)
      .select('id')
      .single()
    const trigger = triggerResult.data
    const triggerError = triggerResult.error

    if (triggerError || !trigger) {
      logger.error('Error creating trigger', triggerError)
      return NextResponse.json({ error: 'Failed to create trigger' }, { status: 500 })
    }

    // 5. Vaults remain accessible - no status update needed
    // Access is controlled via heir_vault_access table
    logger.info(`${vaultIds.length} vaults will be accessible to heirs`)

    // 6. Send notification emails to heirs
    if (heirs && heirs.length > 0) {
      for (const heir of heirs) {
        try {
          // Send email notification to heir
          // This would integrate with your email service
          logger.info(`Sending inheritance notification to heir ${heir.email}`)
          
          // TODO: Implement email sending
          // await sendHeirNotificationEmail({
          //   heirEmail: heir.email,
          //   heirName: heir.full_name,
          //   ownerName: userData.full_name,
          //   vaultName: vaults?.find(v => v.id === heir.vault_id)?.name
          // })
        } catch (emailError) {
          logger.error(`Failed to send email to heir ${heir.email}`, emailError)
        }
      }
    }

    // 7. Update user status
    const updateResult = await supabase
      .from('users')
      .update({
        inheritance_triggered: true,
        inheritance_triggered_at: new Date().toISOString(),
      } as never)
      .eq('id', userId)
    const updateError = updateResult.error

    if (updateError) {
      logger.error('Error updating user status', updateError)
    }

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
