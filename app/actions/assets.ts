'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
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

// Create Digital Asset
export async function createDigitalAsset(assetData: DigitalAssetData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // Verify user is creating asset for themselves
  if (assetData.user_id !== user.id) throw new Error('Unauthorized: Cannot create asset for another user')

  const { data, error } = await supabase
    .from('assets')
    .insert({
      user_id: user.id,
      name: assetData.name,
      type: assetData.type || 'other',
      notes: assetData.notes,
      ownership_type: 'sole',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw new Error('Failed to create asset')
  return data
}

// Update Digital Asset
export async function updateDigitalAsset(assetId: string, updateData: DigitalAssetUpdateData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: existingAsset, error: fetchError } = await supabase
    .from('assets')
    .select('user_id')
    .eq('id', assetId)
    .single()
  if (fetchError || !existingAsset) throw new Error('Asset not found')
  if (existingAsset.user_id !== user.id) throw new Error('Unauthorized: You do not own this asset')

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

  if (error) throw new Error('Failed to update asset')
  return data
}

// Delete Digital Asset
export async function deleteDigitalAsset(assetId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: existingAsset, error: fetchError } = await supabase
    .from('assets')
    .select('user_id')
    .eq('id', assetId)
    .single()
  if (fetchError || !existingAsset) throw new Error('Asset not found')
  if (existingAsset.user_id !== user.id) throw new Error('Unauthorized: You do not own this asset')

  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId)
    .eq('user_id', user.id)

  if (error) throw new Error('Failed to delete asset')
}

// Get Digital Asset by ID
export async function getDigitalAssetById(assetId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .eq('user_id', user.id)
    .single()

  if (error) throw new Error('Asset not found')
  return data
}

// Get All Digital Assets for User
export async function getAllDigitalAssets(userId: string, page = 1, pageSize = 50): Promise<{ data: AssetRow[]; total: number; page: number; pageSize: number }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')
  if (userId !== user.id) throw new Error('Unauthorized')

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('assets')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error('Failed to fetch assets')
  return { data: data || [], total: count ?? 0, page, pageSize }
}

// Update Asset Status
export async function updateAssetStatus(assetId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data } = await supabase
    .from('assets')
    .update({ 
      updated_at: new Date().toISOString()
    })
    .eq('id', assetId)
    .eq('user_id', user.id)
    .select()
    .single()

  return data
}

// Assign Beneficiary
export async function assignBeneficiary(assetId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data } = await supabase
    .from('assets')
    .update({ 
      updated_at: new Date().toISOString()
    })
    .eq('id', assetId)
    .eq('user_id', user.id)
    .select()
    .single()

  return data
}

// Update Instructions
export async function updateInstructions(assetId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data } = await supabase
    .from('assets')
    .update({ 
      updated_at: new Date().toISOString()
    })
    .eq('id', assetId)
    .eq('user_id', user.id)
    .select()
    .single()

  return data
}

// Get Digital Asset Statistics
export async function getDigitalAssetStats(userId: string) {
  const { data: assets } = await getAllDigitalAssets(userId, 1, 1000)
  
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
}

// Search Digital Assets
export async function searchDigitalAssets(userId: string, searchTerm: string) {
  const { data: assets } = await getAllDigitalAssets(userId, 1, 1000)
  
  const filteredAssets = assets.filter((asset: AssetRow) =>
    asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return filteredAssets
}

// Filter by Type
export async function getDigitalAssetsByType(userId: string, type: string) {
  const { data: assets } = await getAllDigitalAssets(userId, 1, 1000)
  
  return assets.filter((asset: AssetRow) => asset.type === type)
}

// Filter by Ownership Type
export async function getDigitalAssetsByOwnership(userId: string, ownershipType: string) {
  const { data: assets } = await getAllDigitalAssets(userId, 1, 1000)
  
  return assets.filter((asset: AssetRow) => asset.ownership_type === ownershipType)
}

// Filter by Heir
export async function getDigitalAssetsByHeir(userId: string, heirId: string) {
  const { data: assets } = await getAllDigitalAssets(userId, 1, 1000)
  
  return assets.filter((asset: AssetRow) => asset.heir_ids?.includes(heirId))
}

// Get Assets Without Heirs
export async function getAssetsWithoutHeirs(userId: string) {
  const { data: assets } = await getAllDigitalAssets(userId, 1, 1000)
  
  return assets.filter((asset: AssetRow) => !asset.heir_ids || asset.heir_ids.length === 0)
}

// Upload Asset Document to storage
export async function uploadAssetDocument(assetId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const fileExt = file.name.split('.').pop()
  const fileName = `${assetId}/${Date.now()}.${fileExt}`
  const filePath = `asset-documents/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw new Error('Failed to upload document')

  return filePath
}

// Download Asset Document from storage (returns base64)
export async function downloadAssetDocument(docPath: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase.storage
    .from('documents')
    .download(docPath)

  if (error) throw new Error('Failed to download document')

  const arrayBuffer = await data.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const mimeType = data.type || 'application/octet-stream'

  return { base64, mimeType, fileName: docPath.split('/').pop() || 'document' }
}

// Delete Asset Document from storage
export async function deleteAssetDocument(docPath: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { error } = await supabase.storage
    .from('documents')
    .remove([docPath])

  if (error) throw new Error('Failed to delete document')
}
