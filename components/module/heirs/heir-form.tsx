"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Heart
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
                  onClick={() => setFormData({ ...formData, heir_type: type.value as HeirFormData['heir_type'] })}
                  className="rounded-lg"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

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
