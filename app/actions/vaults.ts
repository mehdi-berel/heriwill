"use server"

import { createServerSupabaseClient } from '../../lib/supabase'
import { logger } from '../../lib/utils/logger'
import type { Database } from '../../lib/database.types'
import { checkStorageLimit, checkVaultLimit } from '../../lib/subscription-limits'

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
export const vaultActions = {
  // Create Vault
  createVault: async (vaultData: VaultInsert) => {
    // Check vault limit
    if (vaultData.user_id) {
      const vaultLimitCheck = await checkVaultLimit(vaultData.user_id)
      if (!vaultLimitCheck.canCreate) {
        throw new Error(`Vault limit reached. You can create up to ${vaultLimitCheck.limit} vault(s) on your ${vaultLimitCheck.tier} plan. Upgrade to create more vaults.`)
      }

      // Check storage limit if vault has initial data
      const vaultDataObj = (vaultData as { vault_data?: { size?: number } | null }).vault_data
      const initialSize = vaultDataObj?.size || 0
      if (initialSize > 0) {
        const storageLimitCheck = await checkStorageLimit(vaultData.user_id, initialSize)
        if (!storageLimitCheck.canUpload) {
          throw new Error(`Storage limit exceeded. You're using ${storageLimitCheck.currentUsageGB}GB of ${storageLimitCheck.limitGB}GB. Upgrade to get more storage.`)
        }
      }
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('vaults')
      .insert(vaultData)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Vault
  updateVault: async (vaultId: string, updateData: VaultUpdate) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('vaults')
      .update(updateData)
      .eq('id', vaultId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Vault
  deleteVault: async (vaultId: string) => {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('id', vaultId)

    if (error) throw new Error(error.message)
  },

  // Get Vault by ID
  getVaultById: async (vaultId: string) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get All Vaults for User
  getAllVaults: async (userId: string) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Update Last Accessed
  updateLastAccessed: async (vaultId: string) => {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('vaults')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', vaultId)
      .select()
      .single()

    return data
  },

  // Toggle Favorite - Note: is_favorite column doesn't exist in vaults table
  toggleFavorite: async (vaultId: string, isFavorite: boolean) => {
    // This function is deprecated as is_favorite doesn't exist in the vaults schema
    logger.warn('toggleFavorite is deprecated - is_favorite column does not exist')
    return { id: vaultId, is_favorite: isFavorite }
  },

  // Lock/Unlock Vault
  toggleLock: async (vaultId: string, isLocked: boolean) => {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('vaults')
      .update({ is_locked: isLocked })
      .eq('id', vaultId)
      .select()
      .single()

    return data
  },

  // Share/Unshare Vault
  toggleShare: async (vaultId: string, isShared: boolean) => {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('vaults')
      .update({ is_shared: isShared })
      .eq('id', vaultId)
      .select()
      .single()

    return data
  },

  // Get Vault Statistics
  getVaultStats: async (userId: string) => {
    const vaults = await vaultActions.getAllVaults(userId)
    
    const stats = {
      totalVaults: vaults.length,
      sharedVaults: vaults.filter((v: VaultRow) => v.is_shared).length,
      recentlyAccessed: vaults.filter((v: VaultRow) => {
        return v.last_accessed && 
          new Date(v.last_accessed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }).length
    }

    return stats
  },

  // Search and Filter
  searchVaults: async (userId: string, searchTerm: string) => {
    const vaults = await vaultActions.getAllVaults(userId)
    
    const filteredVaults = vaults.filter((vault: VaultRow) =>
      vault.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filteredVaults
  },

  // Filter by Category
  getVaultsByCategory: async (userId: string, category: string) => {
    const vaults = await vaultActions.getAllVaults(userId)
    
    return vaults.filter((vault: VaultRow) => vault.category === category)
  },

  // Filter by Status - removed getFavoriteVaults and getEncryptedVaults as these properties don't exist on vaults table

  getSharedVaults: async (userId: string) => {
    const vaults = await vaultActions.getAllVaults(userId)
    
    return vaults.filter((vault: VaultRow) => vault.is_shared)
  }
}

// Vault Items Actions
export const vaultItemActions = {
  // Create Vault Item
  createVaultItem: async (itemData: VaultItemData) => {
    // Generate unique storage path (required and must be unique)
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const storagePath = itemData.storage_path || `${itemData.user_id}/${itemData.vault_id}/${timestamp}-${randomId}`
    
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('vault_items')
      .insert({
        user_id: itemData.user_id,
        vault_id: itemData.vault_id,
        title_encrypted: itemData.title_encrypted || itemData.title || 'Untitled',
        item_type: (itemData.item_type || itemData.type || 'other') as Database["public"]["Enums"]["vault_item_type"],
        file_size: itemData.file_size || itemData.size || null,
        storage_path: storagePath,
        storage_bucket: itemData.storage_bucket || 'vault-items',
        tags: itemData.tags || [],
        metadata: (itemData.metadata || {}) as Database['public']['Tables']['vault_items']['Insert']['metadata'],
        is_favorite: itemData.is_favorite || false,
        password_strength: typeof itemData.password_strength === 'string' ? parseInt(itemData.password_strength) : itemData.password_strength || null,
        password_last_changed: itemData.password_last_changed || null,
        requires_password_change: itemData.requires_password_change || false
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Vault Item
  updateVaultItem: async (itemId: string, updateData: VaultItemUpdate) => {
    const updatePayload: VaultItemUpdate = {}
    if (updateData.title_encrypted) updatePayload.title_encrypted = updateData.title_encrypted
    if (updateData.item_type) updatePayload.item_type = updateData.item_type
    if (updateData.tags) updatePayload.tags = updateData.tags
    if (updateData.metadata) updatePayload.metadata = updateData.metadata
    if (updateData.is_favorite !== undefined) updatePayload.is_favorite = updateData.is_favorite
    if (updateData.password_strength !== undefined) updatePayload.password_strength = typeof updateData.password_strength === 'string' ? parseInt(updateData.password_strength) : updateData.password_strength
    if (updateData.password_last_changed) updatePayload.password_last_changed = updateData.password_last_changed
    if (updateData.requires_password_change !== undefined) updatePayload.requires_password_change = updateData.requires_password_change

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('vault_items')
      .update(updatePayload)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Vault Item
  deleteVaultItem: async (itemId: string) => {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('vault_items')
      .delete()
      .eq('id', itemId)

    if (error) throw new Error(error.message)
  },

  // Get Vault Items
  getVaultItems: async (vaultId: string) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Get Vault Item by ID
  getVaultItemById: async (itemId: string) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Search Vault Items
  searchVaultItems: async (vaultId: string, searchTerm: string) => {
    const items = await vaultItemActions.getVaultItems(vaultId)
    
    const filteredItems = items.filter((item: VaultItemRow) =>
      item.title_encrypted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return filteredItems
  },

  // Filter by Type
  getVaultItemsByType: async (vaultId: string, type: string) => {
    const items = await vaultItemActions.getVaultItems(vaultId)
    
    return items.filter((item: VaultItemRow) => item.item_type === type)
  },

  // NOTE: updateVaultItemCount removed - item_count field doesn't exist in vaults table schema
  // To get item counts, query vault_items table with count aggregation
}
