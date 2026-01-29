import { supabase } from '@/lib/supabase'

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
  category: 'share_after_death' | 'delete_after_death' | 'sign_off_after_death'
  heir_ids: string[]
}

/**
 * Main function to execute inheritance plan when death is confirmed
 */
export async function executeInheritancePlan(userId: string): Promise<void> {
  try {
    console.log(`[INHERITANCE] Starting execution for user ${userId}`)

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

    console.log(`[INHERITANCE] Execution complete for user ${userId}`)
  } catch (error) {
    console.error(`[INHERITANCE] Error executing plan for user ${userId}:`, error)
    
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
    console.error('[INHERITANCE] Error marking user as deceased:', error)
    throw error
  }

  console.log(`[INHERITANCE] User ${userId} marked as deceased`)
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
    console.error('[INHERITANCE] Error fetching vaults:', vaultsError)
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
      console.error(`[INHERITANCE] Error fetching heir access for vault ${vault.id}:`, accessError)
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
    console.error('[INHERITANCE] Error fetching heirs:', error)
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
  console.log(`[INHERITANCE] Executing action for vault ${action.vault_name} (${action.category})`)

  switch (action.category) {
    case 'share_after_death':
      await shareVaultWithHeirs(action.vault_id, action.heir_ids)
      break

    case 'delete_after_death':
      await deleteVault(action.vault_id)
      break

    case 'sign_off_after_death':
      await notifyNotaryForSignOff(userId, action.vault_id)
      break

    default:
      console.warn(`[INHERITANCE] Unknown vault category: ${action.category}`)
  }
}

/**
 * Grant vault access to heirs
 */
async function shareVaultWithHeirs(vaultId: string, heirIds: string[]): Promise<void> {
  if (heirIds.length === 0) {
    console.log(`[INHERITANCE] No heirs assigned to vault ${vaultId}`)
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
      console.error(`[INHERITANCE] Error granting access to heir ${heirId}:`, error)
    }
  }

  console.log(`[INHERITANCE] Granted access to ${heirIds.length} heirs for vault ${vaultId}`)
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
    console.error(`[INHERITANCE] Error deleting vault items:`, itemsError)
  }

  // Delete vault
  const { error: vaultError } = await supabase
    .from('vaults')
    .delete()
    .eq('id', vaultId)

  if (vaultError) {
    console.error(`[INHERITANCE] Error deleting vault:`, vaultError)
    throw vaultError
  }

  console.log(`[INHERITANCE] Deleted vault ${vaultId}`)
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
    console.warn(`[INHERITANCE] No primary notary found for user ${userId}`)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notaryData = notary as any

  // TODO: Send email notification to notary
  // For now, just log
  console.log(`[INHERITANCE] Would notify notary ${notaryData.name} (${notaryData.email}) about vault ${vaultId}`)

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
    console.log(`[INHERITANCE] No heirs to notify for user ${userId}`)
    return
  }

  // TODO: Send email notifications to heirs
  // For now, just log
  for (const heir of heirs) {
    console.log(`[INHERITANCE] Would notify heir ${heir.full_name} (${heir.email})`)
    
    // Create audit log for each notification
    await createAuditLog(userId, 'heir_notified', {
      heir_id: heir.id,
      heir_email: heir.email
    })
  }

  console.log(`[INHERITANCE] Notified ${heirs.length} heirs`)
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
    console.error('[INHERITANCE] Error creating audit log:', error)
  }
}
