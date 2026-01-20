"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, X, Plus, Trash2 } from "lucide-react"

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

interface AssetFormProps {
  initialData?: Partial<Asset>
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'other',
    description: initialData?.description || '',
    value: initialData?.value || '',
    location: initialData?.location || '',
    ownership_type: initialData?.ownership_type || 'sole',
    beneficiaries: initialData?.beneficiaries || [],
    documents: initialData?.documents || [],
    notes: initialData?.notes || ''
  })

  const [newBeneficiary, setNewBeneficiary] = useState('')
  const [newDocument, setNewDocument] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      value: formData.value ? parseFloat(formData.value) : undefined
    })
  }

  const addBeneficiary = () => {
    if (newBeneficiary.trim()) {
      setFormData(prev => ({
        ...prev,
        beneficiaries: [...prev.beneficiaries, newBeneficiary.trim()]
      }))
      setNewBeneficiary('')
    }
  }

  const removeBeneficiary = (index: number) => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index)
    }))
  }

  const addDocument = () => {
    if (newDocument.trim()) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument.trim()]
      }))
      setNewDocument('')
    }
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const assetTypes = [
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'bank_account', label: 'Bank Account' },
    { value: 'investment', label: 'Investment' },
    { value: 'insurance', label: 'Insurance Policy' },
    { value: 'personal_property', label: 'Personal Property' },
    { value: 'business', label: 'Business Interest' },
    { value: 'other', label: 'Other' }
  ]

  const ownershipTypes = [
    { value: 'sole', label: 'Sole Ownership' },
    { value: 'joint', label: 'Joint Ownership' },
    { value: 'tenants_in_common', label: 'Tenants in Common' },
    { value: 'community_property', label: 'Community Property' }
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {initialData?.id ? 'Edit Asset' : 'Add New Asset'}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Add details about your assets for inheritance planning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Primary Residence, 2018 Honda Accord"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Asset Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the asset, its condition, and any relevant details"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="value">Estimated Value</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., 123 Main St, City, State"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownership_type">Ownership Type</Label>
            <Select
              value={formData.ownership_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, ownership_type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ownership type" />
              </SelectTrigger>
              <SelectContent>
                {ownershipTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Beneficiaries</Label>
            <div className="flex gap-2">
              <Input
                value={newBeneficiary}
                onChange={(e) => setNewBeneficiary(e.target.value)}
                placeholder="Add beneficiary name"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBeneficiary())}
              />
              <Button type="button" onClick={addBeneficiary} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.beneficiaries.map((beneficiary, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {beneficiary}
                  <button
                    type="button"
                    onClick={() => removeBeneficiary(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Related Documents</Label>
            <div className="flex gap-2">
              <Input
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                placeholder="Add document name or reference"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
              />
              <Button type="button" onClick={addDocument} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.documents.map((document, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {document}
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about this asset"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {initialData?.id ? 'Update Asset' : 'Save Asset'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
