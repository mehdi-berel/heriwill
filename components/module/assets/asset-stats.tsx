"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Car, 
  Building, 
  TrendingUp, 
  Shield, 
  Briefcase, 
  Package, 
  FileText,
  DollarSign,
  MapPin,
  Users,
  PieChart,
  Eye,
  Edit,
  Trash2
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

interface AssetStats {
  totalAssets: number
  totalValue: number
  realEstateCount: number
  vehicleCount: number
  bankAccountCount: number
  investmentCount: number
  insuranceCount: number
  personalPropertyCount: number
  businessCount: number
  otherCount: number
  soleOwnershipCount: number
  jointOwnershipCount: number
  withBeneficiariesCount: number
  withLocationCount: number
  withDocumentsCount: number
  averageValue: number
  highestValueAsset?: {
    name: string
    value: number
    type: string
  }
}

interface AssetStatsProps {
  stats: AssetStats
  assets?: Asset[]
  onAssetSelect?: (asset: Asset) => void
  onAssetEdit?: (asset: Asset) => void
  onAssetDelete?: (assetId: string) => void
}

export function AssetStats({ stats, assets = [], onAssetSelect, onAssetEdit, onAssetDelete }: AssetStatsProps) {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getAssetTypeInfo = (type: string) => {
    const icons = {
      real_estate: { icon: Home, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Real Estate' },
      vehicle: { icon: Car, color: 'text-green-600', bg: 'bg-green-100', label: 'Vehicle' },
      bank_account: { icon: Building, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Bank Account' },
      investment: { icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Investment' },
      insurance: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100', label: 'Insurance' },
      business: { icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Business' },
      personal_property: { icon: Package, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Personal Property' },
      other: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Other' }
    }

    return icons[type as keyof typeof icons] || icons.other
  }

  const getOwnershipInfo = (type: string) => {
    const types = {
      sole: { label: 'Sole', color: 'bg-blue-100 text-blue-800' },
      joint: { label: 'Joint', color: 'bg-green-100 text-green-800' },
      tenants_in_common: { label: 'Tenants in Common', color: 'bg-purple-100 text-purple-800' },
      community_property: { label: 'Community Property', color: 'bg-orange-100 text-orange-800' }
    }
    return types[type as keyof typeof types] || types.sole
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              All registered assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatValue(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Combined asset value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatValue(stats.averageValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per asset average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Beneficiaries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withBeneficiariesCount}</div>
            <p className="text-xs text-muted-foreground">
              Assets with designated beneficiaries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Simple Asset List */}
      {assets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>
              Your registered assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets.map((asset) => {
                const typeInfo = getAssetTypeInfo(asset.type)
                const ownershipInfo = getOwnershipInfo(asset.ownership_type)
                const Icon = typeInfo.icon

                return (
                  <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                        <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold truncate">{asset.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {typeInfo.label}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs ${ownershipInfo.color}`}>
                            {ownershipInfo.label}
                          </Badge>
                        </div>
                        {asset.description && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {asset.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          {asset.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{asset.location}</span>
                            </div>
                          )}
                          {asset.beneficiaries.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{asset.beneficiaries.length} beneficiaries</span>
                            </div>
                          )}
                          {asset.documents.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>{asset.documents.length} documents</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        {asset.value && (
                          <div className="font-semibold text-green-600">
                            {formatValue(asset.value)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {onAssetSelect && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAssetSelect(asset)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onAssetEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAssetEdit(asset)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onAssetDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAssetDelete(asset.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
