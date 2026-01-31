"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { VaultDetail } from "@/components/module/vaults/vault-detail"
import { VaultForm } from "@/components/module/vaults/vault-form"
import { VaultAssign } from "@/components/module/vaults/vault-assign"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Trash2, Users, Scale } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { vaultItemActions } from "@/app/actions/vaults"
import { User } from "@supabase/supabase-js"

interface UserProfile {
  user_id: string
  full_name?: string
  email?: string
  avatar_url?: string
  subscription_tier?: string
}

interface VaultFormData {
  name: string
  description: string
  category: string
  is_encrypted: boolean
  tags: string[]
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
  is_encrypted: boolean
  is_locked: boolean
  is_favorite: boolean
  is_shared: boolean
  tags: string[]
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
}

export default function VaultDetailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [vault, setVault] = useState<Vault | null>(null)
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()
  const params = useParams()
  const vaultId = params.id as string

  const loadVault = useCallback(async (id: string) => {
    try {
      const { data } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', id)
        .single()

      setVault(data)
    } catch (error) {
      console.error('Error loading vault:', error)
      router.push("/vaults")
    }
  }, [router])

  const loadVaultItems = useCallback(async (vaultId: string) => {
    try {
      const items = await vaultItemActions.getVaultItems(vaultId)
      
      interface VaultItemRaw {
        id: string
        title_encrypted?: string
        item_type: string
        file_size?: number
        created_at: string
        updated_at: string
        tags?: string[]
        metadata?: Record<string, unknown>
      }
      
      // Valid item types
      const validTypes: VaultItemType[] = ['password', 'document', 'video', 'image', 'note', 'crypto', 'bank', 'other', 'legal', 'assets']
      
      const mappedItems: VaultItem[] = items.map((item: VaultItemRaw) => {
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
      console.error('Error loading vault items:', error)
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
      
      // Load user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setProfile(profileData)
      
      // Load vault data
      await Promise.all([
        loadVault(vaultId),
        loadVaultItems(vaultId)
      ])
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
        if (vaultId) {
          loadVault(vaultId)
          loadVaultItems(vaultId)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, vaultId, loadVault, loadVaultItems])

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleEditSubmit = async (formData: VaultFormData) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('vaults') as any)
        .update(formData)
        .eq('id', vaultId)
      
      await loadVault(vaultId)
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating vault:', error)
    }
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      // Delete vault items first
      await supabase
        .from('vault_items')
        .delete()
        .eq('vault_id', vaultId)
      
      // Delete vault
      await supabase
        .from('vaults')
        .delete()
        .eq('id', vaultId)
      
      router.push("/vaults")
    } catch (error) {
      console.error('Error deleting vault:', error)
      alert('Failed to delete vault. Please try again.')
    }
  }

  const handleAssignHeirs = () => {
    setShowAssignModal(true)
  }

  const handleSaveHeirAssignment = async (heirIds: string[]) => {
    try {
      // Update vault with assigned heir IDs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('vaults') as any)
        .update({ 
          access_control: {
            ...vault?.access_control,
            allowedHeirs: heirIds
          }
        })
        .eq('id', vaultId)
      
      await loadVault(vaultId)
      setShowAssignModal(false)
    } catch (error) {
      console.error('Error assigning heirs:', error)
      alert('Failed to assign heirs. Please try again.')
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
          item_type: itemData.type,
          tags: itemData.tags,
          metadata: JSON.parse(JSON.stringify(metadata))
        })
      } else {
        // Create new item with proper type and metadata
        await vaultItemActions.createVaultItem({
          user_id: user.id,
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
      console.error('Error saving item:', error)
    }
  }

  const handleDownloadItem = async (itemId: string) => {
    // In a real app, this would download the file
    console.log('Downloading item:', itemId)
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await vaultItemActions.deleteVaultItem(itemId)
      await loadVaultItems(vaultId)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!vault) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vault not found</h2>
          <p className="text-muted-foreground mb-4">
            The vault you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Button onClick={() => router.push("/vaults")}>
            Back to Vaults
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/vaults")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{vault.name}</h1>
              <p className="text-muted-foreground">{vault.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {vault.category === 'pro' ? (
              <Button variant="outline" onClick={handleAssignHeirs}>
                <Scale className="h-4 w-4 mr-2" />
                Assign Notary
              </Button>
            ) : vault.category !== 'delete' && (
              <Button variant="outline" onClick={handleAssignHeirs}>
                <Users className="h-4 w-4 mr-2" />
                Assign Heirs
              </Button>
            )}
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>Edit Vault</DialogTitle>
            {vault && (
              <VaultForm
                initialData={{
                  name: vault.name,
                  description: vault.description,
                  category: vault.category,
                  is_encrypted: vault.is_encrypted,
                  tags: vault.tags
                }}
                onSubmit={handleEditSubmit}
                onCancel={() => setShowEditModal(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Heirs/Notary Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>{vault?.category === 'pro' ? 'Assign Notary to Vault' : 'Assign Heirs to Vault'}</DialogTitle>
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
          <DialogContent className="max-w-md">
            <DialogTitle>Delete Vault</DialogTitle>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete this vault? This action cannot be undone and all items will be permanently deleted.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={confirmDelete}
                >
                  Delete Vault
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
