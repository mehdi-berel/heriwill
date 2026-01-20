"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  FolderOpen, 
  Lock, 
  Share2, 
  Trash2, 
  Eye, 
  Edit,
  Star,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Archive,
  Key
} from "lucide-react"

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
}

interface VaultListProps {
  vaults: Vault[]
  onVaultSelect: (vault: Vault) => void
  onVaultEdit: (vault: Vault) => void
  onVaultDelete: (vaultId: string) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
}

export function VaultList({ 
  vaults, 
  onVaultSelect, 
  onVaultEdit, 
  onVaultDelete, 
  searchTerm = '',
  onSearchChange 
}: VaultListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'accessed'>('name')

  const filteredVaults = vaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vault.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vault.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || vault.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedVaults = [...filteredVaults].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'accessed':
        if (!a.last_accessed && !b.last_accessed) return 0
        if (!a.last_accessed) return 1
        if (!b.last_accessed) return -1
        return new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime()
      default:
        return 0
    }
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'share_after_death': return <Share2 className="h-4 w-4" />
      case 'delete_after_death': return <Trash2 className="h-4 w-4" />
      case 'sign_off_after_death': return <Lock className="h-4 w-4" />
      default: return <FolderOpen className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'share_after_death': return 'bg-blue-100 text-blue-800'
      case 'delete_after_death': return 'bg-red-100 text-red-800'
      case 'sign_off_after_death': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const categories = [
    { value: 'all', label: 'All Vaults', count: vaults.length },
    { value: 'share_after_death', label: 'Share After Death', count: vaults.filter(v => v.category === 'share_after_death').length },
    { value: 'delete_after_death', label: 'Delete After Death', count: vaults.filter(v => v.category === 'delete_after_death').length },
    { value: 'sign_off_after_death', label: 'Sign Off After Death', count: vaults.filter(v => v.category === 'sign_off_after_death').length }
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vaults..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Created</option>
            <option value="accessed">Sort by Last Accessed</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedCategory === category.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {category.label}
            <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Vaults Grid */}
      {sortedVaults.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No vaults found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Create your first vault to start organizing your digital assets.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedVaults.map((vault) => (
            <Card 
              key={vault.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => onVaultSelect(vault)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        vault.is_encrypted ? 'bg-yellow-100' : 'bg-primary'
                      }`}
                    >
                      {vault.is_encrypted ? (
                        <Lock className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <div className="h-5 w-5 bg-primary-foreground rounded" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{vault.name}</CardTitle>
                      <CardDescription className="truncate">{vault.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {vault.is_favorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onVaultEdit(vault)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Category and Status */}
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(vault.category)}>
                      {getCategoryIcon(vault.category)}
                      <span className="ml-1">
                        {vault.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {vault.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      {vault.is_shared && <Share2 className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Tags */}
                  {vault.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {vault.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {vault.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{vault.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{vault.item_count} items</span>
                    <span>
                      {vault.last_accessed 
                        ? `Accessed ${new Date(vault.last_accessed).toLocaleDateString()}`
                        : `Created ${new Date(vault.created_at).toLocaleDateString()}`
                      }
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        onVaultSelect(vault)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onVaultDelete(vault.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
