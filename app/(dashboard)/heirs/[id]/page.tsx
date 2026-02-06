"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { HeirDetail } from "@/components/module/heirs/heir-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getHeirById, deleteHeir, revokeAccess, getHeirActivities } from "@/app/actions/heirs"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

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
  const [heir, setHeir] = useState<Heir | null>(null)
  const [activities, setActivities] = useState<HeirActivity[]>([])
  const router = useRouter()
  const params = useParams()
  const heirId = params.id as string

  const loadHeir = useCallback(async (id: string) => {
    try {
      const data = await getHeirById(id)
      if (!data) throw new Error('Heir not found')

      const heirData = data as Record<string, unknown>
      const mappedHeir: Heir = {
        id: heirData.id as string,
        full_name: (heirData.full_name_encrypted as string) || 'Unknown',
        email: (heirData.email_encrypted as string) || '',
        phone: (heirData.phone_encrypted as string) || undefined,
        relationship: (heirData.relationship as string) || 'Unknown',
        invitation_status: (heirData.invitation_status as 'pending' | 'accepted' | 'rejected' | 'expired') || 'pending',
        invitation_code: (heirData.invitation_code as string) || undefined,
        access_level: (heirData.access_level as 'full' | 'partial' | 'view') || 'view',
        verification_method: 'email',
        verification_status: heirData.invitation_status === 'accepted' ? 'verified' : 'pending',
        created_at: heirData.created_at as string,
        accepted_at: (heirData.accepted_at as string) || undefined,
        last_activity: (heirData.updated_at as string) || undefined,
        invitation_expires_at: (heirData.invitation_expires_at as string) || undefined,
        notification_preferences: {
          email: (heirData.notify_on_activation as boolean) ?? true,
          sms: false,
          in_app: true
        }
      }

      setHeir(mappedHeir)
    } catch (error) {
      logger.error('Error loading heir', error, { heirId: id })
      toast.error('Failed to load heir', 'Please try again')
      router.push("/heirs")
    }
  }, [router])

  const loadHeirActivities = useCallback(async (id: string) => {
    try {
      const activities = await getHeirActivities(id)
      setActivities(activities as HeirActivity[])
    } catch (error) {
      logger.error('Error loading heir activities', error, { heirId: id })
      setActivities([])
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
      
      // Load heir data
      await Promise.all([
        loadHeir(heirId),
        loadHeirActivities(heirId)
      ])
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        if (heirId) {
          loadHeir(heirId)
          loadHeirActivities(heirId)
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
      await deleteHeir(heirId)
      router.push("/heirs")
    } catch (error) {
      logger.error('Error deleting heir', error, { heirId })
      toast.error('Failed to delete heir', 'Please try again')
    }
  }

  const handleResendInvitation = async () => {
    try {
      // In a real app, this would send an email
      logger.info('Resending invitation to heir', { heirId })
      toast.success('Invitation sent')
    } catch (error) {
      logger.error('Error resending invitation', error, { heirId })
      toast.error('Failed to send invitation', 'Please try again')
    }
  }

  const handleRevokeAccess = async () => {
    try {
      await revokeAccess(heirId)
      if (heir) {
        setHeir({ ...heir, invitation_status: 'rejected' })
      }
    } catch (error) {
      logger.error('Error revoking access', error, { heirId })
      toast.error('Failed to revoke access', 'Please try again')
    }
  }

  const handleRefreshActivity = () => {
    if (heirId) {
      loadHeirActivities(heirId)
    }
  }

  if (!heir) return null

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-6">
          {/* Back button and title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/heirs")}
              className="h-10 sm:h-9 -ml-2 sm:ml-0 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold leading-tight truncate">{heir.full_name}</h1>
              <p className="text-xs sm:text-base text-muted-foreground truncate">{heir.email}</p>
            </div>
            {/* Desktop: Action buttons */}
            <div className="hidden sm:flex sm:items-center sm:gap-2 flex-shrink-0">
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
          
          {/* Mobile: Action buttons */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <Button variant="outline" onClick={handleEdit} className="h-11">
              <Edit className="h-4 w-4 mr-2" />
              <span className="text-sm">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white h-11"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="text-sm">Delete</span>
            </Button>
          </div>
        </div>

        <HeirDetail
          heir={heir as unknown as Heir}
          activities={activities}
          onBack={() => router.push("/heirs")}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResendInvitation={handleResendInvitation}
          onRevokeAccess={handleRevokeAccess}
          onRefreshActivity={handleRefreshActivity}
        />
    </div>
  )
}
