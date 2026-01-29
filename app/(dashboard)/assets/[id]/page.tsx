"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { AssetDetail } from "@/components/module/assets/asset-detail"
import { AssetForm } from "@/components/module/assets/asset-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { physicalAssetActions } from "@/app/actions/physical-assets"
import { User } from "@supabase/supabase-js"

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
  full_name_encrypted: string
  relationship: string
}

export default function AssetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const assetId = params.id as string

  useState<User | null>(null)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [vaults, setVaults] = useState<Vault[]>([])
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadAsset = useCallback(async (id: string) => {
    try {
      const data = await physicalAssetActions.getAssetById(id)
      setAsset(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading asset:', error)
      setLoading(false)
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
        console.error('Error loading vaults:', error)
        return
      }

      setVaults(data || [])
    } catch (error) {
      console.error('Error loading vaults:', error)
    }
  }, [])

  const loadHeirs = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('heirs')
        .select('id, full_name_encrypted, relationship')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('full_name_encrypted', { ascending: true })

      if (error) {
        console.error('Error loading heirs:', error)
        return
      }

      setHeirs(data || [])
    } catch (error) {
      console.error('Error loading heirs:', error)
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
      const updatedAsset = await physicalAssetActions.updateAsset(asset.id, assetData)
      setAsset(updatedAsset)
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating asset:', error)
      alert('Failed to update asset. Please try again.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!asset) return

    try {
      await physicalAssetActions.deleteAsset(asset.id)
      router.push("/assets")
    } catch (error) {
      console.error('Error deleting asset:', error)
      alert('Failed to delete asset. Please try again.')
    }
  }

  const handleUploadDocument = async (files: File[]) => {
    if (!asset || files.length === 0) return

    try {
      // Upload files to Supabase Storage
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${asset.id}/${Date.now()}.${fileExt}`
        const filePath = `asset-documents/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Error uploading file:', uploadError)
          continue
        }

        // Add document reference to asset
        await physicalAssetActions.addDocument(asset.id, filePath)
      }

      // Reload asset to get updated documents
      await loadAsset(asset.id)
    } catch (error) {
      console.error('Error uploading documents:', error)
      alert('Failed to upload documents. Please try again.')
    }
  }

  const handleDownloadDocument = async (docPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(docPath)

      if (error) {
        console.error('Error downloading document:', error)
        return
      }

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = docPath.split('/').pop() || 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const handleDeleteDocument = async (docPath: string) => {
    if (!asset) return

    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([docPath])

      if (deleteError) {
        console.error('Error deleting document:', deleteError)
      }

      // Remove reference from asset
      await physicalAssetActions.removeDocument(asset.id, docPath)

      // Reload asset
      await loadAsset(asset.id)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground">Loading asset...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!asset) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground">Asset not found</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/assets")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assets
            </Button>
          </div>
        </div>

        {/* Asset Detail Component */}
        <AssetDetail
          asset={asset}
          onBack={() => router.push("/assets")}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUploadDocument={handleUploadDocument}
          onDownloadDocument={handleDownloadDocument}
          onDeleteDocument={handleDeleteDocument}
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
    </DashboardLayout>
  )
}
