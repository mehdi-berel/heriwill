'use server'

import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase'
import { recordHeirDeathConfirmation, confirmTrustedContactDeath } from '@/lib/services/globalTriggerService'
import { notifyInheritanceTriggered, notifyFalseAlarm } from '@/lib/services/notificationService'
import { logger } from '@/lib/utils/logger'


// Confirm death as heir
export async function confirmDeathAsHeir(
  heirId: string,
  ownerUserId: string,
  confirmed: boolean
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  if (!heirId || !ownerUserId) {
    throw new Error('Missing required fields')
  }

  // Verify that the current user is the heir
  const { data: heirData, error: heirError } = await supabase
    .from('heirs')
    .select('*')
    .eq('id', heirId)
    .eq('heir_user_id', user.id)
    .eq('user_id', ownerUserId)
    .single()

  if (heirError || !heirData) {
    throw new Error('Unauthorized: You are not this heir')
  }

  if (!confirmed) {
    logger.info('Heir denied death notification', { heirId, ownerUserId, userId: user.id })
    return {
      success: true,
      triggered: false,
      message: 'Thank you for your response. The notification has been dismissed.',
    }
  }

  // Record the confirmation
  const result = await recordHeirDeathConfirmation(ownerUserId, heirId)

  // If threshold met, trigger inheritance
  if (result.triggered) {
    try {
      await triggerInheritancePlan(ownerUserId, 'Confirmed by heir consensus')
    } catch (triggerError) {
      logger.error('Error triggering inheritance after heir confirmation', triggerError, { ownerUserId })
    }
  }

  return {
    success: true,
    triggered: result.triggered,
    confirmationProgress: result.confirmationProgress,
    message: result.triggered
      ? 'Death confirmed. Inheritance plan has been triggered.'
      : 'Death confirmation recorded. Waiting for other heirs to confirm.',
  }
}

// Confirm death as trusted contact
export async function confirmDeathAsTrustedContact(
  heirId: string,
  ownerUserId: string
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  if (!heirId || !ownerUserId) {
    throw new Error('Missing required fields')
  }

  logger.info('Trusted contact death confirmation initiated', { heirId, userId: user.id })

  const result = await confirmTrustedContactDeath(heirId)

  if (!result.success) {
    throw new Error(result.message || 'You are not authorized as the trusted contact')
  }

  if (result.triggered) {
    const serviceClient = createServiceRoleClient()

    // Record in inheritance_triggers
    await serviceClient
      .from('inheritance_triggers')
      .insert({
        user_id: ownerUserId,
        trigger_metadata: {
          type: 'trusted_contact',
          confirmed_by_heir_id: heirId,
          confirmed_at: new Date().toISOString(),
        },
        status: 'pending',
        requires_verification: false,
        triggered_at: new Date().toISOString(),
      } as never)

    // Trigger the inheritance plan
    try {
      await triggerInheritancePlan(ownerUserId, 'Confirmed by trusted contact')
    } catch (triggerError) {
      logger.error('Error triggering inheritance after trusted contact confirmation', triggerError, { ownerUserId })
      return {
        success: true,
        triggered: false,
        message: 'Confirmation recorded but failed to trigger inheritance plan',
      }
    }

    logger.info('Inheritance plan triggered by trusted contact', { ownerUserId })

    return {
      success: true,
      triggered: true,
      message: 'Death confirmed and inheritance plan triggered successfully',
    }
  }

  return {
    success: true,
    triggered: false,
    message: 'Confirmation recorded',
  }
}

// Trigger inheritance plan (manual or automated)
export async function triggerInheritancePlan(userId: string, reason?: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Only the owner or the system (via service role) can trigger
  if (user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const serviceClient = createServiceRoleClient()

  // Get user data
  const { data: userData, error: userError } = await serviceClient
    .from('users')
    .select('global_trigger_method, full_name, email')
    .eq('id', userId)
    .single()

  if (userError || !userData) {
    throw new Error('User not found')
  }

  // Calculate 30-day deactivation date
  const deactivationDate = new Date()
  deactivationDate.setDate(deactivationDate.getDate() + 30)

  // Execute transaction via RPC
  const { data: transactionResult, error: transactionError } = await (
    serviceClient.rpc as unknown as (
      name: string,
      params: Record<string, unknown>
    ) => Promise<{ data: unknown; error: unknown }>
  )('trigger_inheritance_transaction', {
    p_user_id: userId,
    p_trigger_reason: reason || 'User manually triggered inheritance plan',
    p_deactivation_date: deactivationDate.toISOString(),
  })

  if (transactionError) {
    logger.error('Transaction error during inheritance trigger', transactionError, { userId })
    throw new Error('Failed to trigger inheritance plan')
  }

  const result = transactionResult as {
    trigger_id: string
    shared_vaults_created: number
    vault_count: number
    heir_count: number
  } | null

  if (result) {
    logger.info('Inheritance triggered successfully', result)
  }

  // Send notifications to heirs (non-critical)
  const { data: activeHeirs } = await serviceClient
    .from('heirs')
    .select('id, heir_user_id, user_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .not('heir_user_id', 'is', null) as {
    data: Array<{ id: string; heir_user_id: string; user_id: string }> | null
    error: unknown
  }

  if (activeHeirs && activeHeirs.length > 0) {
    for (const heir of activeHeirs) {
      try {
        await notifyInheritanceTriggered(
          heir.heir_user_id,
          userData.full_name || 'Account Owner'
        )
      } catch (notificationError) {
        logger.error('Failed to create notification for heir', notificationError, {
          heirUserId: heir.heir_user_id,
        })
      }
    }
  }

  logger.info('Inheritance plan successfully triggered', { userId })

  return {
    success: true,
    message: 'Inheritance plan triggered successfully',
    triggerId: result?.trigger_id,
    heirsNotified: result?.heir_count,
    vaultsShared: result?.shared_vaults_created,
  }
}

// Declare false alarm and restore account
export async function declareFalseAlarm() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const userId = user.id
  logger.info('False alarm declared', { userId })

  // Verify user has inheritance triggered
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('inheritance_triggered, inheritance_triggered_at, full_name, email')
    .eq('id', userId)
    .single() as {
    data: {
      inheritance_triggered: boolean
      inheritance_triggered_at: string | null
      full_name: string | null
      email: string
    } | null
    error: unknown
  }

  if (userError || !userData) {
    throw new Error('User not found')
  }

  if (!userData.inheritance_triggered) {
    throw new Error('Inheritance has not been triggered for this user')
  }

  // Restore user status
  const { error: updateError } = await supabase
    .from('users')
    .update({
      inheritance_triggered: false,
      inheritance_triggered_at: null,
      account_deactivation_date: null,
    } as never)
    .eq('id', userId)

  if (updateError) {
    throw new Error('Failed to restore account')
  }

  // Delete shared_vaults entries created during trigger
  const { data: vaults } = await supabase
    .from('vaults')
    .select('id, name')
    .eq('user_id', userId)

  const vaultIds = vaults?.map((v) => v.id) || []
  if (vaultIds.length > 0) {
    const { error: deleteSharedError } = await supabase
      .from('shared_vaults')
      .delete()
      .eq('owner_id', userId)
      .in('vault_id', vaultIds)

    if (deleteSharedError) {
      logger.error('Error deleting shared vaults', deleteSharedError)
    }
  }

  // Cancel pending inheritance triggers
  const { error: triggerError } = await supabase
    .from('inheritance_triggers')
    .update({
      status: 'cancelled',
      trigger_metadata: {
        cancelled_reason: 'false_alarm',
        cancelled_at: new Date().toISOString(),
      },
    } as never)
    .eq('user_id', userId)
    .eq('status', 'pending')

  if (triggerError) {
    logger.error('Error cancelling triggers', triggerError)
  }

  // Notify heirs about false alarm
  const { data: heirs } = await supabase
    .from('heirs')
    .select('id, heir_user_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .not('heir_user_id', 'is', null)

  if (heirs && heirs.length > 0) {
    for (const heir of heirs) {
      try {
        const heirData = heir as { id: string; heir_user_id: string }
        await notifyFalseAlarm(
          heirData.heir_user_id,
          userData.full_name || 'Account Owner'
        )
      } catch (notificationError) {
        logger.error('Failed to create false alarm notification', notificationError)
      }
    }
  }

  logger.info('False alarm successfully processed', { userId })

  return {
    success: true,
    message: 'False alarm declared successfully. Account restored.',
    vaultsRestored: vaults?.length || 0,
  }
}
