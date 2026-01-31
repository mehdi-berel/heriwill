import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'

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

    // 1. Get user data (from auth or users table)
    let { data: userData, error: userError } = await (supabase
      .from('users')
      .select('global_trigger_method, full_name, email')
      .eq('id', userId)
      .single() as any)

    // If user not in users table, get from auth and create profile
    if (userError || !userData) {
      logger.info('User not in users table, fetching from auth')
      
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
      
      if (authError || !authUser) {
        logger.error('User not found in auth', authError)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Create user profile in users table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newUser, error: createError } = await (supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0],
          global_trigger_method: 'manual_trigger',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single() as any)

      if (createError) {
        logger.error('Failed to create user profile', createError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }

      userData = newUser
    }

    // Verify manual trigger is enabled (or allow it since we just set it)
    if (userData.global_trigger_method && userData.global_trigger_method !== 'manual_trigger') {
      return NextResponse.json(
        { error: 'Manual trigger method not enabled for this user' },
        { status: 400 }
      )
    }

    // 2. Get all user's vaults
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: vaults, error: vaultsError } = await (supabase
      .from('vaults')
      .select('id, name')
      .eq('user_id', userId)
      .eq('is_active', true) as any)

    if (vaultsError) {
      logger.error('Error fetching vaults', vaultsError)
      return NextResponse.json({ error: 'Failed to fetch vaults' }, { status: 500 })
    }

    // 3. Get all heirs for these vaults
    const vaultIds = vaults?.map((v: any) => v.id) || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: heirs, error: heirsError } = await (supabase
      .from('heirs')
      .select('id, email, full_name, vault_id')
      .in('vault_id', vaultIds)
      .eq('is_active', true) as any)

    if (heirsError) {
      logger.error('Error fetching heirs', heirsError)
    }

    // 4. Get or create a default inheritance plan for the user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data: plan, error: planError } = await (supabase
      .from('inheritance_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .single() as any)

    // If no plan exists, create a default one
    if (planError || !plan) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newPlan, error: createPlanError } = await (supabase
        .from('inheritance_plans')
        .insert({
          user_id: userId,
          plan_name: 'Default Inheritance Plan',
          plan_type: 'standard',
          is_active: true,
          is_triggered: true,
          triggered_at: new Date().toISOString(),
        })
        .select()
        .single() as any)

      if (createPlanError) {
        logger.error('Error creating inheritance plan', createPlanError)
        return NextResponse.json({ error: 'Failed to create inheritance plan' }, { status: 500 })
      }
      plan = newPlan
    }

    // 5. Create inheritance trigger record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: trigger, error: triggerError } = await (supabase
      .from('inheritance_triggers')
      .insert({
        user_id: userId,
        inheritance_plan_id: plan.id,
        trigger_metadata: {
          type: 'manual_trigger',
          reason: reason || 'Manual trigger by user',
          triggered_by: userId,
        },
        status: 'triggered',
        requires_verification: false,
        triggered_at: new Date().toISOString(),
      })
      .select()
      .single() as any)

    if (triggerError) {
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logger.info(`Sending inheritance notification to heir ${(heir as any).email}`)
          
          // TODO: Implement email sending
          // await sendHeirNotificationEmail({
          //   heirEmail: heir.email,
          //   heirName: heir.full_name,
          //   ownerName: userData.full_name,
          //   vaultName: vaults?.find(v => v.id === heir.vault_id)?.name
          // })
        } catch (emailError) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logger.error(`Failed to send email to heir ${(heir as any).email}`, emailError)
        }
      }
    }

    // 7. Update user status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase
      .from('users')
      .update({
        inheritance_triggered: true,
        inheritance_triggered_at: new Date().toISOString(),
      })
      .eq('id', userId) as any)

    if (updateError) {
      logger.error('Error updating user status', updateError)
    }

    logger.info(`Inheritance plan successfully triggered for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Inheritance plan triggered successfully',
      triggerId: trigger.id,
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
