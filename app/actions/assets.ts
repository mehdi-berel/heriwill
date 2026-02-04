import { supabase, createServerSupabaseClient } from '@/lib/supabase'
import type { Database } from '../../lib/database.types'

type AssetRow = Database['public']['Tables']['assets']['Row']

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
    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id: assetData.user_id,
        name: assetData.name,
        type: assetData.type || 'other',
        notes: assetData.notes,
        ownership_type: 'sole',
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
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    // Verify ownership before update
    const { data: existingAsset, error: fetchError } = await supabase
      .from('assets')
      .select('user_id')
      .eq('id', assetId)
      .single()

    if (fetchError || !existingAsset) {
      throw new Error('Asset not found')
    }

    if (existingAsset.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this asset')
    }

    const { data, error } = await supabase
      .from('assets')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Digital Asset
  deleteDigitalAsset: async (assetId: string) => {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    // Verify ownership before delete
    const { data: existingAsset, error: fetchError } = await supabase
      .from('assets')
      .select('user_id')
      .eq('id', assetId)
      .single()

    if (fetchError || !existingAsset) {
      throw new Error('Asset not found')
    }

    if (existingAsset.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this asset')
    }

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)
  },

  // Get Digital Asset by ID
  getDigitalAssetById: async (assetId: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get All Digital Assets for User
  getAllDigitalAssets: async (userId: string): Promise<AssetRow[]> => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Update Asset Status
  updateAssetStatus: async (assetId: string) => {
    const { data } = await supabase
      .from('assets')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    return data
  },

  // Assign Beneficiary
  assignBeneficiary: async (assetId: string) => {
    const { data } = await supabase
      .from('assets')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single()

    return data
  },

  // Update Instructions
  updateInstructions: async (assetId: string) => {
    const { data } = await supabase
      .from('assets')
      .update({ 
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
      realEstateAssets: assets.filter((a: AssetRow) => a.type === 'real_estate').length,
      vehicleAssets: assets.filter((a: AssetRow) => a.type === 'vehicle').length,
      bankAccountAssets: assets.filter((a: AssetRow) => a.type === 'bank_account').length,
      investmentAssets: assets.filter((a: AssetRow) => a.type === 'investment').length,
      insuranceAssets: assets.filter((a: AssetRow) => a.type === 'insurance').length,
      personalPropertyAssets: assets.filter((a: AssetRow) => a.type === 'personal_property').length,
      businessAssets: assets.filter((a: AssetRow) => a.type === 'business').length,
      otherAssets: assets.filter((a: AssetRow) => a.type === 'other').length,
      withHeirs: assets.filter((a: AssetRow) => a.heir_ids && a.heir_ids.length > 0).length,
      withNotes: assets.filter((a: AssetRow) => a.notes).length,
      withDocuments: assets.filter((a: AssetRow) => a.documents && a.documents.length > 0).length
    }

    return stats
  },

  // Search Digital Assets
  searchDigitalAssets: async (userId: string, searchTerm: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    const filteredAssets = assets.filter((asset: AssetRow) =>
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filteredAssets
  },

  // Filter by Type
  getDigitalAssetsByType: async (userId: string, type: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter((asset: AssetRow) => asset.type === type)
  },

  // Filter by Ownership Type
  getDigitalAssetsByOwnership: async (userId: string, ownershipType: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter((asset: AssetRow) => asset.ownership_type === ownershipType)
  },

  // Filter by Heir
  getDigitalAssetsByHeir: async (userId: string, heirId: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter((asset: AssetRow) => asset.heir_ids?.includes(heirId))
  },

  // Get Assets Without Heirs
  getAssetsWithoutHeirs: async (userId: string) => {
    const assets = await digitalAssetActions.getAllDigitalAssets(userId)
    
    return assets.filter((asset: AssetRow) => !asset.heir_ids || asset.heir_ids.length === 0)
  }
}
