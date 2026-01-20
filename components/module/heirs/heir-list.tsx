"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Mail, 
  Phone, 
  UserPlus, 
  Eye, 
  Edit,
  Trash2,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Key,
  Calendar,
  MessageSquare
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

interface HeirListProps {
  heirs: Heir[]
  onHeirSelect: (heir: Heir) => void
  onHeirEdit: (heir: Heir) => void
  onHeirDelete: (heirId: string) => void
  onResendInvitation: (heirId: string) => void
  onRevokeAccess: (heirId: string) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
}

export function HeirList({ 
  heirs, 
  onHeirSelect, 
  onHeirEdit, 
  onHeirDelete, 
  onResendInvitation,
  onRevokeAccess,
  searchTerm = '',
  onSearchChange 
}: HeirListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'status'>('name')

  const filteredHeirs = heirs.filter(heir => {
    const matchesSearch = heir.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         heir.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         heir.relationship?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || heir.invitation_status === selectedStatus
    const matchesAccessLevel = selectedAccessLevel === 'all' || heir.access_level === selectedAccessLevel
    
    return matchesSearch && matchesStatus && matchesAccessLevel
  })

  const sortedHeirs = [...filteredHeirs].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.full_name || '').localeCompare(b.full_name || '')
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'status':
        const statusOrder = { 'pending': 0, 'accepted': 1, 'rejected': 2, 'expired': 3 }
        return statusOrder[a.invitation_status] - statusOrder[b.invitation_status]
      default:
        return 0
    }
  })

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
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'expired': return <AlertCircle className="h-4 w-4" />
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

  const statusFilters = [
    { value: 'all', label: 'All Heirs', count: heirs.length },
    { value: 'pending', label: 'Pending', count: heirs.filter(h => h.invitation_status === 'pending').length },
    { value: 'accepted', label: 'Accepted', count: heirs.filter(h => h.invitation_status === 'accepted').length },
    { value: 'rejected', label: 'Rejected', count: heirs.filter(h => h.invitation_status === 'rejected').length },
    { value: 'expired', label: 'Expired', count: heirs.filter(h => h.invitation_status === 'expired').length }
  ]

  const accessLevelFilters = [
    { value: 'all', label: 'All Levels' },
    { value: 'full', label: 'Full Access' },
    { value: 'partial', label: 'Partial Access' },
    { value: 'view', label: 'View Only' }
  ]

  const isInvitationExpired = (heir: Heir) => {
    if (!heir.invitation_expires_at) return false
    return new Date(heir.invitation_expires_at) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search heirs..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Created</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 border-b">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedStatus(filter.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedStatus === filter.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
            <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Access Level Filters */}
      <div className="flex gap-2">
        {accessLevelFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedAccessLevel(filter.value)}
            className={`px-3 py-1 text-sm border rounded-md transition-colors ${
              selectedAccessLevel === filter.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-gray-200 text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Heirs List */}
      {sortedHeirs.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No heirs found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' || selectedAccessLevel !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Add your first heir to start planning your digital legacy.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedHeirs.map((heir) => (
            <Card key={heir.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium">{heir.full_name}</h3>
                        <Badge className={getStatusColor(heir.invitation_status)}>
                          {getStatusIcon(heir.invitation_status)}
                          <span className="ml-1">{heir.invitation_status}</span>
                        </Badge>
                        <Badge className={getAccessLevelColor(heir.access_level)}>
                          <Key className="h-3 w-3 mr-1" />
                          {heir.access_level}
                        </Badge>
                        {isInvitationExpired(heir) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {heir.relationship && `${heir.relationship} • `}
                        {heir.email}
                        {heir.phone && ` • ${heir.phone}`}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          {getVerificationIcon(heir.verification_method)}
                          <span>Verification: {heir.verification_method}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Added {new Date(heir.created_at).toLocaleDateString()}</span>
                        </div>
                        {heir.last_activity && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Last active {new Date(heir.last_activity).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {heir.backup_contact && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Backup:</span> {heir.backup_contact.name} ({heir.backup_contact.relationship})
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onHeirSelect(heir)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onHeirEdit(heir)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {heir.invitation_status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => onResendInvitation(heir.id)}>
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    {heir.invitation_status === 'accepted' && (
                      <Button size="sm" variant="outline" onClick={() => onRevokeAccess(heir.id)}>
                        <Shield className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => onHeirDelete(heir.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
