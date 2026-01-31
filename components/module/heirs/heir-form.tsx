"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Heart,
  Mail,
  Phone
} from "lucide-react"

interface HeirFormData {
  full_name: string
  email: string
  phone: string
  relationship: string
  heir_type: 'family' | 'friend' | 'professional' | 'organization'
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
            ? 'Update heir information and contact details.'
            : 'Invite someone to become an heir for your digital legacy.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Basic Information</h3>
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
              <div>
                <Label htmlFor="relationship" className="text-sm sm:text-base">Relationship</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g., Spouse, Child, Friend"
                  className="text-sm sm:text-base h-10 sm:h-11 mt-1.5"
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

          {/* Contact Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="email" className="text-sm sm:text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="heir@example.com"
                  className="text-sm sm:text-base h-10 sm:h-11 mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm sm:text-base flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="text-sm sm:text-base h-10 sm:h-11 mt-1.5"
                />
              </div>
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
