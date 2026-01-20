"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { VaultDetail } from "@/components/module/vaults/vault-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Upload, Download, Settings } from "lucide-react"
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

export default function VaultDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [vault, setVault] = useState<Vault | null>(null)
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([])
  const router = useRouter()
  const params = useParams()
  const vaultId = params.id as string

  useEffect(() => {
    if (!vaultId) {
      router.push("/vaults")
      return
    }

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
        router.push("/auth/login")
      } else {
        setUser(session.user)
        if (vaultId) {
          loadVault(vaultId)
          loadVaultItems(vaultId)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, vaultId])

  const loadVault = async (id: string) => {
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
  }

  const loadVaultItems = async (vaultId: string) => {
    try {
      // Mock data for now - in real app, fetch from vault_items table
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
        },
        {
          id: '3',
          name: 'Insurance Policies',
          type: 'document',
          size: 1024 * 2, // 2KB
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          is_encrypted: true,
          tags: ['insurance', 'policies']
        }
      ]
      setVaultItems(mockItems)
    } catch (error) {
      console.error('Error loading vault items:', error)
    }
  }

  const handleEdit = () => {
    router.push(`/vaults/${vaultId}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vault? This action cannot be undone and all items will be permanently deleted.')) {
      return
    }

    try {
      await supabase
        .from('vaults')
        .delete()
        .eq('id', vaultId)
      
      router.push("/vaults")
    } catch (error) {
      console.error('Error deleting vault:', error)
    }
  }

  const handleUploadFiles = async (files: File[]) => {
    if (!vault) return

    // In a real app, this would upload files to storage
    console.log('Uploading files to vault:', vaultId, files)
    
    // Mock adding items
    const newItems: VaultItem[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: 'other' as const,
      size: file.size,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_encrypted: vault.is_encrypted,
      tags: []
    }))

    setVaultItems([...vaultItems, ...newItems])
    
    // Update vault item count
    if (vault) {
      setVault({
        ...vault,
        item_count: vault.item_count + files.length,
        last_accessed: new Date().toISOString()
      })
    }
  }

  const handleDownloadItem = async (itemId: string) => {
    // In a real app, this would download the file
    console.log('Downloading item:', itemId)
  }

  const handleDeleteItem = async (itemId: string) => {
    setVaultItems(vaultItems.filter(item => item.id !== itemId))
    
    // Update vault item count
    if (vault) {
      setVault({
        ...vault,
        item_count: Math.max(0, vault.item_count - 1),
        last_accessed: new Date().toISOString()
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
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
            The vault you're looking for doesn't exist or you don't have permission to view it.
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
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => console.log('Share vault')}>
              <Settings className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
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
          onEdit={handleEdit}
          onUpload={handleUploadFiles}
          onDownloadItem={handleDownloadItem}
          onDeleteItem={handleDeleteItem}
        />
      </div>
    </DashboardLayout>
  )
}
