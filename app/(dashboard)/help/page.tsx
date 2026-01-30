"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { HelpCenter } from "@/components/module/help/help-center"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface UserProfile {
  user_id: string
  full_name?: string
  email?: string
  avatar_url?: string
  subscription_tier?: string
}

export default function HelpPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
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
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setProfile(profileData)
      setLoading(false)
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
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading help center...</div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
      <HelpCenter />
    </DashboardLayout>
  )
}
