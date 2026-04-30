"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trash2,
  MapPin,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Download,
  Upload,
  Plus,
  Check
} from "lucide-react"

interface Heir {
  id: string
  name: string | null
  relationship?: string | null
}

interface Asset {
  id: string
  name: string
  type: 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'
  description?: string
  value?: number
  location?: string
  ownership_type: 'sole' | 'joint' | 'tenants_in_common' | 'community_property'
  beneficiaries?: string[]
  heir_ids?: string[]
  documents?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

interface AssetDetailProps {
  asset: Asset
  heirs: Heir[]
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onUploadDocument: (files: File[]) => Promise<void>
  onDownloadDocument: (docName: string) => void
  onDeleteDocument: (docName: string) => void
  onUpdateHeirs: (heirIds: string[]) => Promise<void>
}

export function AssetDetail({
  asset,
  heirs,
  onDownloadDocument,
  onDeleteDocument,
  onUpdateHeirs
}: AssetDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedHeirIds, setSelectedHeirIds] = useState<string[]>(asset.heir_ids || [])
  const [isUpdating, setIsUpdating] = useState(false)

  const handleHeirToggle = async (heirId: string) => {
    const newSelectedHeirIds = selectedHeirIds.includes(heirId)
      ? selectedHeirIds.filter(id => id !== heirId)
      : [...selectedHeirIds, heirId]

    setSelectedHeirIds(newSelectedHeirIds)
    setIsUpdating(true)

    try {
      await onUpdateHeirs(newSelectedHeirIds)
    } catch (error) {
      // Revert on error
      setSelectedHeirIds(selectedHeirIds)
    } finally {
      setIsUpdating(false)
    }
  }

  // Commented out unused function
  // const getAssetIcon = (type: string) => {
  //   switch (type) {
  //     case 'real_estate': return <Home className="h-6 w-6" />
  //     case 'vehicle': return <Car className="h-6 w-6" />
  //     case 'bank_account': return <Building className="h-6 w-6" />
  //     case 'investment': return <TrendingUp className="h-6 w-6" />
  //     case 'insurance': return <Shield className="h-6 w-6" />
  //     case 'business': return <Briefcase className="h-6 w-6" />
  //     case 'personal_property': return <Package className="h-6 w-6" />
  //     default: return <FileText className="h-6 w-6" />
  //   }
  // }

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'real_estate': return 'Real Estate'
      case 'vehicle': return 'Vehicle'
      case 'bank_account': return 'Bank Account'
      case 'investment': return 'Investment'
      case 'insurance': return 'Insurance Policy'
      case 'personal_property': return 'Personal Property'
      case 'business': return 'Business Interest'
      default: return 'Other'
    }
  }

  const getOwnershipLabel = (type: string) => {
    switch (type) {
      case 'sole': return 'Sole Ownership'
      case 'joint': return 'Joint Ownership'
      case 'tenants_in_common': return 'Tenants in Common'
      case 'community_property': return 'Community Property'
      default: return type
    }
  }

  const formatValue = (value?: number) => {
    if (!value) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="p-4 bg-background-card border rounded-xl" style={{ borderColor: '#232629' }}>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                {asset.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{asset.description}</p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Estimated Value</p>
                    <p className="text-lg font-bold">{formatValue(asset.value)}</p>
                  </div>
                </div>

                {asset.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm">{asset.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Ownership Type</p>
                    <p className="text-sm">{getOwnershipLabel(asset.ownership_type)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 bg-background-card border rounded-xl" style={{ borderColor: '#232629' }}>
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Beneficiaries</span>
                  <Badge variant="secondary">{selectedHeirIds.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Documents</span>
                  <Badge variant="outline">{asset.documents?.length || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Created</span>
                  <span className="text-sm">{formatDate(asset.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm">{formatDate(asset.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {asset.notes && (
            <div className="p-4 bg-background-card border rounded-xl" style={{ borderColor: '#232629' }}>
              <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
              <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="beneficiaries" className="space-y-6">
          <div className="p-4 bg-background-card border rounded-xl" style={{ borderColor: '#232629' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Designated Beneficiaries</h3>
              <Badge variant="secondary">{selectedHeirIds.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Select heirs who will inherit this asset</p>

            {heirs && heirs.length > 0 ? (
              <div className="space-y-3">
                {heirs.map((heir) => (
                  <div
                    key={heir.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedHeirIds.includes(heir.id) ? 'bg-primary/5' : ''
                    }`}
                    style={{ borderColor: '#232629' }}
                    onClick={() => !isUpdating && handleHeirToggle(heir.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={selectedHeirIds.includes(heir.id)}
                        onCheckedChange={() => !isUpdating && handleHeirToggle(heir.id)}
                        disabled={isUpdating}
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{heir.name || 'Unnamed Heir'}</p>
                          <p className="text-sm text-muted-foreground">{heir.relationship || 'Heir'}</p>
                        </div>
                      </div>
                    </div>
                    {selectedHeirIds.includes(heir.id) && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No heirs available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add heirs in the Heirs section to assign them to assets
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="p-4 bg-background-card border rounded-xl" style={{ borderColor: '#232629' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Related Documents</h3>
              <Badge variant="outline">{asset.documents?.length || 0}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Legal documents and paperwork for this asset</p>

            <div className="space-y-4">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload documents related to this asset
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>

              {/* Documents List */}
              {asset.documents && asset.documents.length > 0 ? (
                <div className="space-y-2">
                  {asset.documents.map((document, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg" style={{ borderColor: '#232629' }}>
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{document}</p>
                          <p className="text-sm text-muted-foreground">Document</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadDocument(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteDocument(document)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents uploaded</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload deeds, titles, policies, or other relevant documents
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-4 bg-background-card border rounded-xl" style={{ borderColor: '#232629' }}>
              <h3 className="text-lg font-semibold mb-4">Asset Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Asset ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{asset.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Asset Type</p>
                  <p className="text-sm">{getAssetTypeLabel(asset.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ownership Type</p>
                  <p className="text-sm">{getOwnershipLabel(asset.ownership_type)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background-card border rounded-xl" style={{ borderColor: '#232629' }}>
              <h3 className="text-lg font-semibold mb-4">Timestamps</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm">{formatDate(asset.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{formatDate(asset.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
