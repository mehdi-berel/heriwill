"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { HeirForm } from "@/components/module/heirs/heir-form"
import { HeirList } from "@/components/module/heirs/heir-list"
import { HeirInvitation } from "@/components/module/heirs/heir-invitation"
import { HeirInvitationCard } from "@/components/module/heirs/heir-invitation-card"
import { SuccessorCard } from "@/components/module/heirs/successor-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, Mail, Heart, Scale } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"
import { 
  acceptHeirInvitation, 
  rejectHeirInvitation 
} from "@/app/actions/heirInvitations"
import { createHeir, updateHeir, deleteHeir } from "@/app/actions/heirs"

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
  invited_at: string | null
  invitation_expires_at: string | null
  has_accepted: boolean | null
  accepted_at: string | null
  notify_on_activation: boolean | null
  notification_delay_days: number | null
  is_active: boolean | null
  rejected_at: string | null
  heir_user_id: string | null
  created_at: string
  updated_at: string
  users?: { full_name: string | null; email: string | null }
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
  const [userTier, setUserTier] = useState<'free' | 'premium' | 'pro'>('free')
  const [trustedContactMap, setTrustedContactMap] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const loadHeirs = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('heirs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error loading heirs', error, { userId })
        toast.error('Failed to load heirs', 'Please refresh the page')
        return
      }
      setHeirs((data || []) as Heir[])
    } catch (error) {
      logger.error('Error loading heirs', error, { userId })
      toast.error('Failed to load heirs', 'Please refresh the page')
    }
  }, [])

  const loadReceivedInvitations = useCallback(async (userId: string, userEmail: string | undefined) => {
    try {
      // Query 1: Get accepted invitations where heir_user_id matches
      const { data: acceptedByUserId, error: error1 } = await supabase
        .from('heirs')
        .select('*')
        .eq('heir_user_id', userId)
        .eq('invitation_status', 'accepted')
        .order('created_at', { ascending: false })

      if (error1) {
        logger.error('Error fetching accepted invitations', error1)
      }

      // Query 2: Get pending invitations where email matches
      let pendingByEmail: typeof acceptedByUserId = null
      if (userEmail) {
        const { data, error: error2 } = await supabase
          .from('heirs')
          .select('*')
          .eq('email_encrypted', userEmail.toLowerCase().trim())
          .eq('invitation_status', 'pending')
          .order('created_at', { ascending: false })

        if (error2) {
          logger.error('Error fetching pending invitations by email', error2)
        }
        pendingByEmail = data
      }

      // Combine and deduplicate
      const allInvitations = [...(pendingByEmail || []), ...(acceptedByUserId || [])]
      const uniqueInvitations = allInvitations.filter((inv, index, self) =>
        index === self.findIndex((t) => t.id === inv.id)
      )

      // Fetch owner data for each invitation
      const invitationsWithOwnerData = await Promise.all(
        uniqueInvitations.map(async (invitation) => {
          const { data: ownerData } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', invitation.user_id)
            .single()

          return {
            ...invitation,
            users: ownerData || { full_name: null, email: null }
          }
        })
      )

      setReceivedInvitations(invitationsWithOwnerData as Heir[])

      // Check trusted contact status for accepted invitations
      const acceptedInvitations = invitationsWithOwnerData.filter(inv => inv.has_accepted)
      const trustedMap: Record<string, boolean> = {}

      for (const invitation of acceptedInvitations) {
        if (invitation.user_id) {
          const { data: ownerData } = await supabase
            .from('users')
            .select('trusted_contact_heir_id')
            .eq('id', invitation.user_id)
            .single()

          const owner = ownerData as { trusted_contact_heir_id?: string | null } | null
          if (owner?.trusted_contact_heir_id === invitation.id) {
            trustedMap[invitation.id] = true
          }
        }
      }

      setTrustedContactMap(trustedMap)
    } catch (error) {
      logger.error('Error loading invitations', error)
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

      // Get user tier
      const { data: userProfile } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      const tier = (userProfile as { subscription_tier?: string } | null)?.subscription_tier as 'free' | 'premium' | 'pro' ?? 'free'
      setUserTier(tier)

      // Load heirs data and invitations
      await loadHeirs(user.id)
      await loadReceivedInvitations(user.id, user.email ?? undefined)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
        loadHeirs(session.user.id)
        loadReceivedInvitations(session.user.id, session.user.email ?? undefined)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, loadHeirs, loadReceivedInvitations])

  const handleAddHeir = async (formData: HeirFormData) => {
    if (!user) {
      logger.error('No user found when adding heir')
      toast.error('Not authenticated', 'Please log in again')
      return
    }

    try {
      logger.info('Starting heir creation', { userId: user.id, email: formData.email })
      
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + 7)

      const newHeir = await createHeir({
        user_id: user.id,
        full_name: formData.full_name,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone || null,
        relationship: formData.relationship || null,
        heir_type: formData.heir_type || 'family',
        invitation_expires_at: expirationDate.toISOString(),
      })

      logger.info('Heir created successfully', { heirId: newHeir.id })
      
      setHeirs([newHeir as Heir, ...heirs])
      setNewlyCreatedHeir(newHeir as Heir)
      setShowForm(false)
      setShowInvitationModal(true)
      toast.success('Heir invitation created successfully')
      
    } catch (error) {
      setShowForm(false)
      logger.error('Error adding heir', error, {
        formData: { full_name: formData.full_name, email: formData.email },
        userId: user.id,
        errorName: (error as Error).name,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack
      })
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error('Failed to add heir', errorMessage)
    }
  }

  const handleUpdateHeir = async (formData: HeirFormData) => {
    if (!editingHeir) return

    try {
      await updateHeir(editingHeir.id, {
        full_name_encrypted: formData.full_name,
        email_encrypted: formData.email,
        phone_encrypted: formData.phone || null,
        relationship: formData.relationship || null,
        heir_type: formData.heir_type || 'family',
        notification_delay_days: formData.notification_delay_days || 0,
        is_active: formData.is_active !== undefined ? formData.is_active : true
      })

      if (user) {
        await loadHeirs(user.id)
        setShowForm(false)
        setEditingHeir(null)
        toast.success('Heir updated successfully')
      }
    } catch (error) {
      logger.error('Error updating heir', error, { heirId: editingHeir?.id })
      toast.error('Failed to update heir', 'Please try again')
    }
  }

  const handleDeleteHeir = (heirId: string) => {
    setHeirToDelete(heirId)
    setShowDeleteModal(true)
  }

  const confirmDeleteHeir = async () => {
    if (!heirToDelete) return

    try {
      await deleteHeir(heirToDelete)

      if (user) {
        await loadHeirs(user.id)
        setShowDeleteModal(false)
        setHeirToDelete(null)
        toast.success('Heir deleted successfully')
      }
    } catch (error) {
      logger.error('Error deleting heir', error, { heirId: heirToDelete })
      toast.error('Failed to delete heir', 'Please try again')
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
      await loadReceivedInvitations(user?.id || '', user?.email ?? undefined)
      await loadHeirs(user?.id || '')
    } catch (error) {
      logger.error('Error accepting invitation', error, { invitationCode })
      toast.error('Failed to accept invitation', 'Please try again')
    }
  }

  const handleDeclineInvitation = async (invitationCode: string) => {
    try {
      await rejectHeirInvitation(invitationCode)
      await loadReceivedInvitations(user?.id || '', user?.email ?? undefined)
    } catch (error) {
      logger.error('Error declining invitation', error, { invitationCode })
      toast.error('Failed to decline invitation', 'Please try again')
    }
  }

  return (
    <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Heirs</h1>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => {
                  if (userTier === 'pro') {
                    router.push('/notary')
                  }
                }}
                variant="outline"
                className="h-10 px-4 relative"
                disabled={userTier !== 'pro'}
              >
                <Scale className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Notary</span>
                {userTier !== 'pro' && (
                  <Badge className="ml-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 text-xs px-1.5 py-0">
                    PRO
                  </Badge>
                )}
              </Button>
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
              Pending ({heirs.filter(h => h.invitation_status === 'pending' && !h.has_accepted).length + receivedInvitations.filter(h => h.invitation_status === 'pending').length})
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
              {receivedInvitations.filter(h => h.invitation_status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No invitations received</p>
                </div>
              ) : (
                receivedInvitations.filter(h => h.invitation_status === 'pending').map((invitation) => {
                  return (
                    <HeirInvitationCard
                      key={invitation.id}
                      successor={{
                        id: invitation.id,
                        full_name: invitation.users?.full_name || invitation.users?.email || 'Unknown',
                        email: invitation.users?.email || undefined,
                        phone: undefined,
                        relationship: invitation.relationship || undefined,
                        heir_type: invitation.heir_type || 'family',
                        invitation_status: invitation.invitation_status || 'pending',
                        invited_at: invitation.invited_at || ''
                      }}
                      ownerName={invitation.users?.full_name || invitation.users?.email || 'Owner'}
                      isAccepted={invitation.has_accepted || false}
                      onAccept={() => handleAcceptInvitation(invitation.invitation_code || '')}
                      onDecline={() => handleDeclineInvitation(invitation.invitation_code || '')}
                    />
                  )
                })
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
              receivedInvitations.filter(h => h.has_accepted).map((successor) => {
                return (
                  <SuccessorCard
                    key={successor.id}
                    successor={{
                      id: successor.id,
                      full_name: successor.users?.full_name || successor.users?.email || 'Unknown',
                      email: successor.users?.email || undefined,
                      phone: undefined,
                      relationship: successor.relationship || undefined,
                      heir_type: successor.heir_type || 'family',
                      invitation_status: successor.invitation_status || 'accepted',
                      invited_at: successor.invited_at || ''
                    }}
                    ownerName={successor.users?.full_name || successor.users?.email || 'Owner'}
                    ownerUserId={successor.user_id || ''}
                    isTrustedContact={trustedContactMap[successor.id] || false}
                    onRemove={async () => {
                      await loadReceivedInvitations(user?.id || '', user?.email ?? undefined)
                    }}
                  />
                )
              })
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
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">Heir Invitation Created</DialogTitle>
            {newlyCreatedHeir && (
              <HeirInvitation
                heirName={newlyCreatedHeir.full_name_encrypted || ''}
                heirEmail={newlyCreatedHeir.email_encrypted || ''}
                invitationCode={newlyCreatedHeir.invitation_code || ''}
                invitationLink={`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.heriwill.com'}/invite?code=${newlyCreatedHeir.invitation_code}&type=heir`}
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
