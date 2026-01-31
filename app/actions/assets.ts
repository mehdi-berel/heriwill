import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database'

type DigitalAssetRow = Database['public']['Tables']['digital_assets']['Row']

interface DigitalAssetData {
  user_id: string
  name: string
  type?: string
  url?: string
  username?: string
  encryptedPassword?: string
  notes?: string
  beneficiaryId?: string | null
  instructions?: string
  status?: string
}

interface DigitalAssetUpdateData {
  [key: string]: unknown
}

// Digital Assets Management Actions
export const digitalAssetActions = {
  // Create Digital Asset
  createDigitalAsset: async (assetData: DigitalAssetData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('digital_assets') as any)
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
  updateDigitalAsset: async (assetId: string, updateData: DigitalAssetUpdateData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('digital_assets') as any)
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
  getAllDigitalAssets: async (userId: string): Promise<DigitalAssetRow[]> => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('digital_assets') as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('digital_assets') as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('digital_assets') as any)
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
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    const stats = {
      totalAssets: assets.length,
      activeAssets: assets.filter((a: DigitalAssetRow) => a.status === 'active').length,
      inactiveAssets: assets.filter((a: DigitalAssetRow) => a.status === 'inactive').length,
      archivedAssets: assets.filter((a: DigitalAssetRow) => a.status === 'archived').length,
      socialMediaAssets: assets.filter((a: DigitalAssetRow) => a.type === 'social_media').length,
      emailAssets: assets.filter((a: DigitalAssetRow) => a.type === 'email').length,
      cloudStorageAssets: assets.filter((a: DigitalAssetRow) => a.type === 'cloud_storage').length,
      cryptoWalletAssets: assets.filter((a: DigitalAssetRow) => a.type === 'crypto_wallet').length,
      domainAssets: assets.filter((a: DigitalAssetRow) => a.type === 'domain').length,
      bankAccountAssets: assets.filter((a: DigitalAssetRow) => a.type === 'bank_account').length,
      subscriptionAssets: assets.filter((a: DigitalAssetRow) => a.type === 'subscription').length,
      otherAssets: assets.filter((a: DigitalAssetRow) => a.type === 'other').length,
      withBeneficiary: assets.filter((a: DigitalAssetRow) => a.beneficiary_id).length,
      withUsername: assets.filter((a: DigitalAssetRow) => a.username).length,
      withPassword: assets.filter((a: DigitalAssetRow) => a.encrypted_password).length,
      withUrl: assets.filter((a: DigitalAssetRow) => a.url).length,
      withNotes: assets.filter((a: DigitalAssetRow) => a.notes).length
    }

    return stats
  },

  // Search Digital Assets
  searchDigitalAssets: async (userId: string, searchTerm: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    const filteredAssets = assets.filter((asset: DigitalAssetRow) =>
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filteredAssets
  },

  // Filter by Type
  getDigitalAssetsByType: async (userId: string, type: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter((asset: DigitalAssetRow) => asset.type === type)
  },

  // Filter by Status
  getDigitalAssetsByStatus: async (userId: string, status: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter((asset: DigitalAssetRow) => asset.status === status)
  },

  // Filter by Beneficiary
  getDigitalAssetsByBeneficiary: async (userId: string, beneficiaryId: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter((asset: DigitalAssetRow) => asset.beneficiary_id === beneficiaryId)
  },

  // Get Assets Without Beneficiary
  getAssetsWithoutBeneficiary: async (userId: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter((asset: DigitalAssetRow) => !asset.beneficiary_id)
  }
}
