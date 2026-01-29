"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Shield,
  DollarSign,
  Plus
} from "lucide-react"

interface Heir {
  id: string
  name: string
  email: string
  phone?: string
  relationship: string
  percentage: number
  status: 'pending' | 'accepted' | 'verified' | 'rejected'
  inheritedAssets: InheritedAsset[]
  inheritedVaults: InheritedVault[]
  totalValue: number
  lastContact?: string
  createdAt: string
}

interface InheritedAsset {
  id: string
  name: string
  type: string
  value: number
  description?: string
}

interface InheritedVault {
  id: string
  name: string
  itemCount: number
  isShared: boolean
  lastAccessed?: string
}

interface InheritanceListProps {
  heirs: Heir[]
  onHeirSelect: (heir: Heir) => void
  onHeirEdit: (heir: Heir) => void
  onHeirDelete: (heirId: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function InheritanceList({ 
  heirs, 
  onHeirSelect, 
  onHeirEdit, 
  onHeirDelete, 
  searchTerm, 
  onSearchChange 
}: InheritanceListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'percentage' | 'value' | 'status'>('name')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'verified': return <Shield className="h-4 w-4 text-blue-600" />
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'verified': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepted'
      case 'verified': return 'Verified'
      case 'rejected': return 'Rejected'
      case 'pending': return 'Pending'
      default: return status
    }
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredHeirs = heirs.filter(heir => {
    const matchesSearch = heir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         heir.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         heir.relationship.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || heir.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const sortedHeirs = [...filteredHeirs].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'percentage':
        return b.percentage - a.percentage
      case 'value':
        return b.totalValue - a.totalValue
      case 'status':
        const statusOrder = { 'verified': 0, 'accepted': 1, 'pending': 2, 'rejected': 3 }
        return statusOrder[a.status] - statusOrder[b.status]
      default:
        return 0
    }
  })

  const totalInheritanceValue = heirs.reduce((sum, heir) => sum + heir.totalValue, 0)
  const acceptedHeirs = heirs.filter(h => h.status === 'accepted' || h.status === 'verified').length
  const pendingHeirs = heirs.filter(h => h.status === 'pending').length

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search heirs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'percentage' | 'value' | 'status')}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="percentage">Sort by Percentage</option>
            <option value="value">Sort by Value</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Heirs</p>
                <p className="text-2xl font-bold">{heirs.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatValue(totalInheritanceValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{acceptedHeirs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingHeirs}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heirs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedHeirs.map(heir => (
          <Card key={heir.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{heir.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {heir.relationship} • {heir.percentage}% inheritance
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(heir.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(heir.status)}
                    <span className="text-xs">{getStatusLabel(heir.status)}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Contact Info */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{heir.email}</p>
                {heir.phone && (
                  <p className="text-sm text-muted-foreground">{heir.phone}</p>
                )}
              </div>

              {/* Inheritance Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-medium">{formatValue(heir.totalValue)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assets:</span>
                  <span className="font-medium">{heir.inheritedAssets.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vaults:</span>
                  <span className="font-medium">{heir.inheritedVaults.length}</span>
                </div>
              </div>

              {/* Asset Types Preview */}
              {heir.inheritedAssets.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Inherited Assets:</p>
                  <div className="flex flex-wrap gap-1">
                    {heir.inheritedAssets.slice(0, 3).map((asset, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {asset.type}
                      </Badge>
                    ))}
                    {heir.inheritedAssets.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{heir.inheritedAssets.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Last Contact */}
              {heir.lastContact && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Last contact: {formatDate(heir.lastContact)}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onHeirSelect(heir)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onHeirEdit(heir)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onHeirDelete(heir.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedHeirs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || selectedStatus !== 'all'
              ? 'No heirs found matching your criteria.'
              : 'No heirs designated yet.'
            }
          </div>
          {!searchTerm && selectedStatus === 'all' && (
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Designate heirs to manage your inheritance distribution.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Heir
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
