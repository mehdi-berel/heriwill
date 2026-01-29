"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  Star, 
  Calendar, 
  Users, 
  Shield, 
  Share2, 
  Copy, 
  ExternalLink, 
  Upload,
  ArrowLeft,
  Archive,
  History,
  Key
} from "lucide-react"

interface VaultItem {
  id: string
  name: string
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other'
  size: number
  description?: string
  content?: string
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
  url?: string
  owner: string
  sharedWith: string[]
  permissions: string[]
  checksum?: string
  metadata?: Record<string, unknown>
}

interface ItemDetailsProps {
  item: VaultItem
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onDownload: () => void
  onShare: () => void
  onFavorite: () => void
  onLockToggle: () => void
  onCopyLink: () => void
}

export function ItemDetails({ 
  item, 
  onBack, 
  onEdit, 
  onDelete, 
  onDownload, 
  onShare, 
  onFavorite, 
  onLockToggle,
  onCopyLink
}: ItemDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-6 w-6" />
      case 'image': return <Eye className="h-6 w-6" />
      case 'video': return <Eye className="h-6 w-6" />
      case 'audio': return <Eye className="h-6 w-6" />
      case 'archive': return <FileText className="h-6 w-6" />
      default: return <FileText className="h-6 w-6" />
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

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'document': return 'Document'
      case 'image': return 'Image'
      case 'video': return 'Video'
      case 'audio': return 'Audio'
      case 'archive': return 'Archive'
      default: return 'Other'
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg bg-muted ${getItemColor(item.type)}`}>
              {getItemIcon(item.type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{item.name}</h1>
              <p className="text-muted-foreground">
                {getItemTypeLabel(item.type)} • {formatSize(item.size)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onFavorite}
            className={item.isFavorite ? 'text-yellow-600' : ''}
          >
            <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="outline" onClick={onCopyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={onLockToggle}>
            {item.isEncrypted ? (
              <Unlock className="h-4 w-4 mr-2" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            {item.isEncrypted ? 'Unlock' : 'Lock'}
          </Button>
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getItemIcon(item.type)}
                  <div>
                    <p className="text-sm font-medium">File Type</p>
                    <p className="text-sm">{getItemTypeLabel(item.type)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Archive className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">File Size</p>
                    <p className="text-sm">{formatSize(item.size)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {item.isEncrypted ? (
                    <Lock className="h-4 w-4 text-green-600" />
                  ) : (
                    <Unlock className="h-4 w-4 text-gray-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Encryption</p>
                    <p className="text-sm">{item.isEncrypted ? 'Encrypted' : 'Not Encrypted'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {item.isShared ? (
                    <Share2 className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Shield className="h-4 w-4 text-gray-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Sharing</p>
                    <p className="text-sm">{item.isShared ? 'Shared' : 'Private'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Access Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Downloads</p>
                    <p className="text-sm">{formatNumber(item.downloadCount)} times</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Last Accessed</p>
                    <p className="text-sm">
                      {item.lastAccessed ? formatDate(item.lastAccessed) : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm">{formatDate(item.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{formatDate(item.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {item.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {item.url ? (
            <Card>
              <CardHeader>
                <CardTitle>External Content</CardTitle>
                <CardDescription>
                  This item is available at an external URL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-mono break-all">{item.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => window.open(item.url, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                    <Button variant="outline" onClick={onDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : item.content ? (
            <Card>
              <CardHeader>
                <CardTitle>Content Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{item.content}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Content Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This item doesn&apos;t have a description yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sharing Settings</CardTitle>
              <CardDescription>
                Manage who has access to this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sharing Status</p>
                    <p className="text-sm text-muted-foreground">
                      {item.isShared ? 'Shared with others' : 'Private item'}
                    </p>
                  </div>
                  <Button variant="outline" onClick={onShare}>
                    {item.isShared ? 'Manage' : 'Share'}
                  </Button>
                </div>

                {item.sharedWith.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Shared With:</p>
                    {item.sharedWith.map((person, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded" style={{ borderColor: '#232629' }}>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{person}</span>
                        </div>
                        <Badge variant="secondary">Can access</Badge>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Access Link</p>
                    <p className="text-sm text-muted-foreground">
                      Generate a shareable link for this item
                    </p>
                  </div>
                  <Button variant="outline" onClick={onCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Version History</span>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Version
                </Button>
              </CardTitle>
              <CardDescription>
                Track changes and different versions of this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Version */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <History className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Current Version</p>
                      <p className="text-sm text-muted-foreground">
                        {formatSize(item.size)} • {formatDate(item.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                {/* Mock Previous Versions */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <History className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Previous Version</p>
                      <p className="text-sm text-muted-foreground">
                        {formatSize(item.size * 0.8)} • {formatDate(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* File Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>File Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">File ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{item.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">File Path</p>
                  <p className="text-sm text-muted-foreground font-mono">{item.path}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">File Type</p>
                  <p className="text-sm">{getItemTypeLabel(item.type)}</p>
                </div>
                {item.checksum && (
                  <div>
                    <p className="text-sm font-medium">Checksum</p>
                    <p className="text-sm text-muted-foreground font-mono">{item.checksum}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner and Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Ownership & Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Owner</p>
                    <p className="text-sm">{item.owner}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Permissions</p>
                    <p className="text-sm">{item.permissions.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metadata */}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <p className="text-sm font-medium">{key}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
