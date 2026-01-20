import { supabase } from '../../lib/supabase'

// Digital Assets Management Actions
export const digitalAssetActions = {
  // Create Digital Asset
  createDigitalAsset: async (assetData: any) => {
    const { data, error } = await supabase
      .from('digital_assets')
      .insert({
        user_id: assetData.user_id,
        name: assetData.name,
        type: assetData.type || 'other',
        url: assetData.url,
        username: assetData.username,
        encrypted_password: assetData.encryptedPassword,
        notes: assetData.notes,
        beneficiary_id: assetData.beneficiaryId || null,
        instructions: assetData.instructions,
        status: assetData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Digital Asset
  updateDigitalAsset: async (assetId: string, updateData: any) => {
    const { data, error } = await supabase
      .from('digital_assets')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Digital Asset
  deleteDigitalAsset: async (assetId: string) => {
    const { error } = await supabase
      .from('digital_assets')
      .delete()
      .eq('id', assetId)

    if (error) throw new Error(error.message)
  },

  // Get Digital Asset by ID
  getDigitalAssetById: async (assetId: string) => {
    const { data, error } = await supabase
      .from('digital_assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get All Digital Assets for User
  getAllDigitalAssets: async (userId: string) => {
    const { data, error } = await supabase
      .from('digital_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Update Asset Status
  updateAssetStatus: async (assetId: string, status: string) => {
    const { data } = await supabase
      .from('digital_assets')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    return data
  },

  // Assign Beneficiary
  assignBeneficiary: async (assetId: string, beneficiaryId: string) => {
    const { data } = await supabase
      .from('digital_assets')
      .update({ 
        beneficiary_id: beneficiaryId,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    return data
  },

  // Update Instructions
  updateInstructions: async (assetId: string, instructions: string) => {
    const { data } = await supabase
      .from('digital_assets')
      .update({ 
        instructions,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    return data
  },

  // Get Digital Asset Statistics
  getDigitalAssetStats: async (userId: string) => {
    const { data: assets } = await digitalAssetActions.getAllDigitalAssets(userId)
    
    const stats = {
      totalAssets: assets.length,
      activeAssets: assets.filter(a => a.status === 'active').length,
      inactiveAssets: assets.filter(a => a.status === 'inactive').length,
      archivedAssets: assets.filter(a => a.status === 'archived').length,
      socialMediaAssets: assets.filter(a => a.type === 'social_media').length,
      emailAssets: assets.filter(a => a.type === 'email').length,
      cloudStorageAssets: assets.filter(a => a.type === 'cloud_storage').length,
      cryptoWalletAssets: assets.filter(a => a.type === 'crypto_wallet').length,
      domainAssets: assets.filter(a => a.type === 'domain').length,
      bankAccountAssets: assets.filter(a => a.type === 'bank_account').length,
      subscriptionAssets: assets.filter(a => a.type === 'subscription').length,
      otherAssets: assets.filter(a => a.type === 'other').length,
      withBeneficiary: assets.filter(a => a.beneficiary_id).length,
      withUsername: assets.filter(a => a.username).length,
      withPassword: assets.filter(a => a.encrypted_password).length,
      withUrl: assets.filter(a => a.url).length,
      withNotes: assets.filter(a => a.notes).length
    }

    return stats
  },

  // Search Digital Assets
  searchDigitalAssets: async (userId: string, searchTerm: string) => {
    const { data: assets } = await digitalAssetActions.getAllDigitalAssets(userId)
    
    const filteredAssets = assets.filter(asset =>
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filteredAssets
  },

  // Filter by Type
  getDigitalAssetsByType: async (userId: string, type: string) => {
    const { data: assets } = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter(asset => asset.type === type)
  },

  // Filter by Status
  getDigitalAssetsByStatus: async (userId: string, status: string) => {
    const { data: assets } = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter(asset => asset.status === status)
  },

  // Filter by Beneficiary
  getDigitalAssetsByBeneficiary: async (userId: string, beneficiaryId: string) => {
    const { data: assets } = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter(asset => asset.beneficiary_id === beneficiaryId)
  },

  // Get Assets Without Beneficiary
  getAssetsWithoutBeneficiary: async (userId: string) => {
    const { data: assets } = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter(asset => !asset.beneficiary_id)
  }
}
