import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type AssetRow = Database['public']['Tables']['assets']['Row']
type AssetUpdate = Database['public']['Tables']['assets']['Update']

interface PhysicalAssetData {
  user_id: string
  name: string
  type: 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'
  description?: string | null
  value?: number | null
  location?: string | null
  ownership_type?: 'sole' | 'joint' | 'tenants_in_common' | 'community_property'
  documents?: string[] | null
  notes?: string | null
  vault_id?: string | null
  heir_ids?: string[] | null
}

// Physical Assets Management Actions
export const physicalAssetActions = {
  // Create Physical Asset
  createPhysicalAsset: async (assetData: PhysicalAssetData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('assets') as any)
      .insert({
        user_id: assetData.user_id,
        name: assetData.name,
        type: assetData.type,
        description: assetData.description || null,
        value: assetData.value || null,
        location: assetData.location || null,
        ownership_type: assetData.ownership_type || 'sole',
        documents: assetData.documents || null,
        notes: assetData.notes || null,
        vault_id: assetData.vault_id || null,
        heir_ids: assetData.heir_ids || null
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Physical Asset
  updatePhysicalAsset: async (assetId: string, updateData: AssetUpdate) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('assets') as any)
      .update(updateData)
      .eq('id', assetId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Physical Asset
  deletePhysicalAsset: async (assetId: string) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)

    if (error) throw new Error(error.message)
  },

  // Get Physical Asset by ID
  getPhysicalAssetById: async (assetId: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Alias for getPhysicalAssetById
  getAssetById: async (assetId: string) => {
    return physicalAssetActions.getPhysicalAssetById(assetId)
  },

  // Alias for updatePhysicalAsset
  updateAsset: async (assetId: string, updateData: AssetUpdate) => {
    return physicalAssetActions.updatePhysicalAsset(assetId, updateData)
  },

  // Alias for deletePhysicalAsset
  deleteAsset: async (assetId: string) => {
    return physicalAssetActions.deletePhysicalAsset(assetId)
  },

  // Add document to asset
  addDocument: async (assetId: string, documentPath: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const asset = await physicalAssetActions.getPhysicalAssetById(assetId) as any
    const currentDocuments = asset.documents || []
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('assets') as any)
      .update({
        documents: [...currentDocuments, documentPath]
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Remove document from asset
  removeDocument: async (assetId: string, documentPath: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const asset = await physicalAssetActions.getPhysicalAssetById(assetId) as any
    const currentDocuments = asset.documents || []
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('assets') as any)
      .update({
        documents: currentDocuments.filter((doc: string) => doc !== documentPath)
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get All Physical Assets for User
  getAllPhysicalAssets: async (userId: string): Promise<AssetRow[]> => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Get Physical Assets by Type
  getPhysicalAssetsByType: async (userId: string, type: string) => {
    const assets = await physicalAssetActions.getAllPhysicalAssets(userId)
    return assets.filter((asset: AssetRow) => asset.type === type)
  },

  // Get Physical Asset Statistics
  getPhysicalAssetStats: async (userId: string) => {
    const assets = await physicalAssetActions.getAllPhysicalAssets(userId)
    
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
      totalValue: assets.reduce((sum: number, a: AssetRow) => sum + (a.value || 0), 0),
      withDocuments: assets.filter((a: AssetRow) => a.documents && a.documents.length > 0).length,
      withHeirs: assets.filter((a: AssetRow) => a.heir_ids && a.heir_ids.length > 0).length
    }

    return stats
  }
}
