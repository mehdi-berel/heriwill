import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
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
  // Get all vaults for the user
  const { data: vaults, error: vaultsError } = await supabase
    .from('vaults')
    .select('id, name, category')
    .eq('user_id', userId)

  if (vaultsError) {
    logger.error('Error fetching vaults for inheritance', vaultsError)
    throw vaultsError
  }

  const vaultActions: VaultAction[] = []

  // For each vault, get assigned heirs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const vault of (vaults || []) as any[]) {
    const { data: heirAccess, error: accessError } = await supabase
      .from('heir_vault_access')
      .select('heir_id')
      .eq('vault_id', vault.id)

    if (accessError) {
      logger.error('Error fetching heir access for vault', accessError, { vaultId: vault.id })
      continue
    }

    vaultActions.push({
      vault_id: vault.id,
      vault_name: vault.name,
      category: vault.category as VaultAction['category'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      heir_ids: ((heirAccess || []) as any[]).map(h => h.heir_id)
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (heirs || []).map((heir: any) => ({
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
 * Grant vault access to heirs
 */
async function shareVaultWithHeirs(vaultId: string, heirIds: string[]): Promise<void> {
  if (heirIds.length === 0) {
    logger.info('No heirs assigned to vault', { vaultId })
    return
  }

  // Update heir_vault_access to grant access
  for (const heirId of heirIds) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('heir_vault_access') as any)
      .update({
        access_granted: true,
        access_granted_at: new Date().toISOString()
      })
      .eq('vault_id', vaultId)
      .eq('heir_id', heirId)

    if (error) {
      logger.error('Error granting vault access to heir', error, { heirId, vaultId })
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notaryData = notary as any

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('audit_logs') as any)
    .insert({
      user_id: userId,
      action,
      resource_type: 'inheritance_plan',
      metadata,
      risk_level: 'high',
      created_at: new Date().toISOString()
    })

  if (error) {
    logger.error('Error creating audit log', error, { userId, action })
  }
}
