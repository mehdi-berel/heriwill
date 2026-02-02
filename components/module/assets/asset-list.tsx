"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Car, 
  Edit, 
  Trash2, 
  DollarSign, 
  MapPin,
  FileText,
  Package
} from "lucide-react"

interface Asset {
  id: string
  name: string
  type: 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'
  description?: string
  value?: number
  location?: string
  ownership_type: 'sole' | 'joint' | 'tenants_in_common' | 'community_property'
  beneficiaries?: string[]
  documents?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

interface AssetListProps {
  assets: Asset[]
  onAssetEdit: (asset: Asset) => void
  onAssetDelete: (assetId: string) => void
}

export function AssetList({ 
  assets, 
  onAssetEdit, 
  onAssetDelete
}: AssetListProps) {
  const router = useRouter()

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'real_estate': return <Home className="h-6 w-6 text-white" />
      case 'vehicle': return <Car className="h-6 w-6 text-white" />
      default: return <FileText className="h-6 w-6 text-white" />
    }
  }

  const getAssetColor = () => {
    return 'rgb(124, 58, 237)' // purple for all
  }

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'real_estate': return 'Real Estate'
      case 'vehicle': return 'Vehicle'
      default: return 'Other'
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

  const sortedAssets = [...assets].sort((a, b) => a.name.localeCompare(b.name))


  return (
    <div className="space-y-4 sm:space-y-6">
      {sortedAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">No assets found</h3>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8 max-w-md">
            Add your first asset to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {sortedAssets.map(asset => (
            <div
              key={asset.id}
              className="flex items-center p-3 sm:p-4 bg-background-card border rounded-xl cursor-pointer hover:border-primary/50 transition-all group"
              style={{ borderColor: '#232629' }}
              onClick={() => router.push(`/assets/${asset.id}`)}
            >
              {/* Icon Container */}
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-2.5 sm:mr-3 flex-shrink-0"
                style={{ backgroundColor: getAssetColor() }}
              >
                <div className="scale-75 sm:scale-100">
                  {getAssetIcon(asset.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                  <h3 className="text-sm sm:text-base font-semibold truncate">{asset.name}</h3>
                  {asset.value && (
                    <div className="px-1.5 py-0.5 rounded bg-green-500/20 flex items-center">
                      <DollarSign className="h-3 w-3 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground">
                  <span className="hidden xs:inline">{getAssetTypeLabel(asset.type)}</span>
                  <span className="xs:hidden">{asset.type.split('_')[0]}</span>
                  {asset.value && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-xs sm:text-sm">{formatValue(asset.value)}</span>
                    </>
                  )}
                  {asset.location && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 hidden sm:inline" />
                      <span className="truncate hidden sm:inline">{asset.location}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAssetEdit(asset)
                  }}
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAssetDelete(asset.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
