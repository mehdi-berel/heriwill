"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle
} from "lucide-react"

interface Heir {
  id: string
  full_name: string
  email: string
  phone?: string
  relationship: string
  invitation_status: 'pending' | 'accepted' | 'rejected' | 'expired'
  invitation_code?: string
  access_level: 'full' | 'partial' | 'view'
  created_at: string
  accepted_at?: string
  invitation_expires_at?: string
}

interface HeirActivity {
  id: string
  type: 'login' | 'vault_access' | 'settings_change' | 'verification_completed'
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface HeirDetailProps {
  heir: Heir
  activities: HeirActivity[]
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onResendInvitation: () => void
  onRevokeAccess: () => void
  onRefreshActivity: () => void
}

export function HeirDetail({ 
  heir
}: HeirDetailProps) {

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'rejected': return <AlertTriangle className="h-4 w-4" />
      case 'expired': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border">
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <div className="text-primary">{getStatusIcon(heir.invitation_status)}</div>
            </div>
            <div className="text-3xl font-bold mb-1 capitalize">{heir.invitation_status}</div>
            <div className="text-sm text-muted-foreground font-medium text-center">Status</div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">{heir.relationship || 'N/A'}</div>
            <div className="text-sm text-muted-foreground font-medium text-center">Relationship</div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">{new Date(heir.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div className="text-sm text-muted-foreground font-medium text-center">Created</div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{heir.email}</span>
          </div>
          {heir.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{heir.phone}</span>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{heir.relationship}</span>
          </div>
          {heir.invitation_code && (
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{heir.invitation_code}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
