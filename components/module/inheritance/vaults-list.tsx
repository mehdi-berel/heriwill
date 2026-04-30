"use client"

import { FolderOpen, User, FileText, Calendar, ChevronRight, Share2 } from "lucide-react"

interface InheritedVault {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  category: string
  owner_name: string
  item_count: number
  created_at: string
}

interface VaultsListProps {
  vaults: InheritedVault[]
  onVaultClick: (vaultId: string) => void
  searchTerm?: string
}

export function VaultsList({ vaults, onVaultClick, searchTerm = '' }: VaultsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredVaults = vaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vault.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vault.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const sortedVaults = [...filteredVaults].sort((a, b) => a.name.localeCompare(b.name))

  if (sortedVaults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <FolderOpen className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">No inherited vaults found</h3>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          {searchTerm 
            ? 'Try adjusting your search.' 
            : 'You don\'t have access to any inherited vaults yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedVaults.map((vault) => (
        <div
          key={vault.id}
          onClick={() => onVaultClick(vault.id)}
          className="relative flex items-center p-4 bg-background-card border rounded-xl transition-all group cursor-pointer hover:border-primary/50"
          style={{ borderColor: '#232629' }}
        >
          {/* Icon Container */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
            style={{ backgroundColor: vault.color || 'rgb(124, 58, 237)' }}
          >
            <Share2 className="h-6 w-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-semibold truncate">{vault.name}</h3>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{vault.owner_name}</span>
              <span>•</span>
              <FolderOpen className="h-3.5 w-3.5" />
              <span>{vault.item_count} {vault.item_count === 1 ? 'item' : 'items'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-2">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  )
}
