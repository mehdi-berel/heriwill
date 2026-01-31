"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProTierGuard } from "@/components/module/auth/pro-tier-guard"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { AssetForm } from "@/components/module/assets/asset-form"
import { AssetList } from "@/components/module/assets/asset-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  subscription_tier?: string
}

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
  icon?: string
  category: string
}

interface Heir {
  id: string
  full_name_encrypted: string
  relationship?: string
}

function AssetsPageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
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
        console.error('Error loading assets:', error)
        return
      }

      setAssets(data || [])
    } catch (error) {
      console.error('Error loading assets:', error)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      
      // Load assets, vaults, and heirs data
      await Promise.all([
        loadAssets(user.id),
        loadVaults(user.id),
        loadHeirs(user.id)
      ])
      
      setLoading(false)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('assets') as any)
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
        console.error('Error adding asset:', error)
        return
      }

      if (data) {
        setAssets([data, ...assets])
        setShowForm(false)
        setEditingAsset(null)
      }
    } catch (error) {
      console.error('Error adding asset:', error)
    }
  }

  const handleUpdateAsset = async (assetData: AssetFormData) => {
    if (!editingAsset) return

    const value = typeof assetData.value === 'string' ? parseFloat(assetData.value) : assetData.value

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('assets') as any)
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
        console.error('Error updating asset:', error)
        return
      }

      if (data) {
        setAssets(assets.map(a => a.id === editingAsset.id ? data : a))
        setShowForm(false)
        setEditingAsset(null)
      }
    } catch (error) {
      console.error('Error updating asset:', error)
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
        console.error('Error deleting asset:', error)
        return
      }

      setAssets(assets.filter(a => a.id !== assetToDelete))
      setShowDeleteModal(false)
      setAssetToDelete(null)
    } catch (error) {
      console.error('Error deleting asset:', error)
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

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || asset.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <ProTierGuard pageName="Assets">
      <DashboardLayout 
        userName={profile?.full_name || user?.email} 
        onSignOut={handleSignOut}
      >
        <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push(returnTo)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vault
        </Button>
        
        {/* Header with Title and Add Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-text-primary">Assets</h1>
          
          <Button 
            onClick={() => {
              setEditingAsset(null)
              setShowForm(true)
            }}
            className="bg-gradient-purple hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>

        {/* Type Filter Tabs - Centered */}
        <div className="flex justify-center gap-2">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <DialogContent>
            <DialogTitle>Delete Asset</DialogTitle>
            <div className="space-y-4">
              <p className="text-text-secondary">
                Are you sure you want to delete this asset? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setAssetToDelete(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAsset}
                  className="bg-status-error hover:bg-status-error/90"
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
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
