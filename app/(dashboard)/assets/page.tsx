"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProTierGuard } from "@/components/module/auth/pro-tier-guard"
import { AssetForm } from "@/components/module/assets/asset-form"
import { AssetList } from "@/components/module/assets/asset-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

interface AssetFormData {
  name: string
  type: string
  description?: string
  value?: number | string
  location?: string
  ownership_type: string
  vault_id?: string | null
  heir_ids?: string[]
}

interface Asset {
  id: string
  name: string
  type: 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'
  description?: string
  value?: number
  location?: string
  ownership_type: 'sole' | 'joint' | 'tenants_in_common' | 'community_property'
  vault_id?: string | null
  heir_ids?: string[] | null
  created_at: string
  updated_at: string
}

interface Vault {
  id: string
  name: string
  icon?: string | null
  category: string
}

interface Heir {
  id: string
  full_name_encrypted: string | null
  relationship?: string | null
}

function AssetsPageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [vaults, setVaults] = useState<Vault[]>([])
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/vaults'

  const loadAssets = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error loading assets', error, { userId })
        return
      }

      setAssets((data || []) as Asset[])
    } catch (error) {
      logger.error('Error loading assets', error, { userId })
      toast.error('Failed to load assets', 'Please refresh the page')
    }
  }, [])

  const loadVaults = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('vaults')
        .select('id, name, icon, category')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (error) {
        logger.error('Error loading vaults', error, { userId })
        return
      }

      setVaults((data || []) as Vault[])
    } catch (error) {
      logger.error('Error loading vaults', error, { userId })
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
        logger.error('Error loading heirs', error, { userId })
        return
      }

      setHeirs((data || []) as Heir[])
    } catch (error) {
      logger.error('Error loading heirs', error, { userId })
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load assets, vaults, and heirs data
      await Promise.all([
        loadAssets(user.id),
        loadVaults(user.id),
        loadHeirs(user.id)
      ])
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
        loadAssets(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, loadAssets, loadVaults, loadHeirs])

  const handleAddAsset = async (assetData: AssetFormData) => {
    if (!user) return

    const value = typeof assetData.value === 'string' ? parseFloat(assetData.value) : assetData.value

    try {
      const { error } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          name: assetData.name,
          type: assetData.type,
          description: assetData.description || null,
          value: value || null,
          location: assetData.location || null,
          ownership_type: assetData.ownership_type,
          vault_id: assetData.vault_id || null,
          heir_ids: assetData.heir_ids || []
        })
        .select()
        .single()

      if (error) {
        logger.error('Error adding asset', error, { userId: user?.id })
        toast.error('Failed to add asset', 'Please try again')
        return
      }

      if (user) {
        await loadAssets(user.id)
        setEditingAsset(null)
        toast.success('Asset added successfully')
      }
    } catch (error) {
      logger.error('Error adding asset', error, { userId: user?.id })
      toast.error('Failed to add asset', 'Please try again')
    }
  }

  const handleUpdateAsset = async (assetData: AssetFormData) => {
    if (!editingAsset) return

    const value = typeof assetData.value === 'string' ? parseFloat(assetData.value) : assetData.value

    try {
      const { error } = await supabase
        .from('assets')
        .update({
          name: assetData.name,
          type: assetData.type,
          description: assetData.description || null,
          value: value || null,
          location: assetData.location || null,
          ownership_type: assetData.ownership_type,
          vault_id: assetData.vault_id || null,
          heir_ids: assetData.heir_ids || []
        })
        .eq('id', editingAsset.id)
        .select()
        .single()

      if (error) {
        logger.error('Error updating asset', error, { assetId: editingAsset.id })
        toast.error('Failed to update asset', 'Please try again')
        return
      }

      if (user) {
        await loadAssets(user.id)
        setEditingAsset(null)
        toast.success('Asset updated successfully')
      }
    } catch (error) {
      logger.error('Error updating asset', error, { assetId: editingAsset.id })
      toast.error('Failed to update asset', 'Please try again')
    }
  }

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetToDelete)
      
      if (error) {
        logger.error('Error deleting asset', error, { assetId: assetToDelete })
        toast.error('Failed to delete asset', 'Please try again')
        return
      }

      if (user) {
        await loadAssets(user.id)
      }
      setShowDeleteModal(false)
      setAssetToDelete(null)
      toast.success('Asset deleted successfully')
    } catch (error) {
      logger.error('Error deleting asset', error, { assetId: assetToDelete })
      toast.error('Failed to delete asset', 'Please try again')
    }
  }

  const handleAssetEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setShowForm(true)
  }

  const handleAssetDelete = (assetId: string) => {
    setAssetToDelete(assetId)
    setShowDeleteModal(true)
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || asset.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <ProTierGuard pageName="Assets">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Back Button, Title and Add Button Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Button 
              variant="ghost" 
              onClick={() => router.push(returnTo)}
              className="h-10 sm:h-9 px-2 sm:px-3 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Vault</span>
            </Button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary truncate">Assets</h1>
          </div>
          
          <Button 
            onClick={() => {
              setEditingAsset(null)
              setShowForm(true)
            }}
            className="bg-gradient-purple hover:opacity-90 h-10 sm:h-9 text-sm sm:text-base px-3 sm:px-4 flex-shrink-0 ml-2"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Add Asset</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>

        {/* Type Filter Tabs - Scrollable on mobile */}
        <div className="-mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex sm:flex-wrap sm:justify-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {[
              { value: 'all', label: 'All Assets' },
              { value: 'real_estate', label: 'Real Estate' },
              { value: 'vehicle', label: 'Vehicles' },
              { value: 'bank_account', label: 'Bank Accounts' },
              { value: 'investment', label: 'Investments' },
              { value: 'insurance', label: 'Insurance' },
              { value: 'personal_property', label: 'Personal Property' },
              { value: 'business', label: 'Business' },
              { value: 'other', label: 'Other' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value as 'all' | Asset['type'])}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  selectedType === type.value
                    ? 'bg-primary-600/10 text-primary-400 border border-primary-600/20'
                    : 'text-text-muted hover:bg-background-hover hover:text-text-secondary border'
                }`}
                style={{ borderColor: selectedType === type.value ? undefined : '#232629' }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>

        {/* Asset List */}
        <AssetList
          assets={filteredAssets}
          onAssetEdit={handleAssetEdit}
          onAssetDelete={handleAssetDelete}
        />

        {/* Add/Edit Asset Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <AssetForm
              onSubmit={editingAsset ? handleUpdateAsset : handleAddAsset}
              onCancel={() => {
                setShowForm(false)
                setEditingAsset(null)
              }}
              initialData={editingAsset ? {
                ...editingAsset,
                value: editingAsset.value || undefined,
                vault_id: editingAsset.vault_id || undefined,
                heir_ids: editingAsset.heir_ids || undefined
              } : undefined}
              vaults={vaults}
              heirs={heirs}
              isEditing={!!editingAsset}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="w-[95vw] sm:w-full max-w-md">
            <DialogTitle>Delete Asset</DialogTitle>
            <div className="space-y-4">
              <p className="text-text-secondary">
                Are you sure you want to delete this asset? This action cannot be undone.
              </p>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setAssetToDelete(null)
                  }}
                  className="h-10 sm:h-9 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAsset}
                  className="bg-status-error hover:bg-status-error/90 h-10 sm:h-9 w-full sm:w-auto"
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProTierGuard>
  )
}

export default function AssetsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AssetsPageContent />
    </Suspense>
  )
}
