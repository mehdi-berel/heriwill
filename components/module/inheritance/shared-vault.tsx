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
  Users, 
  FileText, 
  Eye, 
  Download, 
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
  Filter
} from "lucide-react"

interface SharedVault {
  id: string
  name: string
  description?: string
  isEncrypted: boolean
  accessLevel: 'full' | 'read_only' | 'time_limited'
  sharedWith: string[]
  itemCount: number
  totalSize: number
  lastAccessed?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
  owner: string
  permissions: VaultPermission[]
}

interface VaultPermission {
  heirId: string
  heirName: string
  accessLevel: 'full' | 'read_only' | 'time_limited'
  grantedAt: string
  expiresAt?: string
  lastAccessed?: string
}

interface SharedVaultProps {
  vault: SharedVault
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
  onDownload: () => void
  onLockToggle: () => void
  onPermissionUpdate: (permission: VaultPermission) => void
}

export function SharedVault({ 
  vault, 
  onBack, 
  onEdit, 
  onDelete, 
  onShare, 
  onDownload, 
  onLockToggle,
  onPermissionUpdate 
}: SharedVaultProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'full': return <Key className="h-4 w-4 text-green-600" />
      case 'read_only': return <Eye className="h-4 w-4 text-blue-600" />
      case 'time_limited': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Lock className="h-4 w-4 text-gray-600" />
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'bg-green-100 text-green-800'
      case 'read_only': return 'bg-blue-100 text-blue-800'
      case 'time_limited': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'full': return 'Full Access'
      case 'read_only': return 'Read Only'
      case 'time_limited': return 'Time Limited'
      default: return level
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

  const isExpired = vault.expiresAt && new Date(vault.expiresAt) < new Date()
  const isExpiringSoon = vault.expiresAt && new Date(vault.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const filteredPermissions = vault.permissions.filter(permission =>
    permission.heirName.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <p className="text-muted-foreground">Shared Vault • {vault.itemCount} items</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={onLockToggle}>
            {vault.isEncrypted ? (
              <Unlock className="h-4 w-4 mr-2" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            {vault.isEncrypted ? 'Unlock' : 'Lock'}
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

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
                    <p className="text-sm font-medium">Security Status</p>
                    <p className="text-sm">{vault.isEncrypted ? 'Encrypted' : 'Unencrypted'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Archive className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Contents</p>
                    <p className="text-sm">{vault.itemCount} items • {formatSize(vault.totalSize)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getAccessLevelIcon(vault.accessLevel)}
                  <div>
                    <p className="text-sm font-medium">Your Access</p>
                    <p className="text-sm">{getAccessLevelLabel(vault.accessLevel)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
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

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Shared Permissions
                <Badge variant="secondary">{vault.permissions.length}</Badge>
              </CardTitle>
              <CardDescription>
                Manage who has access to this vault and their permission levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Permissions List */}
                <div className="space-y-3">
                  {filteredPermissions.map((permission, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{permission.heirName}</p>
                          <p className="text-sm text-muted-foreground">
                            Granted {formatDate(permission.grantedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getAccessLevelColor(permission.accessLevel)}>
                          <div className="flex items-center space-x-1">
                            {getAccessLevelIcon(permission.accessLevel)}
                            <span>{getAccessLevelLabel(permission.accessLevel)}</span>
                          </div>
                        </Badge>
                        
                        {permission.expiresAt && (
                          <Badge variant="outline" className="text-xs">
                            Expires {formatDate(permission.expiresAt)}
                          </Badge>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPermissionUpdate(permission)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredPermissions.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No permissions found matching your search.' : 'No permissions granted yet.'}
                    </p>
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
                {/* Mock activity data */}
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vault accessed</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <Badge variant="secondary">Access</Badge>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Share2 className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Permission granted to John Doe</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                  <Badge variant="secondary">Shared</Badge>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Lock className="h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vault encryption updated</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                  <Badge variant="secondary">Security</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vault Settings</CardTitle>
              <CardDescription>
                Configure vault security and sharing options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Encryption Settings */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Encryption</p>
                    <p className="text-sm text-muted-foreground">
                      {vault.isEncrypted ? 'Vault is encrypted' : 'Vault is not encrypted'}
                    </p>
                  </div>
                  <Button variant="outline" onClick={onLockToggle}>
                    {vault.isEncrypted ? 'Disable' : 'Enable'}
                  </Button>
                </div>

                {/* Expiration Settings */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Expiration</p>
                    <p className="text-sm text-muted-foreground">
                      {vault.expiresAt ? `Expires ${formatDate(vault.expiresAt)}` : 'No expiration set'}
                    </p>
                  </div>
                  <Button variant="outline">
                    {vault.expiresAt ? 'Update' : 'Set'}
                  </Button>
                </div>

                {/* Access Control */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Access Control</p>
                    <p className="text-sm text-muted-foreground">
                      {vault.permissions.length} people have access
                    </p>
                  </div>
                  <Button variant="outline" onClick={onShare}>
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
