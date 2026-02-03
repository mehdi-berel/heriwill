"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  FolderOpen, 
  Lock, 
  User,
  Calendar,
  FileText,
  Package,
  Download
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"
import { ItemsList } from "@/components/module/inheritance/items-list"
import { ItemPreview } from "@/components/module/inheritance/item-preview"

interface VaultDetails {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  category: string
  owner_id: string
  owner_name: string
  created_at: string
  item_count: number
}

interface VaultItem {
  id: string
  title_encrypted: string
  item_type: string
  metadata: Record<string, unknown>
  tags?: string[]
  is_favorite: boolean | null
  created_at: string
  updated_at: string
  file_size: number | null
}

export default function InheritedVaultDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vaultId = params?.id as string

  const [vault, setVault] = useState<VaultDetails | null>(null)
  const [items, setItems] = useState<VaultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null)
  const [showItemPreview, setShowItemPreview] = useState(false)

  const loadVaultDetails = useCallback(async (userId: string) => {
    try {
      setLoading(true)

      // Verify user is an heir and inheritance is triggered
      const { data: heirData } = await supabase
        .from('heirs')
        .select('user_id, heir_user_id')
        .eq('heir_user_id', userId)
        .eq('is_active', true)

      if (!heirData || heirData.length === 0) {
        logger.error('User is not an heir', null, { userId })
        router.push('/inheritance')
        return
      }

      const ownerIds = heirData.map(h => h.user_id)

      // Check for completed inheritance triggers
      const { data: triggersData } = await supabase
        .from('inheritance_triggers')
        .select('user_id')
        .in('user_id', ownerIds)
        .eq('status', 'completed')

      if (!triggersData || triggersData.length === 0) {
        logger.error('No completed inheritance triggers', null, { userId, ownerIds })
        router.push('/inheritance')
        return
      }

      const triggeredOwnerIds = triggersData.map(t => t.user_id)

      // Get vault details
      const { data: vaultData, error: vaultError } = await supabase
        .from('vaults')
        .select('id, name, description, icon, color, category, user_id, created_at')
        .eq('id', vaultId)
        .in('user_id', triggeredOwnerIds)
        .single()

      if (vaultError || !vaultData) {
        logger.error('Vault not found or not accessible', vaultError, { vaultId, userId })
        router.push('/inheritance')
        return
      }

      // Get owner details
      const { data: ownerData } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', vaultData.user_id)
        .single()

      const owner = ownerData as { full_name?: string; email?: string } | null

      // Get vault items
      const { data: itemsData, error: itemsError } = await supabase
        .from('vault_items')
        .select('id, title_encrypted, item_type, metadata, tags, is_favorite, created_at, updated_at, file_size')
        .eq('vault_id', vaultId)
        .order('created_at', { ascending: false })

      if (itemsError) {
        logger.error('Error loading vault items', itemsError, { vaultId })
      }

      setVault({
        id: vaultData.id,
        name: vaultData.name,
        description: vaultData.description,
        icon: vaultData.icon,
        color: vaultData.color,
        category: vaultData.category,
        owner_id: vaultData.user_id,
        owner_name: owner?.full_name || owner?.email || 'Unknown',
        created_at: vaultData.created_at,
        item_count: itemsData?.length || 0
      })

      setItems((itemsData || []) as VaultItem[])
    } catch (error) {
      logger.error('Error loading vault details', error, { vaultId, userId })
    } finally {
      setLoading(false)
    }
  }, [vaultId, router])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      await loadVaultDetails(user.id)
    }

    getUser()
  }, [router, loadVaultDetails])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleItemClick = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      setSelectedItem(item)
      setShowItemPreview(true)
    }
  }

  const handleDownloadItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    try {
      const response = await fetch('/api/inheritance/download-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      })

      if (!response.ok) {
        throw new Error('Failed to download item')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${item.title_encrypted.replace(/[^a-z0-9]/gi, '_')}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      logger.error('Error downloading item', error, { itemId })
      toast.error('Failed to download item', 'Please try again')
    }
  }

  const handleDownloadVault = async () => {
    if (!vault) return
    
    setDownloading(true)
    try {
      const response = await fetch('/api/inheritance/export-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaultId: vault.id })
      })

      if (!response.ok) {
        throw new Error('Failed to download vault')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${vault.name.replace(/[^a-z0-9]/gi, '_')}_export.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      logger.error('Error downloading vault', error, { vaultId: vault?.id })
      toast.error('Failed to download vault', 'Please try again')
    } finally {
      setDownloading(false)
    }
  }


  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading inherited vault...</p>
        </div>
      </div>
    )
  }

  if (!vault) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Vault not found or not accessible</p>
          <Button onClick={() => router.push('/inheritance')} className="mt-4">
            Back to Inheritance
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/inheritance')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inheritance
        </Button>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: vault.color || '#8B5CF6' }}
                >
                  <FolderOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{vault.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    Inherited from {vault.owner_name}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Lock className="h-3 w-3 mr-1" />
                  Read Only
                </Badge>
                <Button
                  onClick={handleDownloadVault}
                  disabled={downloading}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {downloading ? 'Downloading...' : 'Download Vault'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{vault.item_count} items</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(vault.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="capitalize">{vault.category} vault</span>
              </div>
            </div>
            {vault.description && (
              <p className="mt-4 text-sm text-muted-foreground">{vault.description}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vault Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Vault Items</h2>
        <ItemsList 
          items={items} 
          onItemClick={handleItemClick}
        />
      </div>

      {/* Item Preview Modal */}
      <ItemPreview
        item={selectedItem}
        isOpen={showItemPreview}
        onClose={() => {
          setShowItemPreview(false)
          setSelectedItem(null)
        }}
        onDownload={handleDownloadItem}
      />
    </div>
  )
}
