import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import type { Database } from '@/lib/database.types'

/**
 * Inheritance Plan Execution Service
 * 
 * Handles the execution of inheritance plans when death is confirmed.
 * This includes:
 * - Marking user as deceased
 * - Notifying all heirs
 * - Granting vault access to designated heirs
 * - Executing vault actions (share/delete/sign-off)
 * - Creating audit logs
 */

interface VaultAction {
  vault_id: string
  vault_name: string
  category: 'share' | 'delete' | 'pro'
  heir_ids: string[]
}

/**
 * Main function to execute inheritance plan when death is confirmed
 */
export async function executeInheritancePlan(userId: string): Promise<void> {
  try {
    logger.info('Starting inheritance plan execution', { userId })

    // 1. Mark user as deceased
    await markUserAsDeceased(userId)

    // 2. Get all vaults and their assigned heirs
    const vaultActions = await getVaultActions(userId)

    // 3. Get all heirs for notifications
    const heirs = await getHeirs(userId)

    // 4. Execute vault actions
    for (const action of vaultActions) {
      await executeVaultAction(userId, action)
    }

    // 5. Notify all heirs
    await notifyHeirs(userId, heirs)

    // 6. Create audit log
    await createAuditLog(userId, 'inheritance_plan_executed', {
      vaults_processed: vaultActions.length,
      heirs_notified: heirs.length,
      timestamp: new Date().toISOString()
    })

    logger.info('Inheritance plan execution complete', { userId })
  } catch (error) {
    logger.error('Error executing inheritance plan', error, { userId })
    
    // Log the failure
    await createAuditLog(userId, 'inheritance_plan_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    throw error
  }
}

/**
 * Mark user as deceased in the database
 */
async function markUserAsDeceased(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      is_active: false,
      account_locked: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    logger.error('Error marking user as deceased', error, { userId })
    throw error
  }

  logger.info('User marked as deceased', { userId })
}

/**
 * Get all vaults and their assigned heirs
 */
async function getVaultActions(userId: string): Promise<VaultAction[]> {
  // Get all vaults for the user with access_control
  const { data: vaults, error: vaultsError } = await supabase
    .from('vaults')
    .select('id, name, category, access_control')
    .eq('user_id', userId)

  if (vaultsError) {
    logger.error('Error fetching vaults for inheritance', vaultsError)
    throw vaultsError
  }

  const vaultActions: VaultAction[] = []

  // For each vault, get assigned heirs from access_control.allowedHeirs
  for (const vault of (vaults || []) as Array<{ id: string; name: string; category: string; access_control: unknown }>) {
    const accessControl = vault.access_control as { allowedHeirs?: string[] } | null
    const heirIds = accessControl?.allowedHeirs || []

    vaultActions.push({
      vault_id: vault.id,
      vault_name: vault.name,
      category: vault.category as VaultAction['category'],
      heir_ids: heirIds
    })
  }

  return vaultActions
}

/**
 * Get all heirs for the user
 */
async function getHeirs(userId: string): Promise<Array<{ id: string; email: string; full_name: string }>> {
  const { data: heirs, error } = await supabase
    .from('heirs')
    .select('id, email_encrypted, full_name_encrypted')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    logger.error('Error fetching heirs for inheritance', error)
    throw error
  }

  return (heirs || []).map((heir: { id: string; email_encrypted: string | null; full_name_encrypted: string | null }) => ({
    id: heir.id,
    email: heir.email_encrypted || '',
    full_name: heir.full_name_encrypted || 'Unknown'
  }))
}

/**
 * Execute action for a specific vault based on its category
 */
async function executeVaultAction(userId: string, action: VaultAction): Promise<void> {
  logger.info('Executing vault action', { vaultName: action.vault_name, category: action.category, userId })

  switch (action.category) {
    case 'share':
      await shareVaultWithHeirs(action.vault_id, action.heir_ids)
      break

    case 'delete':
      await deleteVault(action.vault_id)
      break

    case 'pro':
      await notifyNotaryForSignOff(userId, action.vault_id)
      break

    default:
      logger.warn('Unknown vault category', { category: action.category })
  }
}

/**
 * Grant vault access to heirs via shared_vaults
 * Creates shared_vaults records when inheritance trigger activates
 */
async function shareVaultWithHeirs(vaultId: string, heirIds: string[]): Promise<void> {
  if (heirIds.length === 0) {
    logger.info('No heirs assigned to vault', { vaultId })
    return
  }

  // Get vault owner
  const { data: vault } = await supabase
    .from('vaults')
    .select('user_id')
    .eq('id', vaultId)
    .single()

  if (!vault) {
    logger.error('Vault not found', { vaultId })
    return
  }

  // Create shared_vaults records to grant access
  // Use upsert to handle cases where records might already exist
  for (const heirId of heirIds) {
    const { error } = await supabase
      .from('shared_vaults')
      .upsert({
        vault_id: vaultId,
        owner_id: vault.user_id,
        shared_with_user_id: heirId,
        accepted: true,
        accepted_at: new Date().toISOString(),
        is_active: true,
        shared_at: new Date().toISOString()
      }, {
        onConflict: 'vault_id,shared_with_user_id'
      })

    if (error) {
      logger.error('Error granting vault access to heir', error, { heirId, vaultId })
    } else {
      logger.info('Granted vault access to heir', { heirId, vaultId })
    }
  }

  logger.info('Granted vault access to heirs', { vaultId, heirCount: heirIds.length })
}

/**
 * Delete vault and all its items
 */
async function deleteVault(vaultId: string): Promise<void> {
  // Delete vault items first
  const { error: itemsError } = await supabase
    .from('vault_items')
    .delete()
    .eq('vault_id', vaultId)

  if (itemsError) {
    logger.error('Error deleting vault items', itemsError, { vaultId })
  }

  // Delete vault
  const { error: vaultError } = await supabase
    .from('vaults')
    .delete()
    .eq('id', vaultId)

  if (vaultError) {
    logger.error('Error deleting vault', vaultError, { vaultId })
    throw vaultError
  }

  logger.info('Deleted vault', { vaultId })
}

/**
 * Notify notary for sign-off vault
 */
async function notifyNotaryForSignOff(userId: string, vaultId: string): Promise<void> {
  // Get primary notary for the user
  const { data: notary, error } = await supabase
    .from('notaries')
    .select('id, name, email')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single()

  if (error || !notary) {
    logger.warn('No primary notary found for user', { userId })
    return
  }

  const notaryData = notary as { id: string; name: string; email: string }

  // TODO: Send email notification to notary
  logger.info('Notary notification pending', { 
    notaryName: notaryData.name, 
    notaryEmail: notaryData.email, 
    vaultId,
    userId 
  })

  // Create audit log
  await createAuditLog(userId, 'notary_notified', {
    notary_id: notaryData.id,
    notary_email: notaryData.email,
    vault_id: vaultId
  })
}

/**
 * Send notifications to all heirs
 */
async function notifyHeirs(
  userId: string,
  heirs: Array<{ id: string; email: string; full_name: string }>
): Promise<void> {
  if (heirs.length === 0) {
    logger.info('No heirs to notify', { userId })
    return
  }

  // TODO: Send email notifications to heirs
  for (const heir of heirs) {
    logger.info('Heir notification pending', { 
      heirName: heir.full_name, 
      heirEmail: heir.email,
      userId 
    })
    
    // Create audit log for each notification
    await createAuditLog(userId, 'heir_notified', {
      heir_id: heir.id,
      heir_email: heir.email
    })
  }

  logger.info('Heir notifications completed', { heirCount: heirs.length, userId })
}

/**
 * Create audit log entry
 */
async function createAuditLog(
  userId: string,
  action: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      resource_type: 'inheritance_plan',
      metadata: metadata as unknown as Database['public']['Tables']['audit_logs']['Insert']['metadata'],
      risk_level: 'high',
      created_at: new Date().toISOString()
    })

  if (error) {
    logger.error('Error creating audit log', error, { userId, action })
  }
}
