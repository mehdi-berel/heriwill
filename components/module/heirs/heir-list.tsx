"use client"

import { Button } from "@/components/ui/button"
import { 
  Users, 
  Mail, 
  Edit, 
  Trash2, 
  CheckCircle 
} from "lucide-react"

interface Heir {
  id: string
  user_id: string
  full_name_encrypted: string | null
  email_encrypted: string | null
  phone_encrypted: string | null
  relationship: string | null
  heir_type: 'family' | 'friend' | 'professional' | 'organization' | null
  invitation_status: 'pending' | 'accepted' | 'rejected' | 'expired' | null
  invitation_code: string | null
  access_level: 'full' | 'partial' | 'view'
  created_at: string
  accepted_at: string | null
  invitation_expires_at: string | null
  invited_at: string | null
  has_accepted: boolean | null
  is_active: boolean | null
  notify_on_activation: boolean | null
  notification_delay_days: number | null
  inheritance_plan_id: string | null
  heir_user_id: string | null
  updated_at: string
  rejected_at: string | null
  notification_status?: string
  notified_at?: string | null
  death_confirmed_at?: string | null
  relationship_encrypted?: string | null
}

interface HeirListProps {
  heirs: Heir[]
  onView: (heir: Heir) => void
  onEdit: (heir: Heir) => void
  onDelete: (heirId: string) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  selectedStatus?: 'pending' | 'accepted' | 'active' | null
}

export function HeirList({ 
  heirs, 
  onView, 
  onEdit, 
  onDelete, 
  searchTerm = '',
  selectedStatus = null
}: HeirListProps) {

  const filteredHeirs = heirs.filter(heir => {
    const matchesSearch = heir.full_name_encrypted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         heir.email_encrypted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         heir.relationship?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (selectedStatus === null) {
      matchesStatus = true // Show all when no filter selected
    } else if (selectedStatus === 'pending') {
      matchesStatus = heir.invitation_status === 'pending'
    } else if (selectedStatus === 'accepted') {
      matchesStatus = heir.has_accepted === true
    } else if (selectedStatus === 'active') {
      matchesStatus = heir.is_active === true
    }
    
    return matchesSearch && matchesStatus
  })

  const sortedHeirs = [...filteredHeirs].sort((a, b) => (a.full_name_encrypted || '').localeCompare(b.full_name_encrypted || ''))

  return (
    <div className="space-y-6">
      {/* Heirs List */}
      {sortedHeirs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No heirs found</h3>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            {searchTerm || selectedStatus !== null
              ? 'Try adjusting your search or filters.' 
              : 'Add your first heir to start planning your digital legacy.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHeirs.map((heir) => (
            <div
              key={heir.id}
              className="flex items-center p-4 bg-background-card border border-border rounded-xl cursor-pointer hover:border-primary/50 transition-all group"
              onClick={() => onView(heir)}
            >
              {/* Icon Container */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                style={{ backgroundColor: 'rgb(124, 58, 237)' }}
              >
                <Users className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-base font-semibold truncate">{heir.full_name_encrypted || 'Unnamed Heir'}</h3>
                  {heir.invitation_status === 'accepted' && (
                    <div className="px-1.5 py-0.5 rounded bg-success/20 flex items-center">
                      <CheckCircle className="h-3 w-3 text-success" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{heir.email_encrypted || 'No email'}</span>
                  {heir.relationship && (
                    <>
                      <span>•</span>
                      <span>{heir.relationship}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(heir)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(heir.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
