"use server"

import { createServerSupabaseClient } from '../../lib/supabase'
import { logger } from '../../lib/utils/logger'
import type { Database } from '../../lib/database.types'

type VaultRow = Database['public']['Tables']['vaults']['Row']
type VaultInsert = Database['public']['Tables']['vaults']['Insert']
type VaultUpdate = Database['public']['Tables']['vaults']['Update']
type VaultItemRow = Database['public']['Tables']['vault_items']['Row']
// Removed unused VaultItemInsert type
type VaultItemUpdate = Database['public']['Tables']['vault_items']['Update']

// Removed unused VaultData and VaultUpdateData interfaces

interface VaultItemData {
  user_id: string
  vault_id: string
  title_encrypted?: string
  title?: string
  item_type?: string
  type?: string
  file_size?: number
  size?: number
  storage_path?: string
  storage_bucket?: string
  tags?: string[]
  metadata?: Record<string, unknown>
  is_favorite?: boolean
  password_strength?: string | null
  password_last_changed?: string | null
  requires_password_change?: boolean
}

// Vault Management Actions
// Create Vault
export async function createVault(vaultData: VaultInsert) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')
    if (vaultData.user_id && vaultData.user_id !== user.id) throw new Error('Unauthorized')

    // No tier limits in open source version
    const { data, error } = await supabase
      .from('vaults')
      .insert({ ...vaultData, user_id: user.id })
      .select()
      .single()

    if (error) throw new Error('Failed to create vault')
    return data
}

// Update Vault
export async function updateVault(vaultId: string, updateData: VaultUpdate) {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.error('Authentication error in updateVault', authError)
      throw new Error('Not authenticated')
    }

    // Verify user owns this vault
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .select('user_id')
      .eq('id', vaultId)
      .single()

    if (vaultError) {
      logger.error('Error fetching vault for ownership check', vaultError, { vaultId })
      throw new Error('Vault not found')
    }

    if (vault.user_id !== user.id) {
      logger.error('User does not own vault', { userId: user.id, vaultUserId: vault.user_id, vaultId })
      throw new Error('You do not have permission to update this vault')
    }

    // Update the vault
    const { data, error } = await supabase
      .from('vaults')
      .update(updateData)
      .eq('id', vaultId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating vault', error, { vaultId, userId: user.id })
      throw new Error('Failed to update vault')
    }
    
    logger.info('Vault updated successfully', { vaultId, userId: user.id })
    return data
}

// Delete Vault
export async function deleteVault(vaultId: string) {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.error('Authentication error in deleteVault', authError)
      throw new Error('Not authenticated')
    }

    // Verify user owns this vault
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .select('user_id')
      .eq('id', vaultId)
      .single()

    if (vaultError) {
      logger.error('Error fetching vault for ownership check', vaultError, { vaultId })
      throw new Error('Vault not found')
    }

    if (vault.user_id !== user.id) {
      logger.error('User does not own vault', { userId: user.id, vaultUserId: vault.user_id, vaultId })
      throw new Error('You do not have permission to delete this vault')
    }

    // Delete associated assets first (they have SET NULL on delete, so we need to delete them manually)
    const { error: assetsError } = await supabase
      .from('assets')
      .delete()
      .eq('vault_id', vaultId)

    if (assetsError) {
      logger.error('Error deleting vault assets', assetsError, { vaultId, userId: user.id })
      // Continue with vault deletion even if assets deletion fails
    }

    // Delete the vault (vault_items and shared_vaults will cascade automatically)
    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('id', vaultId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Error deleting vault', error, { vaultId, userId: user.id })
      throw new Error('Failed to delete vault')
    }
    
    logger.info('Vault deleted successfully', { vaultId, userId: user.id })
}

// Get Vault by ID
export async function getVaultById(vaultId: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .single()

    if (error) throw new Error('Vault not found')
    return data
}

// Get All Vaults for User
export async function getAllVaults(userId: string, page = 1, pageSize = 50) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')
    if (userId !== user.id) throw new Error('Unauthorized')

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('vaults')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw new Error('Failed to fetch vaults')
    return { data: data || [], total: count ?? 0, page, pageSize }
}

// Update Last Accessed
export async function updateLastAccessed(vaultId: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data } = await supabase
      .from('vaults')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', vaultId)
      .eq('user_id', user.id)
      .select()
      .single()

    return data
}

// Toggle Favorite - Note: is_favorite column doesn't exist in vaults table
export async function toggleFavorite(vaultId: string, isFavorite: boolean) {
    // This function is deprecated as is_favorite doesn't exist in the vaults schema
    logger.warn('toggleFavorite is deprecated - is_favorite column does not exist')
    return { id: vaultId, is_favorite: isFavorite }
}

// Lock/Unlock Vault
export async function toggleLock(vaultId: string, isLocked: boolean) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data } = await supabase
      .from('vaults')
      .update({ is_locked: isLocked })
      .eq('id', vaultId)
      .eq('user_id', user.id)
      .select()
      .single()

    return data
}

// Share/Unshare Vault
export async function toggleShare(vaultId: string, isShared: boolean) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data } = await supabase
      .from('vaults')
      .update({ is_shared: isShared })
      .eq('id', vaultId)
      .eq('user_id', user.id)
      .select()
      .single()

    return data
}

// Get Vault Statistics
export async function getVaultStats(userId: string) {
    const { data: vaults } = await getAllVaults(userId, 1, 1000)
    
    const stats = {
      totalVaults: vaults.length,
      sharedVaults: vaults.filter((v: VaultRow) => v.is_shared).length,
      recentlyAccessed: vaults.filter((v: VaultRow) => {
        return v.last_accessed && 
          new Date(v.last_accessed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }).length
    }

    return stats
}

// Search and Filter
export async function searchVaults(userId: string, searchTerm: string) {
    const { data: vaults } = await getAllVaults(userId, 1, 1000)
    
    const filteredVaults = vaults.filter((vault: VaultRow) =>
      vault.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filteredVaults
}

// Filter by Category
export async function getVaultsByCategory(userId: string, category: string) {
    const { data: vaults } = await getAllVaults(userId, 1, 1000)
    
    return vaults.filter((vault: VaultRow) => vault.category === category)
}

// Filter by Status - removed getFavoriteVaults and getEncryptedVaults as these properties don't exist on vaults table

// Get Shared Vaults
export async function getSharedVaults(userId: string) {
    const { data: vaults } = await getAllVaults(userId, 1, 1000)
    
    return vaults.filter((vault: VaultRow) => vault.is_shared)
}

// Vault Items Actions
// Create Vault Item
export async function createVaultItem(itemData: VaultItemData) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    // Verify user owns the vault
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .select('user_id')
      .eq('id', itemData.vault_id)
      .single()
    if (vaultError || !vault) throw new Error('Vault not found')
    if (vault.user_id !== user.id) throw new Error('Unauthorized: You do not own this vault')

    // Generate unique storage path (required and must be unique)
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const storagePath = itemData.storage_path || `${user.id}/${itemData.vault_id}/${timestamp}-${randomId}`
    
    const { data, error } = await supabase
      .from('vault_items')
      .insert({
        user_id: itemData.user_id,
        vault_id: itemData.vault_id,
        title_encrypted: itemData.title_encrypted || itemData.title || 'Untitled',
        item_type: (itemData.item_type || itemData.type || 'other') as Database["public"]["Enums"]["vault_item_type"],
        file_size: itemData.file_size || itemData.size || null,
        storage_path: storagePath,
        storage_bucket: itemData.storage_bucket || 'vault-files',
        tags: itemData.tags || [],
        metadata: (itemData.metadata || {}) as Database['public']['Tables']['vault_items']['Insert']['metadata'],
        is_favorite: itemData.is_favorite || false,
        password_strength: typeof itemData.password_strength === 'string' ? parseInt(itemData.password_strength) : itemData.password_strength || null,
        password_last_changed: itemData.password_last_changed || null,
        requires_password_change: itemData.requires_password_change || false
      })
      .select()
      .single()

    if (error) throw new Error('Failed to create vault item')
    return data
}

// Update Vault Item
export async function updateVaultItem(itemId: string, updateData: VaultItemUpdate) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    // Verify ownership
    const { data: existingItem, error: fetchError } = await supabase
      .from('vault_items')
      .select('user_id')
      .eq('id', itemId)
      .single()
    if (fetchError || !existingItem) throw new Error('Item not found')
    if (existingItem.user_id !== user.id) throw new Error('Unauthorized: You do not own this item')

    const updatePayload: VaultItemUpdate = {}
    if (updateData.title_encrypted) updatePayload.title_encrypted = updateData.title_encrypted
    if (updateData.item_type) updatePayload.item_type = updateData.item_type
    if (updateData.tags) updatePayload.tags = updateData.tags
    if (updateData.metadata) updatePayload.metadata = updateData.metadata
    if (updateData.is_favorite !== undefined) updatePayload.is_favorite = updateData.is_favorite
    if (updateData.password_strength !== undefined) updatePayload.password_strength = typeof updateData.password_strength === 'string' ? parseInt(updateData.password_strength) : updateData.password_strength
    if (updateData.password_last_changed) updatePayload.password_last_changed = updateData.password_last_changed
    if (updateData.requires_password_change !== undefined) updatePayload.requires_password_change = updateData.requires_password_change

    const { data, error } = await supabase
      .from('vault_items')
      .update(updatePayload)
      .eq('id', itemId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw new Error('Failed to update vault item')
    return data
}

// Delete Vault Item
export async function deleteVaultItem(itemId: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    // Verify ownership
    const { data: existingItem, error: fetchError } = await supabase
      .from('vault_items')
      .select('user_id')
      .eq('id', itemId)
      .single()
    if (fetchError || !existingItem) throw new Error('Item not found')
    if (existingItem.user_id !== user.id) throw new Error('Unauthorized: You do not own this item')

    const { error } = await supabase
      .from('vault_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (error) throw new Error('Failed to delete vault item')
}

// Get Vault Items
export async function getVaultItems(vaultId: string, page = 1, pageSize = 50) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('vault_items')
      .select('*', { count: 'exact' })
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw new Error('Failed to fetch vault items')
    return { data: data || [], total: count ?? 0, page, pageSize }
}

// Get Vault Item by ID
export async function getVaultItemById(itemId: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (error) throw new Error('Vault item not found')
    return data
}

// Search Vault Items
export async function searchVaultItems(vaultId: string, searchTerm: string) {
    const { data: items } = await getVaultItems(vaultId, 1, 1000)
    
    const filteredItems = items.filter((item: VaultItemRow) =>
      item.title_encrypted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return filteredItems
}

// Filter by Type
export async function getVaultItemsByType(vaultId: string, type: string) {
    const { data: items } = await getVaultItems(vaultId, 1, 1000)
    
    return items.filter((item: VaultItemRow) => item.item_type === type)
}

// Generate a signed URL for a vault file (for previewing images/videos/documents)
export async function getVaultFileSignedUrl(storagePath: string, bucket = 'vault-files', expiresIn = 3600) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresIn)

  if (error) {
    logger.error('Error creating signed URL', error, { storagePath, bucket, userId: user.id })
    throw new Error('Failed to generate file URL')
  }

  return data.signedUrl
}

// Download a vault file and return as base64 (for client-side download)
export async function downloadVaultFile(storagePath: string, bucket = 'vault-files') {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(storagePath)

  if (error) {
    logger.error('Error downloading file', error, { storagePath, bucket, userId: user.id })
    throw new Error('Failed to download file')
  }

  const arrayBuffer = await data.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const mimeType = data.type || 'application/octet-stream'

  return { base64, mimeType }
}

// Upload a vault item file to storage (server-side)
export async function uploadVaultItemFile(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const file = formData.get('file') as File
  const folder = (formData.get('folder') as string) || 'documents'
  if (!file) throw new Error('No file provided')

  // Validate file size (100MB max)
  const MAX_FILE_SIZE = 100 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
  }

  const timestamp = Date.now()
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `${user.id}/${folder}/${timestamp}_${sanitizedFileName}`

  const { data, error } = await supabase.storage
    .from('vault-files')
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (error) {
    logger.error('Vault file upload error', error, { userId: user.id })
    throw new Error('Failed to upload file')
  }

  return { filePath: data.path, fileSize: file.size }
}

// NOTE: updateVaultItemCount removed - item_count field doesn't exist in vaults table schema
// To get item counts, query vault_items table with count aggregation
