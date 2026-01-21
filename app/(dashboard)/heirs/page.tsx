"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { HeirForm } from "@/components/module/heirs/heir-form"
import { HeirList } from "@/components/module/heirs/heir-list"
import { HeirStats } from "@/components/module/heirs/heir-stats"
import { HeirDetail } from "@/components/module/heirs/heir-detail"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface Heir {
  id: string
  user_id: string
  full_name_encrypted: string | null
  email_encrypted: string | null
  phone_encrypted: string | null
  relationship: string | null
  access_level: 'full' | 'partial' | 'view'
  invitation_status: string | null
  invitation_code: string | null
  invited_at: string | null
  invitation_expires_at: string | null
  verification_method: string | null
  has_accepted: boolean | null
  accepted_at: string | null
  is_active: boolean | null
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

type ViewMode = 'stats' | 'list' | 'add' | 'detail'

export default function HeirsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('stats')
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [selectedHeir, setSelectedHeir] = useState<Heir | null>(null)
  const [heirActivities, setHeirActivities] = useState<HeirActivity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      
      // Load user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setProfile(profileData)
      
      // Load heirs data
      await loadHeirs(user.id)
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
        loadHeirs(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadHeirs = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('heirs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setHeirs(data || [])
    } catch (error) {
      console.error('Error loading heirs:', error)
    }
  }

  const loadHeirActivities = async (heirId: string) => {
    try {
      // In a real app, this would fetch from an activities table
      const mockActivities: HeirActivity[] = [
        {
          id: '1',
          type: 'login',
          description: 'Logged into account',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'vault_access',
          description: 'Accessed "Family Photos" vault',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setHeirActivities(mockActivities)
    } catch (error) {
      console.error('Error loading heir activities:', error)
    }
  }

  const handleAddHeir = async (formData: any) => {
    try {
      const { data } = await supabase
        .from('heirs')
        .insert({
          user_id: user.id,
          full_name_encrypted: formData.full_name, // In production, this should be encrypted
          email_encrypted: formData.email, // In production, this should be encrypted
          phone_encrypted: formData.phone || null, // In production, this should be encrypted
          relationship: formData.relationship,
          access_level: formData.access_level,
          verification_method: formData.verification_method,
          invitation_status: 'pending',
          invitation_code: generateInvitationCode(),
          invited_at: new Date().toISOString(),
          invitation_expires_at: formData.invitation_expires_at || null
        })
        .select()
        .single()

      if (data) {
        setHeirs([data, ...heirs])
        setViewMode('list')
      }
    } catch (error) {
      console.error('Error adding heir:', error)
    }
  }

  const handleUpdateHeir = async (formData: any) => {
    if (!selectedHeir) return

    try {
      const { data } = await supabase
        .from('heirs')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          relationship: formData.relationship,
          access_level: formData.access_level,
          verification_method: formData.verification_method,
          notification_preferences: formData.notification_preferences,
          backup_contact: formData.backup_contact,
          special_instructions: formData.special_instructions
        })
        .eq('id', selectedHeir.id)
        .select()
        .single()

      if (data) {
        setHeirs(heirs.map(h => h.id === selectedHeir.id ? data : h))
        setSelectedHeir(data)
        setViewMode('detail')
      }
    } catch (error) {
      console.error('Error updating heir:', error)
    }
  }

  const handleDeleteHeir = async (heirId: string) => {
    try {
      await supabase
        .from('heirs')
        .delete()
        .eq('id', heirId)
      
      setHeirs(heirs.filter(h => h.id !== heirId))
      if (selectedHeir?.id === heirId) {
        setSelectedHeir(null)
        setViewMode('list')
      }
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
      await supabase
        .from('heirs')
        .update({ invitation_status: 'rejected' })
        .eq('id', heirId)
      
      setHeirs(heirs.map(h => 
        h.id === heirId ? { ...h, invitation_status: 'rejected' as const } : h
      ))
    } catch (error) {
      console.error('Error revoking access:', error)
    }
  }

  const handleHeirSelect = (heir: Heir) => {
    setSelectedHeir(heir)
    loadHeirActivities(heir.id)
    setViewMode('detail')
  }

  const handleHeirEdit = (heir: Heir) => {
    setSelectedHeir(heir)
    setViewMode('add')
  }

  const generateInvitationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getHeirStats = () => {
  const totalHeirs = heirs.length
  const acceptedHeirs = heirs.filter(h => h.invitation_status === 'accepted').length
  const pendingHeirs = heirs.filter(h => h.invitation_status === 'pending').length
  const rejectedHeirs = heirs.filter(h => h.invitation_status === 'rejected').length
  const expiredHeirs = heirs.filter(h => h.invitation_status === 'expired').length
  const verifiedHeirs = heirs.filter(h => h.has_accepted === true).length
  const fullAccessHeirs = heirs.filter(h => h.access_level === 'full').length
  const partialAccessHeirs = heirs.filter(h => h.access_level === 'partial').length
  const viewAccessHeirs = heirs.filter(h => h.access_level === 'view').length
  const recentlyActive = heirs.filter(h => {
    if (!h.updated_at) return false
    return new Date(h.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }).length

  return {
    totalHeirs,
    acceptedHeirs,
    pendingHeirs,
    rejectedHeirs,
    expiredHeirs,
    verifiedHeirs,
    fullAccessHeirs,
    partialAccessHeirs,
    viewAccessHeirs,
    recentlyActive,
    averageResponseTime: 48, // Mock data
    invitationsSentThisMonth: 3, // Mock data
    verificationBreakdown: {
      email: heirs.filter(h => h.verification_method === 'email').length,
      phone: heirs.filter(h => h.verification_method === 'phone').length,
      id_document: heirs.filter(h => h.verification_method === 'id_document').length,
      other: heirs.filter(h => h.verification_method === 'other').length
    }
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Heirs Management</h1>
            <p className="text-muted-foreground">
              Manage who will inherit your digital assets and information.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'stats' ? 'default' : 'outline'}
              onClick={() => setViewMode('stats')}
            >
              Stats
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button onClick={() => setViewMode('add')}>
              Add Heir
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'stats' && (
          <HeirStats stats={getHeirStats()} />
        )}

        {viewMode === 'list' && (
          <HeirList
            heirs={heirs}
            onHeirSelect={handleHeirSelect}
            onHeirEdit={handleHeirEdit}
            onHeirDelete={handleDeleteHeir}
            onResendInvitation={handleResendInvitation}
            onRevokeAccess={handleRevokeAccess}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}

        {viewMode === 'add' && (
          <HeirForm
            onSubmit={selectedHeir ? handleUpdateHeir : handleAddHeir}
            onCancel={() => {
              setViewMode('list')
              setSelectedHeir(null)
            }}
            initialData={selectedHeir ? {
              full_name: selectedHeir.full_name,
              email: selectedHeir.email,
              phone: selectedHeir.phone || '',
              relationship: selectedHeir.relationship,
              access_level: selectedHeir.access_level,
              notification_preferences: selectedHeir.notification_preferences,
              backup_contact: selectedHeir.backup_contact || {
                name: '',
                phone: '',
                relationship: ''
              },
              special_instructions: selectedHeir.special_instructions || '',
              verification_method: selectedHeir.verification_method,
              invitation_expires_at: selectedHeir.invitation_expires_at
            } : undefined}
            isEditing={!!selectedHeir}
          />
        )}

        {viewMode === 'detail' && selectedHeir && (
          <HeirDetail
            heir={selectedHeir}
            activities={heirActivities}
            onBack={() => setViewMode('list')}
            onEdit={() => setViewMode('add')}
            onDelete={() => handleDeleteHeir(selectedHeir.id)}
            onResendInvitation={() => handleResendInvitation(selectedHeir.id)}
            onRevokeAccess={() => handleRevokeAccess(selectedHeir.id)}
            onRefreshActivity={() => loadHeirActivities(selectedHeir.id)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
