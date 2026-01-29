"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Star,
  Building
} from "lucide-react"

interface Notary {
  id: string
  user_id: string
  name: string
  firm_name?: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  license_number?: string
  specialization?: string
  notes?: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

interface NotaryDetailProps {
  notary: Notary
  onEdit?: () => void
  onDelete?: () => void
  onSetPrimary?: () => void
  onClose?: () => void
}

export function NotaryDetail({ notary, onEdit, onDelete, onSetPrimary, onClose }: NotaryDetailProps) {
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
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-600/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-text-primary">{notary.name}</h2>
              {notary.is_primary && (
                <Badge className="bg-amber-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Primary
                </Badge>
              )}
            </div>
            <p className="text-text-secondary">Notary Public</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete} className="text-status-error hover:text-status-error">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary-400" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-text-tertiary mt-0.5" />
              <div>
                <p className="text-sm text-text-tertiary">Email</p>
                <p className="font-medium text-text-primary">{notary.email}</p>
              </div>
            </div>
            {notary.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-text-tertiary mt-0.5" />
                <div>
                  <p className="text-sm text-text-tertiary">Phone</p>
                  <p className="font-medium text-text-primary">{notary.phone}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-text-tertiary mt-0.5" />
            <div>
              <p className="text-sm text-text-tertiary">Address</p>
              <p className="font-medium text-text-primary">
                {notary.address}, {notary.city}, {notary.state} {notary.zip_code}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-400" />
            Professional Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {notary.license_number && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-text-tertiary mt-0.5" />
                <div>
                  <p className="text-sm text-text-tertiary">License Number</p>
                  <p className="font-medium text-text-primary">{notary.license_number}</p>
                </div>
              </div>
            )}
            {notary.firm_name && (
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-text-tertiary mt-0.5" />
                <div>
                  <p className="text-sm text-text-tertiary">Firm/Company</p>
                  <p className="font-medium text-text-primary">{notary.firm_name}</p>
                </div>
              </div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-text-tertiary mt-0.5" />
              <div>
                <p className="text-sm text-text-tertiary">Added On</p>
                <p className="font-medium text-text-primary">{formatDate(notary.created_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-text-tertiary mt-0.5" />
              <div>
                <p className="text-sm text-text-tertiary">Last Updated</p>
                <p className="font-medium text-text-primary">{formatDate(notary.updated_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#232629' }}>
            <div className="flex items-center gap-3">
              {notary.is_primary ? (
                <CheckCircle className="h-5 w-5 text-status-success" />
              ) : (
                <XCircle className="h-5 w-5 text-text-tertiary" />
              )}
              <div>
                <p className="font-medium">Primary Notary</p>
                <p className="text-sm text-text-tertiary">
                  {notary.is_primary 
                    ? 'This is your primary notary contact' 
                    : 'Set as primary notary for default selection'}
                </p>
              </div>
            </div>
            {!notary.is_primary && onSetPrimary && (
              <Button variant="outline" size="sm" onClick={onSetPrimary}>
                Set as Primary
              </Button>
            )}
          </div>

          {notary.specialization && (
            <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#232629' }}>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="font-medium">Specialization</p>
                  <p className="text-sm text-text-tertiary">{notary.specialization}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
