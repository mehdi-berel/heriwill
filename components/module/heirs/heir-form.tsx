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
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <User className="h-5 w-5" />
          <span>{isEditing ? 'Edit Heir' : 'Add New Heir'}</span>
        </CardTitle>
        <CardDescription className="text-sm">
          {isEditing 
            ? 'Update heir information and access permissions.'
            : 'Invite someone to become an heir for your digital legacy.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Relationship & Type */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Relationship Details</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="full_name" className="text-sm sm:text-base">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full legal name"
                  className="text-sm sm:text-base h-10 sm:h-11 mt-1.5"
                  required
                />
              </div>
            </div>
          </div>

          {/* Access Level */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Access Permissions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'full', label: 'Full Access' },
                { value: 'partial', label: 'Partial Access' },
                { value: 'view', label: 'View Only' }
              ].map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={formData.access_level === type.value ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, access_level: type.value as HeirFormData['access_level'] })}
                  className="rounded-lg"
                >
                  {type.label}
                </Button>
              ))}
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-0">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-11">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto h-11">
              {isEditing ? 'Update Heir' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
