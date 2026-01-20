import { supabase } from '../../lib/supabase'

// Vault Management Actions
export const vaultActions = {
  // Create Vault
  createVault: async (vaultData: any) => {
    const { data, error } = await supabase
      .from('vaults')
      .insert({
        user_id: vaultData.user_id,
        name: vaultData.name,
        description: vaultData.description,
        category: vaultData.category || 'share_after_death',
        is_encrypted: vaultData.is_encrypted || false,
        is_favorite: vaultData.is_favorite || false,
        tags: vaultData.tags || [],
        access_control: vaultData.access_control || {
          allowedHeirs: [],
          allowedUsers: [],
          requireApproval: true
        },
        death_settings: vaultData.death_settings || {
          notifySMS: [],
          notifyEmail: [],
          instructions: '',
          notifyContacts: true,
          triggerAfterDays: 30
        }
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Vault
  updateVault: async (vaultId: string, updateData: any) => {
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
    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('id', vaultId)

    if (error) throw new Error(error.message)
  },

  // Get Vault by ID
  getVaultById: async (vaultId: string) => {
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
    const { data } = await supabase
      .from('vaults')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', vaultId)
      .select()
      .single()

    return data
  },

  // Toggle Favorite
  toggleFavorite: async (vaultId: string, isFavorite: boolean) => {
    const { data } = await supabase
      .from('vaults')
      .update({ is_favorite: isFavorite })
      .eq('id', vaultId)
      .select()
      .single()

    return data
  },

  // Lock/Unlock Vault
  toggleLock: async (vaultId: string, isLocked: boolean) => {
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
    const { data: vaults } = await vaultActions.getAllVaults(userId)
    
    const stats = {
      totalVaults: vaults.length,
      encryptedVaults: vaults.filter(v => v.is_encrypted).length,
      sharedVaults: vaults.filter(v => v.is_shared).length,
      favoriteVaults: vaults.filter(v => v.is_favorite).length,
      totalItems: vaults.reduce((sum, v) => {
        // This would need to be calculated from vault_items table
        return sum + (v.item_count || 0)
      }, 0),
      recentlyAccessed: vaults.filter(v => {
        return v.last_accessed && 
          new Date(v.last_accessed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }).length
    }

    return stats
  },

  // Search and Filter
  searchVaults: async (userId: string, searchTerm: string) => {
    const { data: vaults } = await vaultActions.getAllVaults(userId)
    
    const filteredVaults = vaults.filter(vault =>
      vault.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return filteredVaults
  },

  // Filter by Category
  getVaultsByCategory: async (userId: string, category: string) => {
    const { data: vaults } = await vaultActions.getAllVaults(userId)
    
    return vaults.filter(vault => vault.category === category)
  },

  // Filter by Status
  getFavoriteVaults: async (userId: string) => {
    const { data: vaults } = await vaultActions.getAllVaults(userId)
    
    return vaults.filter(vault => vault.is_favorite)
  },

  getEncryptedVaults: async (userId: string) => {
    const { data: vaults } = await vaultActions.getAllVaults(userId)
    
    return vaults.filter(vault => vault.is_encrypted)
  },

  getSharedVaults: async (userId: string) => {
    const { data: vaults } = await vaultActions.getAllVaults(userId)
    
    return vaults.filter(vault => vault.is_shared)
  }
}

// Vault Items Actions
export const vaultItemActions = {
  // Create Vault Item
  createVaultItem: async (itemData: any) => {
    const { data, error } = await supabase
      .from('vault_items')
      .insert({
        user_id: itemData.user_id,
        vault_id: itemData.vault_id,
        name: itemData.name,
        type: itemData.type || 'other',
        size: itemData.size || 0,
        content: itemData.content || null,
        file_path: itemData.file_path || null,
        is_encrypted: itemData.is_encrypted || false,
        tags: itemData.tags || [],
        metadata: itemData.metadata || {}
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Vault Item
  updateVaultItem: async (itemId: string, updateData: any) => {
    const { data, error } = await supabase
      .from('vault_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Vault Item
  deleteVaultItem: async (itemId: string) => {
    const { error } = await supabase
      .from('vault_items')
      .delete()
      .eq('id', itemId)

    if (error) throw new Error(error.message)
  },

  // Get Vault Items
  getVaultItems: async (vaultId: string) => {
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
    const { data: items } = await vaultItemActions.getVaultItems(vaultId)
    
    const filteredItems = items.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return filteredItems
  },

  // Filter by Type
  getVaultItemsByType: async (vaultId: string, type: string) => {
    const { data: items } = await vaultItemActions.getVaultItems(vaultId)
    
    return items.filter(item => item.type === type)
  },

  // Update Vault Item Count
  updateVaultItemCount: async (vaultId: string, itemCount: number) => {
    const { data } = await supabase
      .from('vaults')
      .update({ item_count: itemCount })
      .eq('id', vaultId)
      .select()
      .single()

    return data
  }
}
