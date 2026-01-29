"use client"

import { Button } from "@/components/ui/button"
import { 
  FolderOpen, 
  Lock, 
  Share2, 
  Trash2, 
  Edit,
  Shield
} from "lucide-react"

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
  item_count: number
  created_at: string
  updated_at: string
  last_accessed: string | null
  icon: string | null
  color: string | null
  settings: Record<string, unknown> | null
  access_control: Record<string, unknown> | null
  death_settings: Record<string, unknown> | null
  sort_order: number | null
}

interface VaultListProps {
  vaults: Vault[]
  onVaultSelect: (vault: Vault) => void
  onVaultEdit: (vault: Vault) => void
  onVaultDelete: (vaultId: string) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  selectedCategory?: 'share_after_death' | 'delete_after_death' | 'sign_off_after_death' | null
}

export function VaultList({ 
  vaults, 
  onVaultSelect, 
  onVaultEdit, 
  onVaultDelete, 
  searchTerm = '',
  selectedCategory = null
}: VaultListProps) {

  const filteredVaults = vaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vault.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === null || vault.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedVaults = [...filteredVaults].sort((a, b) => a.name.localeCompare(b.name))

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'share_after_death': return <Share2 className="h-6 w-6 text-white" />
      case 'delete_after_death': return <Trash2 className="h-6 w-6 text-white" />
      case 'sign_off_after_death': return <Shield className="h-6 w-6 text-white" />
      default: return <FolderOpen className="h-6 w-6 text-white" />
    }
  }


  return (
    <div className="space-y-6">
      {/* Vaults Grid */}
      {sortedVaults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <FolderOpen className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No vaults found</h3>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            {searchTerm || selectedCategory !== null 
              ? 'Try adjusting your search or filters.' 
              : 'Create your first vault to start organizing your digital assets.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedVaults.map((vault) => (
            <div
              key={vault.id}
              className="flex items-center p-4 bg-background-card border rounded-xl cursor-pointer hover:border-primary/50 transition-all group"
              style={{ borderColor: '#232629' }}
              onClick={() => onVaultSelect(vault)}
            >
              {/* Icon Container */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                style={{ backgroundColor: vault.color || 'rgb(124, 58, 237)' }}
              >
                {vault.is_encrypted ? (
                  <Lock className="h-6 w-6 text-white" />
                ) : (
                  getCategoryIcon(vault.category)
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-base font-semibold truncate">{vault.name}</h3>
                  {vault.is_encrypted && (
                    <div className="px-1.5 py-0.5 rounded bg-success/20 flex items-center">
                      <Lock className="h-3 w-3 text-success" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>{vault.item_count} {vault.item_count === 1 ? 'item' : 'items'}</span>
                  {vault.is_shared && (
                    <>
                      <span>•</span>
                      <Share2 className="h-3.5 w-3.5 text-primary" />
                      <span className="text-primary font-medium">Shared</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onVaultEdit(vault)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    onVaultDelete(vault.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
