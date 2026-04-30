"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { AssetDetail } from "@/components/module/assets/asset-detail"
import { AssetForm } from "@/components/module/assets/asset-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getDigitalAssetById, updateDigitalAsset, deleteDigitalAsset, uploadAssetDocument, downloadAssetDocument, deleteAssetDocument } from "@/app/actions/assets"
import { toast } from "@/lib/utils/toast"
import { logger } from "@/lib/utils/logger"

interface AssetFormData {
  name: string
  type: 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'
  description?: string
  value?: number
  location?: string
  ownership_type: 'sole' | 'joint' | 'tenants_in_common' | 'community_property'
  vault_id?: string
  heir_ids?: string[]
  documents?: string[]
  notes?: string
}

interface Asset {
  id: string
  name: string
  type: 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'
  description?: string
  value?: number
  location?: string
  ownership_type: 'sole' | 'joint' | 'tenants_in_common' | 'community_property'
  vault_id?: string
  heir_ids?: string[]
  documents?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

interface Vault {
  id: string
  name: string
}

interface Heir {
  id: string
  name: string
  relationship: string
}

export default function AssetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const assetId = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [vaults, setVaults] = useState<Vault[]>([])
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'real_estate': return 'Real Estate'
      case 'vehicle': return 'Vehicle'
      case 'bank_account': return 'Bank Account'
      case 'investment': return 'Investment'
      case 'insurance': return 'Insurance Policy'
      case 'personal_property': return 'Personal Property'
      case 'business': return 'Business Interest'
      default: return 'Other Asset'
    }
  }

  const loadAsset = useCallback(async (id: string) => {
    try {
      const data = await getDigitalAssetById(id)
      setAsset(data as Asset)
    } catch (error) {
      logger.error('Error loading asset', error, { assetId: id })
      toast.error('Failed to load asset', 'Please try again')
      router.push("/assets")
    }
  }, [router])

  const loadVaults = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('vaults')
        .select('id, name')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (error) {
        logger.error('Error loading vaults', error)
        return
      }

      setVaults(data || [])
    } catch (error) {
      logger.error('Error loading vaults', error)
    }
  }, [])

  const loadHeirs = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('heirs')
        .select('id, name, relationship')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        logger.error('Error loading heirs', error)
        return
      }

      setHeirs((data || []) as Heir[])
    } catch (error) {
      logger.error('Error loading heirs', error)
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push("/login")
        return
      }

      await loadAsset(assetId)
      await loadVaults(session.user.id)
      await loadHeirs(session.user.id)
    }

    getUser()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login")
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [router, assetId, loadAsset, loadVaults, loadHeirs])

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const handleEditSubmit = async (assetData: AssetFormData) => {
    if (!asset) return

    try {
      const updatedAsset = await updateDigitalAsset(asset.id, assetData as unknown as Record<string, unknown>)
      setAsset(updatedAsset as Asset)
      setShowEditModal(false)
      toast.success('Asset updated successfully')
    } catch (error) {
      logger.error('Error updating asset', error, { assetId: asset?.id })
      toast.error('Failed to update asset. Please try again.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!asset) return

    try {
      await deleteDigitalAsset(asset.id)
      toast.success('Asset deleted successfully')
      router.push("/assets")
    } catch (error) {
      logger.error('Error deleting asset', error, { assetId })
      toast.error('Failed to delete asset. Please try again.')
    }
  }

  const handleUploadDocument = async (files: File[]) => {
    if (!asset || files.length === 0) return

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        try {
          const filePath = await uploadAssetDocument(asset.id, formData)
          const currentDocs = asset.documents || []
          await updateDigitalAsset(asset.id, { documents: [...currentDocs, filePath] })
        } catch (error) {
          logger.error('Error uploading file', error, { fileName: file.name })
          continue
        }
      }

      await loadAsset(asset.id)
      toast.success('Documents uploaded successfully')
    } catch (error) {
      logger.error('Error uploading documents', error, { assetId: asset.id })
      toast.error('Failed to upload documents. Please try again.')
    }
  }

  const handleDownloadDocument = async (docPath: string) => {
    try {
      const { base64, mimeType, fileName } = await downloadAssetDocument(docPath)
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      logger.error('Error downloading document', error, { docPath })
      toast.error('Failed to download document')
    }
  }

  const handleDeleteDocument = async (docPath: string) => {
    if (!asset) return

    try {
      await deleteAssetDocument(docPath)

      const currentDocs = asset.documents || []
      await updateDigitalAsset(asset.id, { documents: currentDocs.filter(d => d !== docPath) })

      await loadAsset(asset.id)
      toast.success('Document deleted successfully')
    } catch (error) {
      logger.error('Error deleting document', error, { docPath })
      toast.error('Failed to delete document. Please try again.')
    }
  }

  const handleUpdateHeirs = async (heirIds: string[]) => {
    if (!asset) return

    try {
      await updateDigitalAsset(asset.id, { heir_ids: heirIds })
      await loadAsset(asset.id)
      toast.success('Beneficiaries updated successfully')
    } catch (error) {
      logger.error('Error updating heirs', error, { assetId: asset.id })
      toast.error('Failed to update beneficiaries. Please try again.')
      throw error
    }
  }

  if (!asset) return null

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        {/* Back button, title, and action buttons on same level */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/assets")}
            className="h-10 sm:h-9 -ml-2 sm:ml-0 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold leading-tight truncate">{asset.name}</h1>
            <p className="text-xs sm:text-base text-muted-foreground line-clamp-1 sm:line-clamp-2">{getAssetTypeLabel(asset.type)}</p>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Button variant="outline" onClick={handleEdit} className="h-10 sm:h-9">
              <Edit className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white h-10 sm:h-9"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Asset Detail Component */}
      <AssetDetail
        asset={asset}
        heirs={heirs}
        onBack={() => router.push("/assets")}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUploadDocument={handleUploadDocument}
        onDownloadDocument={handleDownloadDocument}
        onDeleteDocument={handleDeleteDocument}
        onUpdateHeirs={handleUpdateHeirs}
      />

      {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>Edit Asset</DialogTitle>
            {asset && (
              <AssetForm
                initialData={{
                  name: asset.name,
                  type: asset.type,
                  description: asset.description,
                  value: asset.value,
                  location: asset.location,
                  ownership_type: asset.ownership_type,
                  vault_id: asset.vault_id,
                  heir_ids: asset.heir_ids
                }}
                vaults={vaults}
                heirs={heirs}
                onSubmit={handleEditSubmit}
                onCancel={() => setShowEditModal(false)}
                isEditing={true}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogTitle>Delete Asset</DialogTitle>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete <span className="font-semibold">{asset.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteConfirm}
                >
                  Delete Asset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}
