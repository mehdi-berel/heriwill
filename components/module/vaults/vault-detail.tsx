"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  FolderOpen, 
  Lock, 
  Share2, 
  Eye, 
  Edit,
  Download,
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Key,
  Shield,
  Calendar,
  User,
  Search,
  MoreVertical,
  Grid,
  List
} from "lucide-react"

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

interface VaultDetailProps {
  vault: Vault
  items: VaultItem[]
  onBack: () => void
  onEdit: () => void
  onUpload: (files: File[]) => void
  onDownloadItem: (itemId: string) => void
  onDeleteItem: (itemId: string) => void
}

export function VaultDetail({ 
  vault, 
  items, 
  onBack, 
  onEdit, 
  onUpload, 
  onDownloadItem, 
  onDeleteItem 
}: VaultDetailProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'password': return <Key className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'crypto': return <Shield className="h-4 w-4" />
      case 'bank': return <FileText className="h-4 w-4" />
      default: return <Archive className="h-4 w-4" />
    }
  }

  const getItemColor = (type: string) => {
    switch (type) {
      case 'password': return 'bg-yellow-100 text-yellow-800'
      case 'document': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-purple-100 text-purple-800'
      case 'image': return 'bg-green-100 text-green-800'
      case 'note': return 'bg-gray-100 text-gray-800'
      case 'crypto': return 'bg-orange-100 text-orange-800'
      case 'bank': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpload(files)
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'share_after_death': return <Share2 className="h-4 w-4" />
      case 'delete_after_death': return <Archive className="h-4 w-4" />
      case 'sign_off_after_death': return <Lock className="h-4 w-4" />
      default: return <FolderOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Vault Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                vault.is_encrypted ? 'bg-yellow-100' : 'bg-primary'
              }`}>
                {vault.is_encrypted ? (
                  <Lock className="h-4 w-4 text-yellow-600" />
                ) : (
                  <div className="h-4 w-4 bg-primary-foreground rounded" />
                )}
              </div>
              {vault.name}
            </h1>
            <p className="text-muted-foreground">{vault.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Vault
          </Button>
        </div>
      </div>

      {/* Vault Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getCategoryIcon(vault.category)}
              <Badge variant="secondary">
                {vault.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">
                {vault.is_encrypted ? 'Encrypted' : 'Standard'}
              </span>
              {vault.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">Total files</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </div>

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search.' : 'Upload your first files to get started.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}>
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getItemColor(item.type)}`}>
                      {getItemIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(item.size)} • {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => onDownloadItem(item.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteItem(item.id)}>
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {item.is_encrypted && (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-yellow-600">
                    <Lock className="h-3 w-3" />
                    <span>Encrypted</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
