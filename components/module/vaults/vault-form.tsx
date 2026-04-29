"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  FolderOpen, 
  Share2, 
  Trash2,
  FileText,
  AlertCircle
} from "lucide-react"

interface VaultFormData {
  name: string
  description: string
  category: 'share' | 'delete'
  access_control: {
    allowedHeirs: string[]
    requireApproval: boolean
  }
}

interface VaultFormProps {
  onSubmit: (data: VaultFormData) => void
  onCancel: () => void
  initialData?: Partial<VaultFormData>
}

export function VaultForm({ onSubmit, onCancel, initialData }: VaultFormProps) {
  const [isProUser, setIsProUser] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<VaultFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'share',
    access_control: {
      allowedHeirs: initialData?.access_control?.allowedHeirs || [],
      requireApproval: initialData?.access_control?.requireApproval || true
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vault")
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card className="shadow-2xl border" style={{ borderColor: '#232629', backgroundColor: '#0C0C0E' }}>
      <CardHeader className="text-center space-y-4 pt-8 pb-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg border" style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF640', boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.2)' }}>
            <FolderOpen className="h-10 w-10" style={{ color: '#8B5CF6' }} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold" style={{ color: '#FAFAFA' }}>
              {initialData ? 'Edit Vault' : 'Create New Vault'}
            </CardTitle>
            <CardDescription className="text-base" style={{ color: '#A1A1AA' }}>
              {initialData ? 'Update your vault settings and preferences' : 'Create a secure vault to store your digital assets'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-status-error/10 border-l-4 border-status-error">
              <AlertCircle className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-status-error flex-1">{error}</p>
            </div>
          )}
          {/* Vault Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Vault Name</Label>
            <div className="relative">
              <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter vault name"
                className="pl-12 h-12 transition-colors"
                style={{ backgroundColor: '#141417', borderColor: '#232629' }}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this vault contains"
                className="pl-12 h-12 transition-colors"
                style={{ backgroundColor: '#141417', borderColor: '#232629' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Vault Category</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'share', label: 'Share', shortLabel: 'Share', icon: Share2 },
                { value: 'delete', label: 'Delete', shortLabel: 'Delete', icon: Trash2 },
              ].map((category) => {
                return (
                  <Button
                    key={category.value}
                    type="button"
                    variant={formData.category === category.value ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value as VaultFormData['category'] }))}
                    className="flex items-center justify-center gap-2 h-12 text-base transition-all"
                    style={formData.category === category.value ? { backgroundColor: '#8B5CF6', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' } : { borderColor: '#232629' }}
                    disabled={loading}
                  >
                    <category.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.shortLabel}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="w-full sm:w-auto h-12 text-base transition-all"
              style={{ borderColor: '#232629' }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto h-12 text-base font-semibold transition-all"
              style={{ backgroundColor: '#8B5CF6', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}
              disabled={loading || !formData.name.trim()}
            >
              {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Vault' : 'Create Vault')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
