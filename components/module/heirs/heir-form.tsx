"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Users, 
  Shield, 
  Key,
  Calendar,
  MessageSquare
} from "lucide-react"

interface HeirFormData {
  full_name: string
  email: string
  phone: string
  relationship: string
  access_level: 'full' | 'partial' | 'view'
  notification_preferences: {
    email: boolean
    sms: boolean
    in_app: boolean
  }
  backup_contact: {
    name: string
    phone: string
    relationship: string
  }
  special_instructions: string
  verification_method: 'email' | 'phone' | 'id_document' | 'other'
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
    access_level: initialData?.access_level || 'view',
    notification_preferences: {
      email: initialData?.notification_preferences?.email ?? true,
      sms: initialData?.notification_preferences?.sms ?? false,
      in_app: initialData?.notification_preferences?.in_app ?? true
    },
    backup_contact: {
      name: initialData?.backup_contact?.name || '',
      phone: initialData?.backup_contact?.phone || '',
      relationship: initialData?.backup_contact?.relationship || ''
    },
    special_instructions: initialData?.special_instructions || '',
    verification_method: initialData?.verification_method || 'email',
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
          <UserPlus className="h-5 w-5" />
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
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="e.g., Spouse, Child, Sibling, Friend"
                  required
                />
              </div>
            </div>
          </div>

          {/* Access Level */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Key className="h-5 w-5" />
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
                  onClick={() => setFormData(prev => ({ ...prev, access_level: level.value as any }))}
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

          {/* Verification Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Verification Method</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'email', label: 'Email', icon: Mail },
                { value: 'phone', label: 'Phone', icon: Phone },
                { value: 'id_document', label: 'ID Document', icon: Users },
                { value: 'other', label: 'Other', icon: MessageSquare }
              ].map((method) => (
                <Button
                  key={method.value}
                  type="button"
                  variant={formData.verification_method === method.value ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, verification_method: method.value as any }))}
                  className="flex items-center space-x-2"
                >
                  <method.icon className="h-4 w-4" />
                  <span>{method.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email_notifications"
                  checked={formData.notification_preferences.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notification_preferences: { ...prev.notification_preferences, email: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="email_notifications" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email notifications</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sms_notifications"
                  checked={formData.notification_preferences.sms}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notification_preferences: { ...prev.notification_preferences, sms: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="sms_notifications" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>SMS notifications</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="in_app_notifications"
                  checked={formData.notification_preferences.in_app}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notification_preferences: { ...prev.notification_preferences, in_app: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="in_app_notifications">In-app notifications</Label>
              </div>
            </div>
          </div>

          {/* Backup Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Backup Contact (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="backup_name">Contact Name</Label>
                <Input
                  id="backup_name"
                  value={formData.backup_contact.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    backup_contact: { ...prev.backup_contact, name: e.target.value }
                  }))}
                  placeholder="Backup contact name"
                />
              </div>
              <div>
                <Label htmlFor="backup_phone">Contact Phone</Label>
                <Input
                  id="backup_phone"
                  type="tel"
                  value={formData.backup_contact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    backup_contact: { ...prev.backup_contact, phone: e.target.value }
                  }))}
                  placeholder="Backup contact phone"
                />
              </div>
              <div>
                <Label htmlFor="backup_relationship">Relationship</Label>
                <Input
                  id="backup_relationship"
                  value={formData.backup_contact.relationship}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    backup_contact: { ...prev.backup_contact, relationship: e.target.value }
                  }))}
                  placeholder="Relationship to heir"
                />
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Special Instructions</h3>
            <div>
              <Label htmlFor="instructions">Additional notes or instructions for this heir</Label>
              <Input
                id="instructions"
                value={formData.special_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                placeholder="Any special instructions or notes"
              />
            </div>
          </div>

          {/* Invitation Expiration */}
          {!isEditing && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Invitation Settings</span>
              </h3>
              <div>
                <Label htmlFor="expires_at">Invitation expires (optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.invitation_expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, invitation_expires_at: e.target.value }))}
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
