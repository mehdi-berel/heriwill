"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Lock, 
  Unlock, 
  FolderOpen, 
  FileText, 
  Eye, 
  Download, 
  Upload, 
  Share2, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Key,
  Shield,
  Archive,
  Globe,
  Heart,
  Star,
  MoreVertical,
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Users
} from "lucide-react"

interface VaultItem {
  id: string
  name: string
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other'
  size: number
  description?: string
  tags: string[]
  isEncrypted: boolean
  isShared: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  lastAccessed?: string
  downloadCount: number
  path: string
  thumbnail?: string
}

interface VaultDetails {
  id: string
  name: string
  description?: string
  isEncrypted: boolean
  isShared: boolean
  itemCount: number
  totalSize: number
  owner: string
  sharedWith: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
  lastAccessed?: string
  expiresAt?: string
  accessCode?: string
  items: VaultItem[]
}

interface VaultDetailsProps {
  vault: VaultDetails
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
  onUpload: (files: File[]) => void
  onDownload: (item: VaultItem) => void
  onItemSelect: (item: VaultItem) => void
  onItemDelete: (itemId: string) => void
}

export function VaultDetails({ 
  vault, 
  onBack, 
  onEdit, 
  onDelete, 
  onShare, 
  onUpload, 
  onDownload, 
  onItemSelect,
  onItemDelete 
}: VaultDetailsProps) {
  const [activeTab, setActiveTab] = useState('items')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedType, setSelectedType] = useState<string>('all')

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />
      case 'image': return <Globe className="h-4 w-4" />
      case 'video': return <Eye className="h-4 w-4" />
      case 'audio': return <Heart className="h-4 w-4" />
      case 'archive': return <Archive className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getItemColor = (type: string) => {
    switch (type) {
      case 'document': return 'text-blue-600'
      case 'image': return 'text-green-600'
      case 'video': return 'text-purple-600'
      case 'audio': return 'text-pink-600'
      case 'archive': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredItems = vault.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = selectedType === 'all' || item.type === selectedType
    
    return matchesSearch && matchesType
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'date':
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        break
      case 'size':
        comparison = b.size - a.size
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const itemTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'archive', label: 'Archives' },
    { value: 'other', label: 'Other' }
  ]

  const isExpired = vault.expiresAt && new Date(vault.expiresAt) < new Date()
  const isExpiringSoon = vault.expiresAt && new Date(vault.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${vault.isEncrypted ? 'bg-green-100' : 'bg-gray-100'}`}>
              {vault.isEncrypted ? (
                <Lock className="h-6 w-6 text-green-600" />
              ) : (
                <Unlock className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{vault.name}</h1>
              <p className="text-muted-foreground">
                {vault.itemCount} items • {formatSize(vault.totalSize)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onUpload(Array.from(e.target.files || []))}
          />
          <Button variant="outline" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      {isExpired && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">This vault has expired</span>
            </div>
          </CardContent>
        </Card>
      )}

      {isExpiringSoon && !isExpired && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                This vault expires on {formatDate(vault.expiresAt!)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="items">Items ({vault.items.length})</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                {itemTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
                <option value="size">Sort by Size</option>
                <option value="type">Sort by Type</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              
              <div className="flex border border-input rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Items Display */}
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedItems.map(item => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-muted ${getItemColor(item.type)}`}>
                        {getItemIcon(item.type)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {item.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        {item.isShared && (
                          <Share2 className="h-4 w-4 text-blue-500" />
                        )}
                        {item.isEncrypted && (
                          <Lock className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-sm truncate">{item.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {formatSize(item.size)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onItemSelect(item)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(item)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onItemDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedItems.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-muted ${getItemColor(item.type)}`}>
                          {getItemIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatSize(item.size)} • {formatDate(item.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {item.isFavorite && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          {item.isShared && (
                            <Share2 className="h-4 w-4 text-blue-500" />
                          )}
                          {item.isEncrypted && (
                            <Lock className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(item)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {sortedItems.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-muted-foreground">
                {searchTerm || selectedType !== 'all'
                  ? 'No items found matching your criteria.'
                  : 'No items in this vault yet.'
                }
              </div>
              {!searchTerm && selectedType === 'all' && (
                <div className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Upload files to get started with this vault.
                  </p>
                  <Button onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Vault Information */}
            <Card>
              <CardHeader>
                <CardTitle>Vault Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  {vault.isEncrypted ? (
                    <Lock className="h-4 w-4 text-green-600" />
                  ) : (
                    <Unlock className="h-4 w-4 text-gray-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Security</p>
                    <p className="text-sm">{vault.isEncrypted ? 'Encrypted' : 'Unencrypted'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Contents</p>
                    <p className="text-sm">{vault.itemCount} items • {formatSize(vault.totalSize)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Share2 className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Sharing</p>
                    <p className="text-sm">{vault.isShared ? 'Shared' : 'Private'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Shared With</p>
                    <p className="text-sm">{vault.sharedWith.length} people</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Details */}
            <Card>
              <CardHeader>
                <CardTitle>Access Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm">{formatDate(vault.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{formatDate(vault.updatedAt)}</p>
                  </div>
                </div>

                {vault.lastAccessed && (
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Accessed</p>
                      <p className="text-sm">{formatDate(vault.lastAccessed)}</p>
                    </div>
                  </div>
                )}

                {vault.expiresAt && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Expires</p>
                      <p className="text-sm">{formatDate(vault.expiresAt)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Owner</p>
                    <p className="text-sm">{vault.owner}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {vault.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{vault.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sharing Settings</CardTitle>
              <CardDescription>
                Manage who has access to this vault
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Vault Status</p>
                    <p className="text-sm text-muted-foreground">
                      {vault.isShared ? 'Shared with others' : 'Private vault'}
                    </p>
                  </div>
                  <Button variant="outline" onClick={onShare}>
                    {vault.isShared ? 'Manage' : 'Share'}
                  </Button>
                </div>

                {vault.sharedWith.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Shared With:</p>
                    {vault.sharedWith.map((person, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{person}</span>
                        </div>
                        <Badge variant="secondary">Can access</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recent access and modifications to this vault
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Upload className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Files uploaded</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <Badge variant="secondary">Upload</Badge>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vault accessed</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                  <Badge variant="secondary">Access</Badge>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Share2 className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vault shared with John Doe</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                  <Badge variant="secondary">Shared</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
