"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Users, 
  FileText, 
  Calendar,
  Home,
  Car,
  Building,
  TrendingUp,
  Shield,
  Briefcase,
  Package,
  Download,
  Upload,
  Plus
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

interface AssetDetailProps {
  asset: Asset
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onDownloadDocument: (docName: string) => void
  onDeleteDocument: (docName: string) => void
}

export function AssetDetail({ 
  asset, 
  onBack, 
  onEdit, 
  onDelete, 
  onDownloadDocument, 
  onDeleteDocument 
}: AssetDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'real_estate': return <Home className="h-6 w-6" />
      case 'vehicle': return <Car className="h-6 w-6" />
      case 'bank_account': return <Building className="h-6 w-6" />
      case 'investment': return <TrendingUp className="h-6 w-6" />
      case 'insurance': return <Shield className="h-6 w-6" />
      case 'business': return <Briefcase className="h-6 w-6" />
      case 'personal_property': return <Package className="h-6 w-6" />
      default: return <FileText className="h-6 w-6" />
    }
  }

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              {getAssetIcon(asset.type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{asset.name}</h1>
              <p className="text-muted-foreground">{getAssetTypeLabel(asset.type)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {asset.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{asset.description}</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Estimated Value</p>
                    <p className="text-lg font-bold">{formatValue(asset.value)}</p>
                  </div>
                </div>

                {asset.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm">{asset.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Ownership Type</p>
                    <p className="text-sm">{getOwnershipLabel(asset.ownership_type)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Beneficiaries</span>
                  <Badge variant="secondary">{asset.beneficiaries?.length || 0}</Badge>
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
              </CardContent>
            </Card>
          </div>

          {asset.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="beneficiaries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Designated Beneficiaries
                <Badge variant="secondary">{asset.beneficiaries?.length || 0}</Badge>
              </CardTitle>
              <CardDescription>
                People who will inherit this asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              {asset.beneficiaries && asset.beneficiaries.length > 0 ? (
                <div className="space-y-3">
                  {asset.beneficiaries.map((beneficiary, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{beneficiary}</p>
                          <p className="text-sm text-muted-foreground">Beneficiary</p>
                        </div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No beneficiaries designated</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add beneficiaries to ensure proper inheritance distribution
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Related Documents
                <Badge variant="outline">{asset.documents?.length || 0}</Badge>
              </CardTitle>
              <CardDescription>
                Legal documents and paperwork for this asset
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timestamps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm">{formatDate(asset.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{formatDate(asset.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
