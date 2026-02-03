"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { VaultDetail } from "@/components/module/vaults/vault-detail"
import { VaultForm } from "@/components/module/vaults/vault-form"
import { VaultAssign } from "@/components/module/vaults/vault-assign"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Trash2, Users, Scale } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { vaultItemActions, vaultActions } from "@/app/actions/vaults"
import { User } from "@supabase/supabase-js"
import { toast } from "@/lib/utils/toast"
import { logger } from "@/lib/utils/logger"

interface VaultFormData {
  name: string
  description: string
  category: string
}

interface ItemData {
  id?: string
  title: string
  type: string
  tags: string[]
  metadata?: Record<string, unknown>
}

interface Vault {
  id: string
  name: string
  description: string
  category: 'share' | 'delete' | 'pro'
  is_locked: boolean
  is_shared: boolean
  item_count: number
  created_at: string
  last_accessed?: string
  icon?: string
  color?: string
  access_control: {
    allowedHeirs: string[]
    requireApproval: boolean
  }
  death_settings: {
    notifyContacts: boolean
    triggerAfterDays: number
    instructions: string
  }
  is_inherited?: boolean
}

type VaultItemType = 'password' | 'document' | 'video' | 'image' | 'note' | 'crypto' | 'bank' | 'other' | 'legal' | 'assets'

interface VaultItemMetadata {
  username?: string
  password?: string
  url?: string
  walletAddress?: string
  privateKey?: string
  network?: string
  content?: string
  fileName?: string
  fileUrl?: string
  fileSize?: string
  fileSizeBytes?: number
  description?: string
  linkedDocumentId?: string
  linkedAssetId?: string
  linkedItemType?: 'legal' | 'asset'
}

interface VaultItem {
  id?: string
  title: string
  type: VaultItemType
  metadata: VaultItemMetadata
  isEncrypted: boolean
  tags: string[]
  createdAt?: string
  updatedAt?: string
  storage_path?: string
}

export default function VaultDetailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [vault, setVault] = useState<Vault | null>(null)
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()
  const params = useParams()
  const vaultId = params.id as string

  const loadVault = useCallback(async (id: string, userId: string) => {
    try {
      // First try to load as owned vault
      const { data: ownedVault } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (ownedVault) {
        setVault({ ...ownedVault, item_count: 0 } as unknown as Vault)
        return
      }

      // If not owned, check if it's shared with user
      const { data: sharedVault } = await supabase
        .from('shared_vaults')
        .select(`
          owner_id,
          vaults (*)
        `)
        .eq('vault_id', id)
        .eq('shared_with_user_id', userId)
        .eq('is_active', true)
        .eq('accepted', true)
        .single()

      if (sharedVault) {
        const typedSharedVault = sharedVault as {
          owner_id: string
          vaults: Record<string, unknown>
        }
        
        if (typedSharedVault.vaults) {
          // User has access via shared_vaults (inherited)
          setVault({
            ...typedSharedVault.vaults,
            is_inherited: true
          } as Vault)
          return
        }
      }

      // No access
      logger.error('No access to vault', null, { vaultId: id, userId })
      toast.error('You do not have access to this vault')
      router.push("/vaults")
    } catch (error) {
      logger.error('Error loading vault', error, { vaultId: id, userId })
      toast.error('Failed to load vault', 'Please try again')
      router.push("/vaults")
    }
  }, [router])

  const loadVaultItems = useCallback(async (vaultId: string) => {
    try {
      const { data: items, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('vault_id', vaultId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      interface VaultItemRaw {
        id: string
        title_encrypted?: string
        item_type: string
        file_size?: number | null
        created_at: string
        updated_at: string
        tags?: string[] | null
        metadata?: Record<string, unknown> | null
      }
      
      // Valid item types
      const validTypes: VaultItemType[] = ['password', 'document', 'video', 'image', 'note', 'crypto', 'bank', 'other', 'legal', 'assets']
      
      const mappedItems: VaultItem[] = ((items || []) as VaultItemRaw[]).map((item: VaultItemRaw) => {
        // Ensure item_type is valid, default to 'other' if not
        const itemType = validTypes.includes(item.item_type as VaultItemType) 
          ? (item.item_type as VaultItemType)
          : 'other'
        
        return {
          id: item.id,
          title: item.title_encrypted || 'Untitled',
          type: itemType,
          metadata: (item.metadata as VaultItemMetadata) || {
            fileSizeBytes: item.file_size || 0
          },
          isEncrypted: true,
          tags: item.tags || [],
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }
      })
      
      setVaultItems(mappedItems)
    } catch (error) {
      logger.error('Error loading vault items', error, { vaultId })
      setVaultItems([])
    }
  }, [])

  useEffect(() => {
    if (!vaultId) {
      router.push("/vaults")
      return
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load vault data
      await Promise.all([
        loadVault(vaultId, user.id),
        loadVaultItems(vaultId)
      ])
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
        if (vaultId) {
          loadVault(vaultId, session.user.id)
          loadVaultItems(vaultId)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, vaultId, loadVault, loadVaultItems])

  if (!vault) return null

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleEditSubmit = async (formData: VaultFormData) => {
    try {
      await vaultActions.updateVault(vaultId, formData)
      
      if (user) {
        await loadVault(vaultId, user.id)
      }
      setShowEditModal(false)
      toast.success('Vault updated successfully')
    } catch (error) {
      logger.error('Error updating vault', error, { vaultId: vault?.id })
      toast.error('Failed to update vault. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!vault) return

    try {
      await vaultActions.deleteVault(vault.id)
      toast.success('Vault deleted successfully')
      router.push("/vaults")
    } catch (error) {
      logger.error('Error deleting vault', error, { vaultId })
      toast.error('Failed to delete vault. Please try again.')
    }
  }

  const handleAssignHeirs = () => {
    setShowAssignModal(true)
  }

  const handleSaveHeirAssignment = async (heirIds: string[]) => {
    if (!vault) return

    try {
      // Update vault with assigned heir IDs using server action
      await vaultActions.updateVault(vault.id, {
        access_control: {
          allowedHeirs: heirIds,
          requireApproval: vault.access_control?.requireApproval || false
        } as never
      })

      setVault({
        ...vault,
        access_control: {
          allowedHeirs: heirIds,
          requireApproval: vault.access_control?.requireApproval || false
        }
      })
      setShowAssignModal(false)
      toast.success('Heirs assigned successfully')
    } catch (error) {
      logger.error('Error assigning heirs', error, { vaultId })
      toast.error('Failed to assign heirs. Please try again.')
    }
  }

  const handleSaveItem = async (itemData: VaultItem | ItemData) => {
    if (!vault || !user) return

    try {
      // Handle both VaultItem (from ItemForm) and ItemData (legacy) formats
      const isVaultItem = 'isEncrypted' in itemData
      const metadata = isVaultItem ? (itemData as VaultItem).metadata : (itemData.metadata || {})
      
      if (itemData.id) {
        // Update existing item
        await vaultItemActions.updateVaultItem(itemData.id, {
          title_encrypted: itemData.title,
          item_type: itemData.type as 'password' | 'document' | 'video' | 'image' | 'note' | 'crypto' | 'bank' | 'other' | 'legal' | 'assets',
          tags: itemData.tags,
          metadata: JSON.parse(JSON.stringify(metadata))
        })
      } else {
        // Get vault owner's user_id from the vault
        const { data: vaultData } = await supabase
          .from('vaults')
          .select('user_id')
          .eq('id', vaultId)
          .single() as { data: { user_id: string } | null }
        
        if (!vaultData?.user_id) {
          throw new Error('Vault owner not found')
        }
        
        // Create new item with vault owner's user_id (allows shared users to add items)
        await vaultItemActions.createVaultItem({
          user_id: vaultData.user_id,
          vault_id: vaultId,
          title_encrypted: itemData.title,
          item_type: itemData.type,
          tags: itemData.tags || [],
          metadata: JSON.parse(JSON.stringify(metadata))
        })
      }
      
      // Reload items
      await loadVaultItems(vaultId)
    } catch (error) {
      logger.error('Error saving item', error, { vaultId, itemId: itemData.id })
      toast.error('Failed to save item', 'Please try again')
    }
  }

  const handleDownloadItem = async (itemId: string) => {
    try {
      const item = vaultItems.find(i => i.id === itemId)
      if (!item) {
        toast.error('Item not found')
        return
      }

      // If item has a storage_path, download from Supabase Storage
      if (item.storage_path) {
        const { data, error } = await supabase.storage
          .from('vault-files')
          .download(item.storage_path)
        
        if (error) {
          logger.error('Download error', error, { itemId: item.id, storagePath: item.storage_path })
          toast.error('Failed to download file')
          return
        }
        
        // Create download link
        const url = URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = item.title || 'download'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast.success('File downloaded successfully')
      } else {
        // For items without files, export as JSON
        const dataStr = JSON.stringify(item, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${item.title || 'item'}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast.success('Item exported successfully')
      }
    } catch (error) {
      logger.error('Error downloading item', error, { itemId })
      toast.error('Failed to download item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await vaultItemActions.deleteVaultItem(itemId)
      await loadVaultItems(vaultId)
      toast.success('Item deleted successfully')
    } catch (error) {
      logger.error('Error deleting item', error, { itemId })
      toast.error('Failed to delete item')
    }
  }

  if (!vault) return null

  return (
  <div className="p-4 sm:p-6 max-w-7xl mx-auto">
    {/* Header */}
    <div className="mb-6">
      {/* Back button, title, and action buttons on same level */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/vaults")}
          className="h-10 sm:h-9 -ml-2 sm:ml-0 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold leading-tight truncate">{vault.name}</h1>
          {vault.description && (
            <p className="text-xs sm:text-base text-muted-foreground line-clamp-1 sm:line-clamp-2">{vault.description}</p>
          )}
        </div>
        {/* Action buttons - always in row */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {vault.category === 'pro' ? (
            <Button variant="outline" onClick={handleAssignHeirs} className="h-10 sm:h-9">
              <Scale className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Assign Notary</span>
            </Button>
          ) : vault.category !== 'delete' && (
            <Button variant="outline" onClick={handleAssignHeirs} className="h-10 sm:h-9">
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Assign Heirs</span>
            </Button>
          )}
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

    {/* Vault Detail Component */}
    <VaultDetail
      vault={vault}
      items={vaultItems}
      onBack={() => router.push("/vaults")}
      onEdit={() => setShowEditModal(true)}
      onUpload={handleSaveItem as unknown as (files: File[]) => Promise<void>}
      onDownloadItem={handleDownloadItem}
      onDeleteItem={handleDeleteItem}
    />

    {/* Edit Modal */}
    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogTitle className="text-lg sm:text-xl">Edit Vault</DialogTitle>
        {vault && (
          <VaultForm
            initialData={{
              name: vault.name,
              description: vault.description,
              category: vault.category
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </DialogContent>
    </Dialog>

    {/* Assign Heirs/Notary Modal */}
    <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogTitle className="text-lg sm:text-xl">{vault?.category === 'pro' ? 'Assign Notary to Vault' : 'Assign Heirs to Vault'}</DialogTitle>
        {vault && (
          <VaultAssign
            vaultId={vault.id}
            vaultName={vault.name}
            vaultCategory={vault.category}
            assignedHeirIds={vault.access_control.allowedHeirs}
            onAssignHeirs={handleSaveHeirAssignment}
            onClose={() => setShowAssignModal(false)}
          />
        )}
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Modal */}
    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <DialogContent className="max-w-md w-[90vw] sm:w-full">
        <DialogTitle className="text-lg sm:text-xl">Delete Vault</DialogTitle>
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-muted-foreground">
            Are you sure you want to delete this vault? This action cannot be undone and all items will be permanently deleted.
          </p>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="h-11 sm:h-10 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white h-11 sm:h-10 w-full sm:w-auto"
              onClick={() => {
                handleDelete()
                setShowDeleteModal(false)
              }}
            >
              Delete Vault
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}
