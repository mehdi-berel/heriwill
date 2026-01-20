"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Key,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  MessageSquare,
  UserPlus,
  Activity,
  FileText,
  Settings
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
  verification_method: 'email' | 'phone' | 'id_document' | 'other'
  verification_status: 'pending' | 'verified' | 'failed'
  created_at: string
  accepted_at?: string
  last_activity?: string
  invitation_expires_at?: string
  backup_contact?: {
    name: string
    phone: string
    relationship: string
  }
  notification_preferences: {
    email: boolean
    sms: boolean
    in_app: boolean
  }
  special_instructions?: string
}

interface HeirActivity {
  id: string
  type: 'login' | 'vault_access' | 'settings_change' | 'verification_completed'
  description: string
  timestamp: string
  metadata?: Record<string, any>
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
  heir, 
  activities, 
  onBack, 
  onEdit, 
  onDelete, 
  onResendInvitation,
  onRevokeAccess,
  onRefreshActivity
}: HeirDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'rejected': return <AlertTriangle className="h-4 w-4" />
      case 'expired': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'bg-purple-100 text-purple-800'
      case 'partial': return 'bg-blue-100 text-blue-800'
      case 'view': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'id_document': return <Users className="h-4 w-4" />
      case 'other': return <MessageSquare className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Users className="h-4 w-4" />
      case 'vault_access': return <Key className="h-4 w-4" />
      case 'settings_change': return <Settings className="h-4 w-4" />
      case 'verification_completed': return <CheckCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'text-blue-600'
      case 'vault_access': return 'text-green-600'
      case 'settings_change': return 'text-purple-600'
      case 'verification_completed': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const isInvitationExpired = () => {
    if (!heir.invitation_expires_at) return false
    return new Date(heir.invitation_expires_at) < new Date()
  }

  const formatDuration = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-3">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary-foreground" />
              </div>
              {heir.full_name}
            </h1>
            <p className="text-muted-foreground">{heir.relationship}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {heir.invitation_status === 'pending' && (
            <Button variant="outline" onClick={onResendInvitation}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend
            </Button>
          )}
          {heir.invitation_status === 'accepted' && (
            <Button variant="outline" onClick={onRevokeAccess}>
              <Shield className="h-4 w-4 mr-2" />
              Revoke
            </Button>
          )}
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(heir.invitation_status)}
              <Badge className={getStatusColor(heir.invitation_status)}>
                {heir.invitation_status}
              </Badge>
              {isInvitationExpired() && (
                <Badge variant="destructive">Expired</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Access Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getAccessLevelColor(heir.access_level)}>
              <Key className="h-3 w-3 mr-1" />
              {heir.access_level}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getVerificationIcon(heir.verification_method)}
              <span className="text-sm capitalize">{heir.verification_method}</span>
              <Badge variant={heir.verification_status === 'verified' ? 'default' : 'secondary'}>
                {heir.verification_status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Invited</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(heir.created_at).toLocaleDateString()} at {new Date(heir.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              {heir.accepted_at && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Accepted</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(heir.accepted_at).toLocaleDateString()} at {new Date(heir.accepted_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}
              {heir.last_activity && (
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Last Activity</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(heir.last_activity)}
                    </div>
                  </div>
                </div>
              )}
              {heir.invitation_expires_at && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Invitation Expires</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(heir.invitation_expires_at).toLocaleDateString()} at {new Date(heir.invitation_expires_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Contact */}
          {heir.backup_contact && (
            <Card>
              <CardHeader>
                <CardTitle>Backup Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-medium">{heir.backup_contact.name}</div>
                <div className="text-sm text-muted-foreground">
                  {heir.backup_contact.relationship} • {heir.backup_contact.phone}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Instructions */}
          {heir.special_instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{heir.special_instructions}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="outline" size="sm" onClick={onRefreshActivity}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                <p className="text-muted-foreground">
                  This heir hasn't performed any activities yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email notifications</span>
                </div>
                <Badge variant={heir.notification_preferences.email ? 'default' : 'secondary'}>
                  {heir.notification_preferences.email ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>SMS notifications</span>
                </div>
                <Badge variant={heir.notification_preferences.sms ? 'default' : 'secondary'}>
                  {heir.notification_preferences.sms ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>In-app notifications</span>
                </div>
                <Badge variant={heir.notification_preferences.in_app ? 'default' : 'secondary'}>
                  {heir.notification_preferences.in_app ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Invitation Code */}
          {heir.invitation_code && (
            <Card>
              <CardHeader>
                <CardTitle>Invitation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Invitation Code</Label>
                  <Input value={heir.invitation_code} readOnly className="font-mono" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Share this code with the heir for manual invitation entry.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
