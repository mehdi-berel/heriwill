"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { HeirForm } from "@/components/module/heirs/heir-form"
import { HeirList } from "@/components/module/heirs/heir-list"
import { HeirStats } from "@/components/module/heirs/heir-stats"
import { HeirDetail } from "@/components/module/heirs/heir-detail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { supabase } from "@/lib/supabase"

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

interface HeirActivity {
  id: string
  type: 'login' | 'vault_access' | 'settings_change' | 'verification_completed'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}


export default function HeirsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'accepted' | 'active' | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingHeir, setEditingHeir] = useState<Heir | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [heirToDelete, setHeirToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.error('Error loading profile:', profileError)
      }
      
      setProfile(profileData)
      
      // Load heirs data
      await loadHeirs(user.id)
      
      setLoading(false)
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
  }, [router])

  const loadHeirs = async (userId: string) => {
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
  }

  const loadHeirActivities = async (heirId: string) => {
    try {
      // In a real app, this would fetch from an activities table
      // Mock activities removed since we're not using detail view in this page
    } catch (error) {
      console.error('Error loading heir activities:', error)
    }
  }

  const handleAddHeir = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('heirs')
        .insert({
          user_id: user.id,
          full_name_encrypted: formData.full_name,
          email_encrypted: formData.email,
          phone_encrypted: formData.phone || null,
          relationship: formData.relationship || null,
          heir_type: formData.heir_type || 'family',
          access_level: formData.access_level,
          invitation_status: 'pending',
          invitation_code: generateInvitationCode(),
          invited_at: new Date().toISOString(),
          invitation_expires_at: formData.invitation_expires_at || null,
          notify_on_activation: true,
          notification_delay_days: 0,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding heir:', error)
        return
      }

      if (data) {
        setHeirs([data, ...heirs])
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error adding heir:', error)
    }
  }

  const handleUpdateHeir = async (formData: any) => {
    if (!editingHeir) return

    try {
      const { data, error } = await supabase
        .from('heirs')
        .update({
          full_name_encrypted: formData.full_name,
          email_encrypted: formData.email,
          phone_encrypted: formData.phone || null,
          relationship: formData.relationship || null,
          heir_type: formData.heir_type || 'family',
          access_level: formData.access_level,
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

  const handleResendInvitation = async (heirId: string) => {
    // In a real app, this would send an email
    console.log('Resending invitation to heir:', heirId)
  }

  const handleRevokeAccess = async (heirId: string) => {
    try {
      const { error } = await supabase
        .from('heirs')
        .update({ 
          invitation_status: 'rejected',
          is_active: false,
          rejected_at: new Date().toISOString()
        })
        .eq('id', heirId)
      
      if (error) {
        console.error('Error revoking access:', error)
        return
      }
      
      setHeirs(heirs.map(h => 
        h.id === heirId ? { ...h, invitation_status: 'rejected' as const, is_active: false } : h
      ))
    } catch (error) {
      console.error('Error revoking access:', error)
    }
  }

  const handleHeirSelect = (heir: Heir) => {
    router.push(`/heirs/${heir.id}`)
  }

  const handleHeirEdit = (heir: Heir) => {
    setEditingHeir(heir)
    setShowForm(true)
  }

  const generateInvitationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getHeirStats = () => {
    const totalHeirs = heirs.length
    const activeHeirs = heirs.filter(h => h.is_active === true).length
    const pendingHeirs = heirs.filter(h => h.invitation_status === 'pending').length
    const acceptedHeirs = heirs.filter(h => h.has_accepted === true).length

    return {
      totalHeirs,
      activeHeirs,
      pendingHeirs,
      acceptedHeirs
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
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
          
          {/* Category Tabs - Centered */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={selectedStatus === 'accepted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(selectedStatus === 'accepted' ? null : 'accepted')}
              className="rounded-lg"
            >
              Accepted ({heirs.filter(h => h.has_accepted === true).length})
            </Button>
            <Button
              variant={selectedStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(selectedStatus === 'pending' ? null : 'pending')}
              className="rounded-lg"
            >
              Pending ({heirs.filter(h => h.invitation_status === 'pending').length})
            </Button>
            <Button
              variant={selectedStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(selectedStatus === 'active' ? null : 'active')}
              className="rounded-lg"
            >
              Successors ({heirs.filter(h => h.is_active === true).length})
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search heirs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background-secondary border-border rounded-xl"
            />
          </div>
        </div>

        {/* Heirs List */}
        <HeirList
          heirs={heirs}
          onHeirSelect={handleHeirSelect}
          onHeirEdit={handleHeirEdit}
          onHeirDelete={handleDeleteHeir}
          onResendInvitation={handleResendInvitation}
          onRevokeAccess={handleRevokeAccess}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
        />

        {/* Heir Form Modal */}
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open)
          if (!open) setEditingHeir(null)
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">
              {editingHeir ? 'Edit Heir' : 'Add New Heir'}
            </DialogTitle>
            <HeirForm
              initialData={editingHeir ? {
                full_name: editingHeir.full_name_encrypted || '',
                email: editingHeir.email_encrypted || '',
                phone: editingHeir.phone_encrypted || '',
                relationship: editingHeir.relationship || '',
                heir_type: editingHeir.heir_type || 'family',
                access_level: editingHeir.access_level,
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
    </DashboardLayout>
  )
}
