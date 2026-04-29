"use client"

import { VaultCard } from "./vault-card"
import { FolderOpen } from "lucide-react"

interface Vault {
  id: string
  user_id: string
  name: string
  description: string | null
  category: 'share' | 'delete'
  is_locked: boolean | null
  is_shared: boolean | null
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
  selectedCategory?: 'share' | 'delete' | null
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
            <VaultCard
              key={vault.id}
              vault={vault}
              onPress={() => onVaultSelect(vault)}
              onEdit={onVaultEdit}
              onDelete={onVaultDelete}
              heirCount={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
