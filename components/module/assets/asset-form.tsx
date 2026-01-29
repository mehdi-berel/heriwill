"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Save, 
  X, 
  Home,
  Car,
  Landmark,
  TrendingUp,
  Shield,
  Package,
  Briefcase,
  FileText,
  DollarSign
} from "lucide-react"

interface Vault {
  id: string
  name: string
  icon?: string
  category: string
}

interface Heir {
  id: string
  full_name_encrypted: string
  relationship?: string
}

interface AssetFormData {
  name: string
  type: string
  description?: string
  value?: string | number
  location?: string
  ownership_type: string
  beneficiaries?: string[]
  documents?: string[]
  notes?: string
}

interface AssetFormProps {
  initialData?: Partial<AssetFormData>
  vaults: Vault[]
  heirs: Heir[]
  onSubmit: (data: AssetFormData) => void
  onCancel: () => void
  isEditing?: boolean
}

export function AssetForm({ initialData, onSubmit, onCancel, isEditing = false }: AssetFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      value: formData.value ? parseFloat(String(formData.value)) : undefined,
    })
  }

  const assetTypes = [
    { value: 'real_estate', label: 'Real Estate', icon: Home, color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { value: 'vehicle', label: 'Vehicle', icon: Car, color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
    { value: 'bank_account', label: 'Bank Account', icon: Landmark, color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    { value: 'investment', label: 'Investment', icon: TrendingUp, color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
    { value: 'insurance', label: 'Insurance', icon: Shield, color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
    { value: 'personal_property', label: 'Personal Property', icon: Package, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300' },
    { value: 'business', label: 'Business', icon: Briefcase, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
    { value: 'other', label: 'Other', icon: FileText, color: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300' }
  ]

  const ownershipTypes = [
    { value: 'sole', label: 'Sole Ownership' },
    { value: 'joint', label: 'Joint Ownership' },
    { value: 'tenants_in_common', label: 'Tenants in Common' },
    { value: 'community_property', label: 'Community Property' }
  ]


  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asset Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Asset Type <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {assetTypes.map((assetType) => {
                const Icon = assetType.icon
                const isSelected = formData.type === assetType.value
                return (
                  <button
                    key={assetType.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: assetType.value })}
                    className={`
                      flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs font-medium text-center ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                      {assetType.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">
                Asset Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Family Home, Toyota Camry, Chase Savings"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide additional details about this asset"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Estimated Value</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownership_type">Ownership Type</Label>
              <Select
                value={formData.ownership_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, ownership_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., 123 Main St, New York, NY 10001"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Asset' : 'Save Asset'}
            </Button>
          </div>
        </form>
    </div>
  )
}
