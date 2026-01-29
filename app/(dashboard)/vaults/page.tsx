"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { VaultForm } from "@/components/module/vaults/vault-form"
import { VaultList } from "@/components/module/vaults/vault-list"
import { VaultListSkeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
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

interface Vault {
  id: string
  user_id: string
  name: string
  description: string | null
  category: 'share_after_death' | 'delete_after_death' | 'sign_off_after_death'
  is_encrypted: boolean | null
  is_locked: boolean | null
  is_favorite: boolean | null
  is_shared: boolean | null
  tags: string[] | null
  created_at: string
  updated_at: string
  last_accessed: string | null
  icon: string | null
  color: string | null
  settings: Record<string, unknown> | null
  access_control: Record<string, unknown> | null
  death_settings: Record<string, unknown> | null
  sort_order: number | null
  item_count: number // Add item_count to interface
}

export default function VaultsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [vaults, setVaults] = useState<Vault[]>([])
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'share_after_death' | 'delete_after_death' | 'sign_off_after_death' | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingVault, setEditingVault] = useState<Vault | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [vaultToDelete, setVaultToDelete] = useState<string | null>(null)
  const router = useRouter()

  const loadVaults = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading vaults:', error)
        return
      }

      if (data) {
        const vaultsWithCounts = await Promise.all(
          data.map(async (vault) => {
            const { count, error: countError } = await supabase
              .from('vault_items')
              .select('*', { count: 'exact', head: true })
              .eq('vault_id', (vault as Record<string, unknown>).id as string)
            
            if (countError) {
              console.error('Error loading vault item count:', countError)
            }
            
            return {
              ...(vault as Record<string, unknown>),
              item_count: count || 0
            }
          })
        )
        setVaults(vaultsWithCounts as unknown as Vault[])
      } else {
        setVaults([])
      }
    } catch (error) {
      console.error('Error loading vaults:', error)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    
    const initializePage = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Auth error:', authError)
          if (isMounted) setLoading(false)
          return
        }
        
        if (!user) {
          if (isMounted) setLoading(false)
          router.push('/login')
          return
        }
        
        if (!isMounted) return
        setUser(user)

        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.error('Profile error:', profileError)
        } else if (isMounted) {
          setProfile(profileData as unknown as UserProfile)
        }

        // Load vaults
        if (isMounted) {
          await loadVaults(user.id)
        }
      } catch (error) {
        console.error('Error initializing page:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializePage()
    
    return () => {
      isMounted = false
    }
  }, [router, loadVaults])

  const handleAddVault = async (formData: VaultFormData) => {
    if (!user) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('vaults') as any)
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          category: formData.category || 'share_after_death',
          is_encrypted: formData.is_encrypted || false,
          is_favorite: false, // Default to false
          is_locked: false,
          is_shared: false,
          tags: formData.tags || [],
          icon: null, // Default
          color: null, // Default
          settings: { // Default settings
            autoLock: true,
            autoLockTimeout: 15,
            twoFactorEnabled: false,
            maxFailedAttempts: 5
          },
          access_control: { // Default access control
            allowedHeirs: [],
            allowedUsers: [],
            requireApproval: true
          },
          death_settings: { // Default death settings
            notifyContacts: true,
            triggerAfterDays: 30,
            instructions: '',
            notifySMS: [],
            notifyEmail: []
          },
          sort_order: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding vault:', error)
        return
      }

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { item_count, ...rest } = data as Record<string, unknown>
        setVaults([{ ...(data as Record<string, unknown>), item_count: 0 } as unknown as Vault, ...vaults])
        setShowForm(false)
        setEditingVault(null)
      }
    } catch (error) {
      console.error('Error adding vault:', error)
    }
  }

  const handleUpdateVault = async (formData: VaultFormData) => {
    if (!editingVault) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('vaults') as any)
        .update({
          name: formData.name,
          description: formData.description || null,
          category: formData.category,
          is_encrypted: formData.is_encrypted,
          // Only update fields present in form
          tags: formData.tags || [],
          last_accessed: new Date().toISOString()
        })
        .eq('id', editingVault.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating vault:', error)
        return
      }

      if (data) {
        const updatedVault = { ...(data as Record<string, unknown>), item_count: editingVault.item_count || 0 }
        setVaults(vaults.map(v => v.id === editingVault.id ? updatedVault as unknown as Vault : v))
        setShowForm(false)
        setEditingVault(null)
      }
    } catch (error) {
      console.error('Error updating vault:', error)
    }
  }

  const handleDeleteVault = (vaultId: string) => {
    setVaultToDelete(vaultId)
    setShowDeleteModal(true)
  }

  const confirmDeleteVault = async () => {
    if (!vaultToDelete) return

    try {
      const { error } = await supabase
        .from('vaults')
        .delete()
        .eq('id', vaultToDelete)
      
      if (error) {
        console.error('Error deleting vault:', error)
        return
      }
      
      setVaults(vaults.filter(v => v.id !== vaultToDelete))
      if (selectedVault?.id === vaultToDelete) {
        setSelectedVault(null)
      }
      
      setShowDeleteModal(false)
      setVaultToDelete(null)
    } catch (error) {
      console.error('Error deleting vault:', error)
    }
  }

  const handleVaultSelect = (vault: Vault) => {
    router.push(`/vaults/${vault.id}`)
  }

  const handleVaultEdit = (vault: Vault) => {
    setEditingVault(vault)
    setShowForm(true)
  }

  // Unused functions - kept for future implementation
  // const handleUploadFiles = async (files: File[]) => {
  //   if (!selectedVault) return
  //   console.log('Uploading files to vault:', selectedVault.id, files)
  //   const newItems: VaultItem[] = files.map((file, index) => ({
  //     id: `new-${index}`,
  //     name: file.name,
  //     type: 'other' as const,
  //     size: file.size,
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //     is_encrypted: selectedVault.is_encrypted,
  //     tags: []
  //   }))
  //   setVaultItems([...vaultItems, ...newItems])
  // }

  // const handleDownloadItem = async (itemId: string) => {
  //   console.log('Downloading item:', itemId)
  // }

  // const handleDeleteItem = async (itemId: string) => {
  //   setVaultItems(vaultItems.filter(item => item.id !== itemId))
  // }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <DashboardLayout userName="Loading..." onSignOut={handleSignOut}>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="h-9 w-32 bg-background-elevated/50 rounded animate-pulse" />
              <div className="h-12 w-12 bg-background-elevated/50 rounded-full animate-pulse" />
            </div>
            <div className="h-11 bg-background-elevated/50 rounded-xl animate-pulse mb-4" />
          </div>
          <VaultListSkeleton />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Vaults</h1>
            <Button 
              onClick={() => {
                setEditingVault(null)
                setShowForm(true)
              }}
              className="h-12 w-12 rounded-full p-0"
            >
              <span className="text-2xl">+</span>
            </Button>
          </div>
          
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={selectedCategory === 'share_after_death' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === 'share_after_death' ? null : 'share_after_death')}
              className="rounded-lg"
            >
              Share ({vaults.filter(v => v.category === 'share_after_death').length})
            </Button>
            <Button
              variant={selectedCategory === 'delete_after_death' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === 'delete_after_death' ? null : 'delete_after_death')}
              className="rounded-lg"
            >
              Delete ({vaults.filter(v => v.category === 'delete_after_death').length})
            </Button>
            <Button
              variant={selectedCategory === 'sign_off_after_death' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === 'sign_off_after_death' ? null : 'sign_off_after_death')}
              className="rounded-lg"
            >
              Pro ({vaults.filter(v => v.category === 'sign_off_after_death').length})
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search vaults..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background-secondary rounded-xl"
              style={{ borderColor: '#232629' }}
            />
          </div>
        </div>

        {/* Vault Form Modal */}
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open)
          if (!open) setEditingVault(null)
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">
              {editingVault ? 'Edit Vault' : 'Create New Vault'}
            </DialogTitle>
            <VaultForm
              initialData={(editingVault as unknown as Record<string, unknown>) || undefined}
              onSubmit={editingVault ? handleUpdateVault : handleAddVault}
              onCancel={() => {
                setShowForm(false)
                setEditingVault(null)
              }}
            />
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
                  onClick={() => {
                    setShowDeleteModal(false)
                    setVaultToDelete(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteVault}
                >
                  Delete Vault
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Vault List */}
        <VaultList
          vaults={vaults}
          onVaultSelect={handleVaultSelect}
          onVaultEdit={handleVaultEdit}
          onVaultDelete={handleDeleteVault}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
        />
      </div>
    </DashboardLayout>
  )
}
