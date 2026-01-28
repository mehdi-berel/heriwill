"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Heart, 
  Eye, 
  EyeOff, 
  Save, 
  X 
} from "lucide-react"

interface HeirFormData {
  full_name: string
  email: string
  phone: string
  relationship: string
  heir_type: 'family' | 'friend' | 'professional' | 'organization'
  access_level: 'full' | 'partial' | 'view'
  invitation_expires_at?: string
}

interface HeirFormProps {
  onSubmit: (data: HeirFormData) => void
  onCancel: () => void
  initialData?: Partial<HeirFormData>
  isEditing?: boolean
}

export function HeirForm({ onSubmit, onCancel, initialData, isEditing = false }: HeirFormProps) {
  const [formData, setFormData] = useState<HeirFormData>({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    relationship: initialData?.relationship || '',
    heir_type: initialData?.heir_type || 'family',
    access_level: initialData?.access_level || 'view',
    invitation_expires_at: initialData?.invitation_expires_at || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'bg-purple-100 text-purple-800'
      case 'partial': return 'bg-blue-100 text-blue-800'
      case 'view': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccessLevelDescription = (level: string) => {
    switch (level) {
      case 'full': return 'Complete access to all vaults and settings'
      case 'partial': return 'Limited access to selected vaults'
      case 'view': return 'Read-only access to designated content'
      default: return 'Limited access'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>{isEditing ? 'Edit Heir' : 'Add New Heir'}</span>
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update heir information and access permissions.'
            : 'Invite someone to become an heir for your digital legacy.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full legal name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="heir@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g., Spouse, Child, Sibling, Friend"
                  required
                />
              </div>
            </div>
          </div>

          {/* Heir Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Heir Type</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'family', label: 'Family' },
                { value: 'friend', label: 'Friend' },
                { value: 'professional', label: 'Professional' },
                { value: 'organization', label: 'Organization' }
              ].map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={formData.heir_type === type.value ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, heir_type: type.value as any })}
                  className="rounded-lg"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Access Level */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Access Level</span>
            </h3>
            <div className="space-y-3">
              {[
                { value: 'view', label: 'View Only', description: 'Read-only access to designated content' },
                { value: 'partial', label: 'Partial Access', description: 'Limited access to selected vaults' },
                { value: 'full', label: 'Full Access', description: 'Complete access to all vaults and settings' }
              ].map((level) => (
                <div
                  key={level.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.access_level === level.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, access_level: level.value as 'full' | 'partial' | 'view' })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                    <Badge className={getAccessLevelColor(level.value)}>
                      {level.value}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invitation Expiration */}
          {!isEditing && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Invitation Settings</span>
              </h3>
              <div>
                <Label htmlFor="expires_at">Invitation expires (optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.invitation_expires_at}
                  onChange={(e) => setFormData({ ...formData, invitation_expires_at: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for no expiration
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-2">
            <Button type="submit">
              {isEditing ? 'Update Heir' : 'Send Invitation'}
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
