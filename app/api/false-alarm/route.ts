import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { notifyFalseAlarm } from '@/lib/services/notificationService'

/**
 * API endpoint to declare false alarm and restore account
 * Called when user realizes inheritance was triggered by mistake
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    logger.info(`False alarm declared for user ${userId}`)

    const supabase = await createServerSupabaseClient()

    // 1. Verify user has inheritance triggered
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('inheritance_triggered, inheritance_triggered_at, full_name, email')
      .eq('id', userId)
      .single() as { data: { inheritance_triggered: boolean; inheritance_triggered_at: string | null; full_name: string | null; email: string } | null; error: unknown }

    if (userError || !userData) {
      logger.error('User not found', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!userData.inheritance_triggered) {
      return NextResponse.json(
        { error: 'Inheritance has not been triggered for this user' },
        { status: 400 }
      )
    }

    // 2. Update user status - restore to normal and clear deactivation date
    const updateResult = await supabase
      .from('users')
      .update({
        inheritance_triggered: false,
        inheritance_triggered_at: null,
        account_deactivation_date: null,
      } as never)
      .eq('id', userId)
    const updateUserError = updateResult.error

    if (updateUserError) {
      logger.error('Error updating user status', updateUserError)
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
    }

    // 3. Get all user's vaults
    const { data: vaults, error: vaultsError } = await supabase
      .from('vaults')
      .select('id, name')
      .eq('user_id', userId)

    if (vaultsError) {
      logger.error('Error fetching vaults', vaultsError)
    }

    // 4. Delete shared_vaults entries created during trigger
    // This removes heir access to the vaults
    const vaultIds = vaults?.map(v => v.id) || []
    if (vaultIds.length > 0) {
      const { error: deleteSharedVaultsError } = await supabase
        .from('shared_vaults')
        .delete()
        .eq('owner_id', userId)
        .in('vault_id', vaultIds)

      if (deleteSharedVaultsError) {
        logger.error('Error deleting shared vaults', deleteSharedVaultsError)
      } else {
        logger.info(`Deleted shared vault entries for user ${userId}`)
      }
    }

    // 5. Cancel/update inheritance trigger records
    const triggerResult = await supabase
      .from('inheritance_triggers')
      .update({ 
        status: 'cancelled',
        trigger_metadata: {
          cancelled_reason: 'false_alarm',
          cancelled_at: new Date().toISOString()
        }
      } as never)
      .eq('user_id', userId)
      .eq('status', 'pending') // Using 'pending' as the valid status
    const triggerUpdateError = triggerResult.error

    if (triggerUpdateError) {
      logger.error('Error cancelling triggers', triggerUpdateError)
    }

    // 6. Get all heirs with user accounts to notify them
    const { data: heirs, error: heirsError } = await supabase
      .from('heirs')
      .select('id, heir_user_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('heir_user_id', 'is', null)

    if (heirsError) {
      logger.error('Error fetching heirs', heirsError)
    }

    // 7. Send in-app notifications to heirs about false alarm
    if (heirs && heirs.length > 0) {
      for (const heir of heirs) {
        try {
          const heirData = heir as { id: string; heir_user_id: string }
          
          // Create in-app notification for heir
          await notifyFalseAlarm(
            heirData.heir_user_id,
            userData.full_name || 'Account Owner'
          )
          logger.info(`Created false alarm notification for heir ${heirData.heir_user_id}`)
        } catch (notificationError) {
          logger.error(`Failed to create notification for heir`, notificationError)
        }
      }
    }

    logger.info(`False alarm successfully processed for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'False alarm declared successfully. Account restored.',
      vaultsRestored: vaults?.length || 0,
    })
  } catch (error) {
    logger.error('Error in false-alarm endpoint', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
