"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { HeirForm } from "@/components/module/heirs/heir-form"
import { HeirList } from "@/components/module/heirs/heir-list"
import { HeirInvitation } from "@/components/module/heirs/heir-invitation"
import { HeirInvitationCard } from "@/components/module/heirs/heir-invitation-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, Mail, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { 
  createHeirInvitation, 
  getPendingInvitations, 
  acceptHeirInvitation, 
  rejectHeirInvitation 
} from "@/app/actions/heirInvitations"

interface Heir {
  id: string
  user_id: string
  full_name_encrypted: string | null
  email_encrypted: string | null
  phone_encrypted: string | null
  relationship: string | null
  heir_type: 'family' | 'friend' | 'professional' | 'organization' | null
  access_level: 'full' | 'partial' | 'view'
  invitation_status: 'pending' | 'accepted' | 'rejected' | 'expired' | null
  invitation_code: string | null
  invited_at: string | null
  invitation_expires_at: string | null
  has_accepted: boolean | null
  accepted_at: string | null
  notify_on_activation: boolean | null
  notification_delay_days: number | null
  is_active: boolean | null
  rejected_at: string | null
  heir_user_id: string | null
  inheritance_plan_id: string | null
  created_at: string
  updated_at: string
}

interface HeirFormData {
  full_name: string
  email: string
  phone?: string
  relationship?: string
  heir_type?: 'family' | 'friend' | 'professional' | 'organization'
  notification_delay_days?: number
  is_active?: boolean
  notify_on_activation?: boolean
  invitation_expires_at?: string
}

export default function HeirsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingHeir, setEditingHeir] = useState<Heir | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [heirToDelete, setHeirToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'heirs' | 'pending' | 'successors'>('heirs')
  const [receivedInvitations, setReceivedInvitations] = useState<Heir[]>([])
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [newlyCreatedHeir, setNewlyCreatedHeir] = useState<Heir | null>(null)
  const router = useRouter()

  const loadHeirs = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('heirs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading heirs:', error)
        return
      }

      setHeirs(data || [])
    } catch (error) {
      console.error('Error loading heirs:', error)
    }
  }, [])

  const loadReceivedInvitations = useCallback(async () => {
    try {
      const invitations = await getPendingInvitations()
      setReceivedInvitations(invitations as Heir[])
    } catch (error) {
      console.error('Error loading invitations:', error)
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load heirs data and invitations
      await loadHeirs(user.id)
      await loadReceivedInvitations()
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
        loadHeirs(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, loadHeirs, loadReceivedInvitations])

  const handleAddHeir = async (formData: HeirFormData) => {
    if (!user) return

    try {
      const result = await createHeirInvitation({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        relationship: formData.relationship,
        heir_type: formData.heir_type,
        code_validity_days: 7
      })

      if (result.heir) {
        setHeirs([result.heir, ...heirs])
        setNewlyCreatedHeir(result.heir)
        setShowForm(false)
        setShowInvitationModal(true)
      }
    } catch (error) {
      console.error('Error adding heir:', error)
    }
  }

  const handleUpdateHeir = async (formData: HeirFormData) => {
    if (!editingHeir) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('heirs') as any)
        .update({
          full_name_encrypted: formData.full_name,
          email_encrypted: formData.email,
          phone_encrypted: formData.phone || null,
          relationship: formData.relationship || null,
          heir_type: formData.heir_type || 'family',
          notification_delay_days: formData.notification_delay_days || 0,
          is_active: formData.is_active !== undefined ? formData.is_active : true
        })
        .eq('id', editingHeir.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating heir:', error)
        return
      }

      if (data) {
        setHeirs(heirs.map(h => h.id === editingHeir.id ? data : h))
        setShowForm(false)
        setEditingHeir(null)
      }
    } catch (error) {
      console.error('Error updating heir:', error)
    }
  }

  const handleDeleteHeir = (heirId: string) => {
    setHeirToDelete(heirId)
    setShowDeleteModal(true)
  }

  const confirmDeleteHeir = async () => {
    if (!heirToDelete) return

    try {
      const { error } = await supabase
        .from('heirs')
        .delete()
        .eq('id', heirToDelete)
      
      if (error) {
        console.error('Error deleting heir:', error)
        return
      }
      
      setHeirs(heirs.filter(h => h.id !== heirToDelete))
      
      setShowDeleteModal(false)
      setHeirToDelete(null)
    } catch (error) {
      console.error('Error deleting heir:', error)
    }
  }

  const handleHeirSelect = (heir: Heir) => {
    router.push(`/heirs/${heir.id}`)
  }

  const handleHeirEdit = (heir: Heir) => {
    setEditingHeir(heir)
    setShowForm(true)
  }

  const handleAcceptInvitation = async (invitationCode: string) => {
    try {
      await acceptHeirInvitation(invitationCode)
      await loadReceivedInvitations()
      await loadHeirs(user?.id || '')
    } catch (error) {
      console.error('Error accepting invitation:', error)
    }
  }

  const handleDeclineInvitation = async (invitationCode: string) => {
    try {
      await rejectHeirInvitation(invitationCode)
      await loadReceivedInvitations()
    } catch (error) {
      console.error('Error declining invitation:', error)
    }
  }

  return (
    <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Heirs</h1>
            <Button 
              onClick={() => {
                setEditingHeir(null)
                setShowForm(true)
              }}
              className="h-12 w-12 rounded-full p-0"
            >
              <span className="text-2xl">+</span>
            </Button>
          </div>
          
          {/* 3-Tab System */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={activeTab === 'heirs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('heirs')}
              className="rounded-lg flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Heirs ({heirs.filter(h => h.has_accepted === true).length})
            </Button>
            <Button
              variant={activeTab === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('pending')}
              className="rounded-lg flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Pending ({heirs.filter(h => h.invitation_status === 'pending' && !h.has_accepted).length + receivedInvitations.length})
            </Button>
            <Button
              variant={activeTab === 'successors' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('successors')}
              className="rounded-lg flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Successors ({receivedInvitations.filter(h => h.has_accepted).length})
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search heirs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background-secondary rounded-xl"
              style={{ borderColor: '#232629' }}
            />
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'heirs' && (
          <HeirList
            heirs={heirs.filter(h => h.has_accepted === true)}
            onView={handleHeirSelect}
            onEdit={handleHeirEdit}
            onDelete={handleDeleteHeir}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={null}
          />
        )}

        {activeTab === 'pending' && (
          <div className="space-y-4">
            {/* Invited heirs (not yet accepted) */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">People you invited</h3>
              {heirs.filter(h => h.invitation_status === 'pending' && !h.has_accepted).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pending invitations sent</p>
                </div>
              ) : (
                <HeirList
                  heirs={heirs.filter(h => h.invitation_status === 'pending' && !h.has_accepted)}
                  onView={handleHeirSelect}
                  onEdit={handleHeirEdit}
                  onDelete={handleDeleteHeir}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStatus={null}
                />
              )}
            </div>

            {/* Received invitations */}
            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-medium text-muted-foreground">Invitations you received</h3>
              {receivedInvitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No invitations received</p>
                </div>
              ) : (
                receivedInvitations.map((invitation) => (
                  <HeirInvitationCard
                    key={invitation.id}
                    successor={{
                      id: invitation.id,
                      full_name: invitation.full_name_encrypted || 'Unknown',
                      email: invitation.email_encrypted || undefined,
                      phone: invitation.phone_encrypted || undefined,
                      relationship: invitation.relationship || undefined,
                      heir_type: invitation.heir_type || 'family',
                      invitation_status: invitation.invitation_status || 'pending',
                      invited_at: invitation.invited_at || ''
                    }}
                    ownerName={user?.email || 'Owner'}
                    isAccepted={invitation.has_accepted || false}
                    onAccept={() => handleAcceptInvitation(invitation.invitation_code || '')}
                    onDecline={() => handleDeclineInvitation(invitation.invitation_code || '')}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'successors' && (
          <div className="space-y-4">
            {receivedInvitations.filter(h => h.has_accepted).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You are not a successor for anyone yet</p>
                <p className="text-sm mt-2">Accept invitations in the Pending tab to become a successor</p>
              </div>
            ) : (
              receivedInvitations.filter(h => h.has_accepted).map((successor) => (
                <HeirInvitationCard
                  key={successor.id}
                  successor={{
                    id: successor.id,
                    full_name: successor.full_name_encrypted || 'Unknown',
                    email: successor.email_encrypted || undefined,
                    phone: successor.phone_encrypted || undefined,
                    relationship: successor.relationship || undefined,
                    heir_type: successor.heir_type || 'family',
                    invitation_status: successor.invitation_status || 'accepted',
                    invited_at: successor.invited_at || ''
                  }}
                  ownerName={user?.email || 'Owner'}
                  isAccepted={true}
                  onAccept={() => {}}
                  onDecline={() => {}}
                />
              ))
            )}
          </div>
        )}

        {/* Heir Form Modal */}
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open)
          if (!open) setEditingHeir(null)
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">
              {editingHeir ? "Edit Heir" : "Add New Heir"}
            </DialogTitle>
            <HeirForm
              initialData={editingHeir ? {
                full_name: editingHeir.full_name_encrypted || '',
                email: editingHeir.email_encrypted || '',
                phone: editingHeir.phone_encrypted || '',
                relationship: editingHeir.relationship || '',
                heir_type: editingHeir.heir_type || 'family',
                invitation_expires_at: editingHeir.invitation_expires_at || undefined
              } : undefined}
              onSubmit={editingHeir ? handleUpdateHeir : handleAddHeir}
              onCancel={() => {
                setShowForm(false)
                setEditingHeir(null)
              }}
              isEditing={!!editingHeir}
            />
          </DialogContent>
        </Dialog>

        {/* Invitation Modal */}
        <Dialog open={showInvitationModal} onOpenChange={setShowInvitationModal}>
          <DialogContent className="max-w-2xl">
            <DialogTitle className="sr-only">Heir Invitation Created</DialogTitle>
            {newlyCreatedHeir && (
              <HeirInvitation
                heirName={newlyCreatedHeir.full_name_encrypted || ''}
                heirEmail={newlyCreatedHeir.email_encrypted || ''}
                invitationCode={newlyCreatedHeir.invitation_code || ''}
                invitationLink={`https://app.heriwill.com/auth/invite?code=${newlyCreatedHeir.invitation_code}&type=heir`}
                onClose={() => {
                  setShowInvitationModal(false)
                  setNewlyCreatedHeir(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogTitle>Delete Heir</DialogTitle>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete this heir? This action cannot be undone and they will lose all access to your vaults.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setHeirToDelete(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteHeir}
                >
                  Delete Heir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}
