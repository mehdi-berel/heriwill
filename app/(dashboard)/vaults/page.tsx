"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { VaultForm } from "@/components/module/vaults/vault-form"
import { VaultList } from "@/components/module/vaults/vault-list"
import { VaultStats } from "@/components/module/vaults/vault-stats"
import { VaultDetail } from "@/components/module/vaults/vault-detail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

interface Vault {
  id: string
  name: string
  description: string
  category: 'share_after_death' | 'delete_after_death' | 'sign_off_after_death'
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

interface VaultItem {
  id: string
  name: string
  type: 'password' | 'document' | 'video' | 'image' | 'note' | 'crypto' | 'bank' | 'other'
  size: number
  created_at: string
  updated_at: string
  is_encrypted: boolean
  tags: string[]
}

export default function VaultsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [vaults, setVaults] = useState<Vault[]>([])
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null)
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
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
      
      // Load vaults data
      await loadVaults(user.id)
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
        loadVaults(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadVaults = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('vaults')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setVaults(data || [])
    } catch (error) {
      console.error('Error loading vaults:', error)
    }
  }

  const loadVaultItems = async (vaultId: string) => {
    try {
      // In a real app, this would fetch from a vault_items table
      const mockItems: VaultItem[] = [
        {
          id: '1',
          name: 'Family Photos',
          type: 'image',
          size: 1024 * 1024 * 50, // 50MB
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          is_encrypted: true,
          tags: ['family', 'photos', 'memories']
        },
        {
          id: '2',
          name: 'Bank Account Information',
          type: 'bank',
          size: 1024, // 1KB
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          is_encrypted: true,
          tags: ['financial', 'banking']
        }
      ]
      setVaultItems(mockItems)
    } catch (error) {
      console.error('Error loading vault items:', error)
    }
  }

  const handleAddVault = async (formData: any) => {
    try {
      const { data } = await supabase
        .from('vaults')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          is_encrypted: formData.is_encrypted,
          is_favorite: formData.is_favorite,
          tags: formData.tags,
          access_control: formData.access_control,
          death_settings: formData.death_settings,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (data) {
        setVaults([data, ...vaults])
      }
    } catch (error) {
      console.error('Error adding vault:', error)
    }
  }

  const handleUpdateVault = async (formData: any) => {
    if (!selectedVault) return

    try {
      const { data } = await supabase
        .from('vaults')
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          is_encrypted: formData.is_encrypted,
          is_favorite: formData.is_favorite,
          tags: formData.tags,
          access_control: formData.access_control,
          death_settings: formData.death_settings
        })
        .eq('id', selectedVault.id)
        .select()
        .single()

      if (data) {
        setVaults(vaults.map(v => v.id === selectedVault.id ? data : v))
        setSelectedVault(data)
      }
    } catch (error) {
      console.error('Error updating vault:', error)
    }
  }

  const handleDeleteVault = async (vaultId: string) => {
    try {
      await supabase
        .from('vaults')
        .delete()
        .eq('id', vaultId)
      
      setVaults(vaults.filter(v => v.id !== vaultId))
      if (selectedVault?.id === vaultId) {
        setSelectedVault(null)
      }
    } catch (error) {
      console.error('Error deleting vault:', error)
    }
  }

  const handleVaultSelect = (vault: Vault) => {
    setSelectedVault(vault)
    loadVaultItems(vault.id)
  }

  const handleVaultEdit = (vault: Vault) => {
    setSelectedVault(vault)
  }

  const handleUploadFiles = async (files: File[]) => {
    if (!selectedVault) return

    // In a real app, this would upload files to storage
    console.log('Uploading files to vault:', selectedVault.id, files)
    
    // Mock adding items
    const newItems: VaultItem[] = files.map((file, index) => ({
      id: `new-${index}`,
      name: file.name,
      type: 'other' as const,
      size: file.size,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_encrypted: selectedVault.is_encrypted,
      tags: []
    }))

    setVaultItems([...vaultItems, ...newItems])
  }

  const handleDownloadItem = async (itemId: string) => {
    // In a real app, this would download the file
    console.log('Downloading item:', itemId)
  }

  const handleDeleteItem = async (itemId: string) => {
    setVaultItems(vaultItems.filter(item => item.id !== itemId))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getVaultStats = () => {
    const totalVaults = vaults.length
    const encryptedVaults = vaults.filter(v => v.is_encrypted).length
    const sharedVaults = vaults.filter(v => v.is_shared).length
    const favoriteVaults = vaults.filter(v => v.is_favorite).length
    const totalItems = vaults.reduce((sum, v) => sum + v.item_count, 0)
    const recentlyAccessed = vaults.filter(v => {
      if (!v.last_accessed) return false
      return new Date(v.last_accessed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }).length

    return {
      totalVaults,
      encryptedVaults,
      sharedVaults,
      favoriteVaults,
      totalItems,
      recentlyAccessed,
      vaultsByCategory: {
        share_after_death: vaults.filter(v => v.category === 'share_after_death').length,
        delete_after_death: vaults.filter(v => v.category === 'delete_after_death').length,
        sign_off_after_death: vaults.filter(v => v.category === 'sign_off_after_death').length
      },
      securityScore: 85, // Mock data
      storageUsed: totalItems * 1024 * 1024, // Mock calculation
      storageLimit: 10 * 1024 * 1024 * 1024 // 10GB
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Vaults</h1>
            <p className="text-muted-foreground">
              Secure storage for your digital assets and important information.
            </p>
          </div>
          <Button onClick={() => console.log('Create vault')}>
            Create Vault
          </Button>
        </div>

        {/* Stats and Vault List */}
        <div className="space-y-6">
          <VaultStats stats={getVaultStats()} />
          
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search vaults..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Vault List */}
          <VaultList
            vaults={vaults}
            onVaultSelect={handleVaultSelect}
            onVaultEdit={handleVaultEdit}
            onVaultDelete={handleDeleteVault}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
