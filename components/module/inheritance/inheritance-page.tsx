"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, FolderOpen, Info, User, ArrowLeft, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface SharedVault {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  category: string
  shared_from_user_id: string
  shared_from_user_name: string | null
  can_view: boolean
  can_export: boolean
  can_edit: boolean
  item_count: number
  created_at: string
}

interface VaultItem {
  id: string
  title_encrypted: string
  item_type: string
  is_favorite: boolean | null
  created_at: string
}

interface InheritancePageProps {
  userId: string
}

export function InheritancePage({ userId }: InheritancePageProps) {
  const [sharedVaults, setSharedVaults] = useState<SharedVault[]>([])
  const [selectedVault, setSelectedVault] = useState<SharedVault | null>(null)
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)

  const loadSharedVaults = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      
      // Get vaults shared with this user as an heir
      const { data: accessData, error: accessError } = await supabase
        .from('heir_vault_access')
        .select(`
          vault_id,
          can_view,
          can_export,
          can_edit,
          vaults (
            id,
            name,
            description,
            icon,
            color,
            category,
            user_id,
            created_at
          )
        `)
        .eq('heir_id', userId)

      if (accessError) {
        console.error('Error loading shared vaults:', accessError)
        setSharedVaults([])
        return
      }

      if (!accessData || accessData.length === 0) {
        setSharedVaults([])
        return
      }

      // Get owner names and item counts
      const vaultsWithDetails = await Promise.all(
        accessData.map(async (access: any) => {
          const vault = access.vaults
          
          // Get owner name
          const { data: ownerData } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', vault.user_id)
            .single()

          // Get item count
          const { count } = await supabase
            .from('vault_items')
            .select('*', { count: 'exact', head: true })
            .eq('vault_id', vault.id)

          const owner = ownerData as { full_name?: string; email?: string } | null

          return {
            id: vault.id,
            name: vault.name,
            description: vault.description,
            icon: vault.icon,
            color: vault.color,
            category: vault.category,
            shared_from_user_id: vault.user_id,
            shared_from_user_name: owner?.full_name || owner?.email || 'Unknown',
            can_view: access.can_view,
            can_export: access.can_export,
            can_edit: access.can_edit,
            item_count: count || 0,
            created_at: vault.created_at
          }
        })
      )

      setSharedVaults(vaultsWithDetails)
    } catch (error) {
      console.error('Error loading shared vaults:', error)
      setSharedVaults([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  const loadVaultItems = useCallback(async (vault: SharedVault) => {
    try {
      setLoadingItems(true)
      
      const { data, error } = await supabase
        .from('vault_items')
        .select('id, title_encrypted, item_type, is_favorite, created_at')
        .eq('vault_id', vault.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading vault items:', error)
        setVaultItems([])
        return
      }

      setVaultItems(data || [])
    } catch (error) {
      console.error('Error loading vault items:', error)
      setVaultItems([])
    } finally {
      setLoadingItems(false)
    }
  }, [])

  useEffect(() => {
    loadSharedVaults()
  }, [loadSharedVaults])

  const handleVaultClick = (vault: SharedVault) => {
    setSelectedVault(vault)
    loadVaultItems(vault)
  }

  const handleHeirEdit = (heir: { id: string; name: string; email: string }) => {
    setSelectedVault(null)
    setVaultItems([])
  }

  const handleBackToVaults = () => {
    setSelectedVault(null)
    setVaultItems([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-lg text-text-muted">Loading inherited vaults...</div>
      </div>
    )
  }

  // Show vault items if a vault is selected
  if (selectedVault) {
    return (
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackToVaults}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inherited Vaults
        </Button>

        {/* Vault Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div 
                className="h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: selectedVault.color || '#9333EA' }}
              >
                <FolderOpen className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{selectedVault.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                  <User className="h-4 w-4" />
                  <span>From: {selectedVault.shared_from_user_name}</span>
                </div>
                {selectedVault.description && (
                  <CardDescription className="mt-2">{selectedVault.description}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {selectedVault.can_view && (
                <Badge variant="secondary">Can View</Badge>
              )}
              {selectedVault.can_export && (
                <Badge variant="secondary">Can Export</Badge>
              )}
              {selectedVault.can_edit && (
                <Badge variant="secondary">Can Edit</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vault Items */}
        <Card>
          <CardHeader>
            <CardTitle>Vault Contents</CardTitle>
            <CardDescription>
              {vaultItems.length} {vaultItems.length === 1 ? 'item' : 'items'} in this vault
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <div className="text-center py-8 text-text-muted">Loading items...</div>
            ) : vaultItems.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                <p className="text-text-muted">This vault is empty</p>
              </div>
            ) : (
              <div className="space-y-2">
                {vaultItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border-default hover:bg-background-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-text-tertiary" />
                      <div>
                        <p className="font-medium text-text-primary">{item.title_encrypted}</p>
                        <p className="text-sm text-text-secondary capitalize">{item.item_type}</p>
                      </div>
                    </div>
                    {item.is_favorite && (
                      <Badge variant="outline">Favorite</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show vault list
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Inherited Vaults</h1>
          <p className="text-text-secondary mt-1">
            Vaults that have been shared with you by others
          </p>
        </div>
        <div className="h-14 w-14 rounded-full bg-primary-600/10 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-primary-400" />
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-primary-600/5 border-primary-600/20">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">
            These are vaults that have been shared with you as an heir. You can view the contents based on the permissions granted to you.
          </p>
        </CardContent>
      </Card>

      {/* Vaults List */}
      {sharedVaults.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-20 w-20 rounded-full bg-primary-600/10 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-10 w-10 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">No Inherited Vaults</h3>
            <p className="text-text-muted mb-4">
              You don't have access to any inherited vaults yet. When someone shares a vault with you as an heir, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sharedVaults.map((vault) => (
            <Card
              key={vault.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary-600/30"
              onClick={() => handleVaultClick(vault)}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: vault.color || '#9333EA' }}
                  >
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{vault.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-text-tertiary mt-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{vault.shared_from_user_name}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {vault.description && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {vault.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-tertiary">
                    {vault.item_count} {vault.item_count === 1 ? 'item' : 'items'}
                  </span>
                  <Badge variant="secondary" className="capitalize">
                    {vault.category.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
