"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { VaultForm } from "@/components/module/vaults/vault-form"
import { VaultList } from "@/components/module/vaults/vault-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { createVault } from "@/app/actions/vaults"
import { sanitizeInput } from "@/lib/utils/sanitize"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

interface VaultFormData {
  name: string
  description: string
  category: 'share' | 'delete'
}

interface Vault {
  id: string
  user_id: string
  name: string
  description: string | null
  category: 'share' | 'delete'
  is_locked: boolean | null
  is_shared: boolean | null
  created_at: string
  updated_at: string
  last_accessed: string | null
  icon: string | null
  color: string | null
  settings: Record<string, unknown> | null
  access_control: Record<string, unknown> | null
  death_settings: Record<string, unknown> | null
  sort_order: number | null
  item_count: number
  is_inherited?: boolean
  inherited_from_user_id?: string
}

export default function VaultsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [vaults, setVaults] = useState<Vault[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'share' | 'delete' | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingVault, setEditingVault] = useState<Vault | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [vaultToDelete, setVaultToDelete] = useState<string | null>(null)
  const router = useRouter()

  const loadVaults = useCallback(async (userId: string) => {
    try {
      // Load owned vaults
      const { data: ownedVaults, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        logger.error('Error loading vaults', error, { userId })
        return
      }

      // Inherited/shared vaults are shown on the /inheritance page, not here
      const allVaults = [...(ownedVaults || [])]

      if (allVaults.length > 0) {
        const vaultsWithCounts = await Promise.all(
          allVaults.map(async (vault: Record<string, unknown>) => {
            const { count, error: countError } = await supabase
              .from('vault_items')
              .select('*', { count: 'exact', head: true })
              .eq('vault_id', (vault as Record<string, unknown>).id as string)
            
            if (countError) {
              logger.error('Error loading vault item count', countError, { vaultId: vault.id })
            }
            
            return {
              ...(vault as Record<string, unknown>),
              item_count: count || 0,
            }
          })
        )
        setVaults(vaultsWithCounts as unknown as Vault[])
      } else {
        setVaults([])
      }
    } catch (error) {
      logger.error('Error loading vaults', error, { userId })
      toast.error('Failed to load vaults', 'Please refresh the page')
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    
    const initializePage = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          logger.error('Auth error', authError)
          return
        }
        
        if (!user) {
          router.push('/login')
          return
        }
        
        if (!isMounted) return
        setUser(user)

        // Load vaults
        if (isMounted) {
          await loadVaults(user.id)
        }
      } catch (error) {
        logger.error('Error initializing page', error)
      }
    }

    initializePage()
    
    return () => {
      isMounted = false
    }
  }, [router, loadVaults])

  const handleAddVault = async (formData: VaultFormData) => {
    if (!user) return

    // Sanitize user inputs
    const sanitizedName = sanitizeInput(formData.name)
    const sanitizedDescription = formData.description ? sanitizeInput(formData.description) : null

    try {
      await createVault({
        user_id: user.id,
        name: sanitizedName,
        description: sanitizedDescription,
        category: formData.category || 'share',
        is_locked: false,
        is_shared: false,
        icon: null,
        color: null,
        settings: {
          autoLock: true,
          autoLockTimeout: 15,
          twoFactorEnabled: false,
          maxFailedAttempts: 5
        },
        access_control: {
          allowedHeirs: [],
          allowedUsers: [],
          requireApproval: true
        },
        death_settings: {
          notifyContacts: true,
          triggerAfterDays: 30,
          instructions: '',
          notifySMS: [],
          notifyEmail: []
        },
        sort_order: 0
      })

      if (user) {
        await loadVaults(user.id)
        setShowForm(false)
        setEditingVault(null)
        toast.success('Vault created successfully')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      logger.error('Error adding vault', error, { userId: user?.id })
      toast.error('Failed to add vault', message || 'Please try again')
    }
  }

  const handleUpdateVault = async (formData: VaultFormData) => {
    if (!editingVault || !user) return

    const sanitizedName = sanitizeInput(formData.name)
    const sanitizedDescription = formData.description ? sanitizeInput(formData.description) : null

    try {
      const { error } = await supabase
        .from('vaults')
        .update({
          name: sanitizedName,
          description: sanitizedDescription,
          category: formData.category
        })
        .eq('id', editingVault.id)

      if (error) {
        logger.error('Error updating vault', error, { vaultId: editingVault.id })
        toast.error('Failed to update vault', 'Please try again')
        return
      }

      await loadVaults(user.id)
      setShowForm(false)
      setEditingVault(null)
      toast.success('Vault updated successfully')
    } catch (error) {
      logger.error('Error updating vault', error, { vaultId: editingVault?.id })
      toast.error('Failed to update vault', 'Please try again')
    }
  }

  const handleVaultSelect = (vault: Vault) => {
    router.push(`/vaults/${vault.id}`)
  }

  const handleDeleteVault = (vaultId: string) => {
    setVaultToDelete(vaultId)
    setShowDeleteModal(true)
  }

  const confirmDeleteVault = async () => {
    if (!vaultToDelete || !user) return

    try {
      const { error } = await supabase
        .from('vaults')
        .delete()
        .eq('id', vaultToDelete)
      
      if (error) {
        logger.error('Error deleting vault', error, { vaultId: vaultToDelete })
        toast.error('Failed to delete vault', 'Please try again')
        return
      }
      
      await loadVaults(user.id)
      setShowDeleteModal(false)
      setVaultToDelete(null)
      toast.success('Vault deleted successfully')
    } catch (error) {
      logger.error('Error deleting vault', error, { vaultId: vaultToDelete })
      toast.error('Failed to delete vault', 'Please try again')
    }
  }

  const handleVaultEdit = (vault: Vault) => {
    setEditingVault(vault)
    setShowForm(true)
  }

  return (
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
              variant={selectedCategory === 'share' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === 'share' ? null : 'share')}
              className="rounded-lg"
            >
              Share ({vaults.filter(v => v.category === 'share').length})
            </Button>
            <Button
              variant={selectedCategory === 'delete' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === 'delete' ? null : 'delete')}
              className="rounded-lg"
            >
              Delete ({vaults.filter(v => v.category === 'delete').length})
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
  )
}
