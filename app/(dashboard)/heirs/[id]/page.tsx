"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { HeirDetail } from "@/components/module/heirs/heir-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  subscription_tier?: string
}

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
  metadata?: Record<string, unknown>
}

export default function HeirDetailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [heir, setHeir] = useState<Heir | null>(null)
  const [activities, setActivities] = useState<HeirActivity[]>([])
  const router = useRouter()
  const params = useParams()
  const heirId = params.id as string

  const loadHeir = useCallback(async (id: string) => {
    try {
      const { data } = await supabase
        .from('heirs')
        .select('*')
        .eq('id', id)
        .single()

      setHeir(data)
    } catch (error) {
      console.error('Error loading heir:', error)
      router.push("/heirs")
    }
  }, [router])

  const loadHeirActivities = useCallback(async () => {
    try {
      // Mock data for now - in real app, fetch from activities table
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
      setActivities(mockActivities)
    } catch (error) {
      console.error('Error loading heir activities:', error)
    }
  }, [])

  useEffect(() => {
    if (!heirId) {
      router.push("/heirs")
      return
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
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
      
      // Load heir data
      await Promise.all([
        loadHeir(heirId),
        loadHeirActivities()
      ])
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
        if (heirId) {
          loadHeir(heirId)
          loadHeirActivities()
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, heirId, loadHeir, loadHeirActivities])

  const handleEdit = () => {
    router.push(`/heirs/${heirId}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this heir? This action cannot be undone.')) {
      return
    }

    try {
      await supabase
        .from('heirs')
        .delete()
        .eq('id', heirId)
      
      router.push("/heirs")
    } catch (error) {
      console.error('Error deleting heir:', error)
    }
  }

  const handleResendInvitation = async () => {
    try {
      // In a real app, this would send an email
      console.log('Resending invitation to heir:', heirId)
    } catch (error) {
      console.error('Error resending invitation:', error)
    }
  }

  const handleRevokeAccess = async () => {
    try {
      await supabase
        .from('heirs')
        .update({ invitation_status: 'rejected' })
        .eq('id', heirId)
      
      if (heir) {
        setHeir({ ...heir, invitation_status: 'rejected' })
      }
    } catch (error) {
      console.error('Error revoking access:', error)
    }
  }

  const handleRefreshActivity = () => {
    if (heirId) {
      loadHeirActivities(heirId)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!heir) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Heir not found</h2>
          <p className="text-muted-foreground mb-4">
            The heir you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Button onClick={() => router.push("/heirs")}>
            Back to Heirs
          </Button>
        </div>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/heirs")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{heir.full_name}</h1>
              <p className="text-muted-foreground">{heir.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <HeirDetail
          heir={heir}
          activities={activities}
          onBack={() => router.push("/heirs")}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResendInvitation={handleResendInvitation}
          onRevokeAccess={handleRevokeAccess}
          onRefreshActivity={handleRefreshActivity}
        />
      </div>
    </DashboardLayout>
  )
}
