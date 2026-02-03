"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Heart,
  Mail,
  Phone,
  AlertCircle,
  Users
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
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<HeirFormData>({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    relationship: initialData?.relationship || '',
    heir_type: initialData?.heir_type || 'family',
    invitation_expires_at: initialData?.invitation_expires_at || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save heir")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border" style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF640', boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.2)' }}>
            <Users className="h-8 w-8" style={{ color: '#8B5CF6' }} />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>
            {isEditing ? 'Edit Heir' : 'Add New Heir'}
          </h2>
          <p className="text-sm" style={{ color: '#A1A1AA' }}>
            {isEditing 
              ? 'Update heir information and contact details'
              : 'Invite someone to become an heir for your digital legacy'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-status-error/10 border-l-4 border-status-error">
            <AlertCircle className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-status-error flex-1">{error}</p>
          </div>
        )}
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter full legal name"
              className="pl-12 h-12 transition-colors"
              style={{ backgroundColor: '#141417', borderColor: '#232629' }}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Relationship */}
        <div className="space-y-2">
          <Label htmlFor="relationship" className="text-sm font-medium">Relationship</Label>
          <div className="relative">
            <Heart className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <Input
              id="relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="e.g., Spouse, Child, Friend"
              className="pl-12 h-12 transition-colors"
              style={{ backgroundColor: '#141417', borderColor: '#232629' }}
              disabled={loading}
            />
          </div>
        </div>

        {/* Heir Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Heir Type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                className="h-12 text-base transition-all"
                style={formData.heir_type === type.value ? { backgroundColor: '#8B5CF6', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' } : { borderColor: '#232629' }}
                disabled={loading}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="heir@example.com"
              className="pl-12 h-12 transition-colors"
              style={{ backgroundColor: '#141417', borderColor: '#232629' }}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="pl-12 h-12 transition-colors"
              style={{ backgroundColor: '#141417', borderColor: '#232629' }}
              disabled={loading}
            />
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
            disabled={loading || !formData.full_name.trim() || !formData.email.trim()}
          >
            {loading ? (isEditing ? 'Updating...' : 'Sending...') : (isEditing ? 'Update Heir' : 'Send Invitation')}
          </Button>
        </div>
      </form>
    </div>
  )
}
