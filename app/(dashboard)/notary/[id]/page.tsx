"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { NotaryDetail } from "@/components/module/notary/notary-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface UserProfile {
  full_name?: string
  email?: string
  subscription_tier?: string
}

interface Notary {
  id: string
  user_id: string
  name: string
  firm_name?: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  license_number?: string
  specialization?: string
  notes?: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export default function NotaryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const notaryId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notary, setNotary] = useState<Notary | null>(null)
  const [loading, setLoading] = useState(true)

  const loadNotary = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('notaries')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error loading notary:', error)
        router.push("/notary")
        return
      }

      setNotary(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading notary:', error)
      setLoading(false)
      router.push("/notary")
    }
  }, [router])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      
      // Load notary
      await loadNotary(notaryId)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, notaryId, loadNotary])

  const handleDeleteNotary = async () => {
    if (!notary) return

    if (confirm('Are you sure you want to delete this notary?')) {
      try {
        const { error } = await supabase
          .from('notaries')
          .delete()
          .eq('id', notary.id)

        if (error) throw error

        router.push("/notary")
      } catch (error) {
        console.error('Error deleting notary:', error)
        alert('Failed to delete notary')
      }
    }
  }

  const handleSetPrimary = async () => {
    if (!user || !notary) return

    try {
      // First, set all notaries to non-primary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('notaries') as any)
        .update({ is_primary: false })
        .eq('user_id', user.id)

      // Then set the selected notary as primary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('notaries') as any)
        .update({ is_primary: true })
        .eq('id', notary.id)

      if (error) throw error

      await loadNotary(notary.id)
    } catch (error) {
      console.error('Error setting primary notary:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!notary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Notary not found</div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={async () => {
        await supabase.auth.signOut()
        router.push("/login")
      }}
    >
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/notary")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notaries
          </Button>
        </div>

        <NotaryDetail
          notary={notary}
          onDelete={handleDeleteNotary}
          onSetPrimary={handleSetPrimary}
          onEdit={() => {
            // TODO: Implement edit functionality or navigation to edit page
            console.log("Edit clicked")
          }}
        />
      </div>
    </DashboardLayout>
  )
}
