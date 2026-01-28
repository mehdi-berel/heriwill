import { supabase } from '../../lib/supabase'

// Physical Assets Management Actions (Real Estate, Vehicles, etc.)
export const physicalAssetActions = {
  // Create Asset
  createAsset: async (assetData: any) => {
    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id: assetData.user_id,
        name: assetData.name,
        type: assetData.type,
        description: assetData.description || null,
        value: assetData.value || null,
        location: assetData.location || null,
        ownership_type: assetData.ownership_type,
        vault_id: assetData.vault_id || null,
        heir_ids: assetData.heir_ids || [],
        documents: assetData.documents || [],
        notes: assetData.notes || null
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Asset
  updateAsset: async (assetId: string, updateData: any) => {
    const { data, error } = await supabase
      .from('assets')
      .update({
        name: updateData.name,
        type: updateData.type,
        description: updateData.description || null,
        value: updateData.value || null,
        location: updateData.location || null,
        ownership_type: updateData.ownership_type,
        vault_id: updateData.vault_id || null,
        heir_ids: updateData.heir_ids || [],
        documents: updateData.documents || [],
        notes: updateData.notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Asset
  deleteAsset: async (assetId: string) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)

    if (error) throw new Error(error.message)
  },

  // Get Asset by ID
  getAssetById: async (assetId: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get All Assets for User
  getAllAssets: async (userId: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Get Assets by Type
  getAssetsByType: async (userId: string, type: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Get Assets by Vault
  getAssetsByVault: async (vaultId: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Search Assets
  searchAssets: async (userId: string, searchTerm: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Get Asset Statistics
  getAssetStats: async (userId: string) => {
    const assets = await physicalAssetActions.getAllAssets(userId)
    
    const stats = {
      totalAssets: assets.length,
      totalValue: assets.reduce((sum, asset) => sum + (asset.value || 0), 0),
      realEstateCount: assets.filter(a => a.type === 'real_estate').length,
      vehicleCount: assets.filter(a => a.type === 'vehicle').length,
      bankAccountCount: assets.filter(a => a.type === 'bank_account').length,
      investmentCount: assets.filter(a => a.type === 'investment').length,
      insuranceCount: assets.filter(a => a.type === 'insurance').length,
      personalPropertyCount: assets.filter(a => a.type === 'personal_property').length,
      businessCount: assets.filter(a => a.type === 'business').length,
      otherCount: assets.filter(a => a.type === 'other').length,
      withVault: assets.filter(a => a.vault_id).length,
      withHeirs: assets.filter(a => a.heir_ids && a.heir_ids.length > 0).length,
      withDocuments: assets.filter(a => a.documents && a.documents.length > 0).length,
      soleOwnership: assets.filter(a => a.ownership_type === 'sole').length,
      jointOwnership: assets.filter(a => a.ownership_type === 'joint').length
    }

    return stats
  },

  // Assign to Vault
  assignToVault: async (assetId: string, vaultId: string | null) => {
    const { data, error } = await supabase
      .from('assets')
      .update({ 
        vault_id: vaultId,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Assign Heirs
  assignHeirs: async (assetId: string, heirIds: string[]) => {
    const { data, error } = await supabase
      .from('assets')
      .update({ 
        heir_ids: heirIds,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Add Document
  addDocument: async (assetId: string, documentName: string) => {
    const { data: asset } = await physicalAssetActions.getAssetById(assetId)
    const documents = asset.documents || []
    
    const { data, error } = await supabase
      .from('assets')
      .update({ 
        documents: [...documents, documentName],
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Remove Document
  removeDocument: async (assetId: string, documentName: string) => {
    const { data: asset } = await physicalAssetActions.getAssetById(assetId)
    const documents = (asset.documents || []).filter((doc: string) => doc !== documentName)
    
    const { data, error } = await supabase
      .from('assets')
      .update({ 
        documents,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }
}
