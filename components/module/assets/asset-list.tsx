"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  DollarSign, 
  Users,
  FileText,
  Home,
  Car,
  Building,
  Briefcase,
  Shield,
  Package,
  TrendingUp
} from "lucide-react"

interface Asset {
  id: string
  name: string
  type: 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'
  description?: string
  value?: number
  location?: string
  ownership_type: 'sole' | 'joint' | 'tenants_in_common' | 'community_property'
  beneficiaries: string[]
  documents: string[]
  notes?: string
  created_at: string
  updated_at: string
}

interface AssetListProps {
  assets: Asset[]
  onAssetSelect: (asset: Asset) => void
  onAssetEdit: (asset: Asset) => void
  onAssetDelete: (assetId: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function AssetList({ 
  assets, 
  onAssetSelect, 
  onAssetEdit, 
  onAssetDelete, 
  searchTerm, 
  onSearchChange 
}: AssetListProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'created'>('name')

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'real_estate': return <Home className="h-5 w-5" />
      case 'vehicle': return <Car className="h-5 w-5" />
      case 'bank_account': return <Building className="h-5 w-5" />
      case 'investment': return <TrendingUp className="h-5 w-5" />
      case 'insurance': return <Shield className="h-5 w-5" />
      case 'business': return <Briefcase className="h-5 w-5" />
      case 'personal_property': return <Package className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'real_estate': return 'Real Estate'
      case 'vehicle': return 'Vehicle'
      case 'bank_account': return 'Bank Account'
      case 'investment': return 'Investment'
      case 'insurance': return 'Insurance'
      case 'personal_property': return 'Personal Property'
      case 'business': return 'Business'
      default: return 'Other'
    }
  }

  const getOwnershipLabel = (type: string) => {
    switch (type) {
      case 'sole': return 'Sole'
      case 'joint': return 'Joint'
      case 'tenants_in_common': return 'Tenants in Common'
      case 'community_property': return 'Community Property'
      default: return type
    }
  }

  const formatValue = (value?: number) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || asset.type === selectedType
    
    return matchesSearch && matchesType
  })

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'value':
        return (b.value || 0) - (a.value || 0)
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return 0
    }
  })

  const assetTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'bank_account', label: 'Bank Account' },
    { value: 'investment', label: 'Investment' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'personal_property', label: 'Personal Property' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' }
  ]

  const totalValue = filteredAssets.reduce((sum, asset) => sum + (asset.value || 0), 0)

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            {assetTypes.map(type => (
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
            <option value="value">Sort by Value</option>
            <option value="created">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">
          {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
        </div>
        <div className="text-sm font-medium">
          Total Value: {formatValue(totalValue)}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedAssets.map(asset => (
          <Card key={asset.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getAssetIcon(asset.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{asset.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {getAssetTypeLabel(asset.type)}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {asset.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {asset.description}
                </p>
              )}
              
              <div className="space-y-2">
                {asset.value && (
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{formatValue(asset.value)}</span>
                  </div>
                )}
                
                {asset.location && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="truncate">{asset.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>{getOwnershipLabel(asset.ownership_type)}</span>
                </div>
              </div>

              {asset.beneficiaries.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Beneficiaries:</div>
                  <div className="flex flex-wrap gap-1">
                    {asset.beneficiaries.slice(0, 2).map((beneficiary, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {beneficiary}
                      </Badge>
                    ))}
                    {asset.beneficiaries.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{asset.beneficiaries.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {asset.documents.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{asset.documents.length} document{asset.documents.length === 1 ? '' : 's'}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssetSelect(asset)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssetEdit(asset)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssetDelete(asset.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedAssets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || selectedType !== 'all' 
              ? 'No assets found matching your criteria.' 
              : 'No assets yet. Add your first asset to get started.'
            }
          </div>
          {!searchTerm && selectedType === 'all' && (
            <Button className="mt-4" onClick={() => {/* Open add form */}}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Asset
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
