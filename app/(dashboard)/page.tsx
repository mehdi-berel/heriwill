"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { DashboardOverview } from "@/components/module/dashboard/dashboard-overview"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database"

interface DashboardStats {
  totalAssets: number
  totalBeneficiaries: number
  completedSections: number
  totalSections: number
  securityScore: number
  pendingTasks: number
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Database['public']['Tables']['user_profiles']['Row'] | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalBeneficiaries: 0,
    completedSections: 0,
    totalSections: 6,
    securityScore: 75,
    pendingTasks: 2
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      
      // Load user data
      await Promise.all([
        loadProfile(user.id),
        loadStats(user.id)
      ])
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
        loadProfile(session.user.id)
        loadStats(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    setProfile(data)
  }

  const loadStats = async (userId: string) => {
    try {
      // Load assets count
      const { data: assets } = await supabase
        .from('digital_assets')
        .select('id')
        .eq('user_id', userId)

      // Load beneficiaries count
      const { data: beneficiaries } = await supabase
        .from('beneficiaries')
        .select('id')
        .eq('user_id', userId)

      // Load inheritance plan progress
      const { data: plans } = await supabase
        .from('inheritance_plans')
        .select('id, progress')
        .eq('user_id', userId)
        .single()

      const { data: sections } = await supabase
        .from('inheritance_sections')
        .select('is_completed')
        .eq('plan_id', plans?.id || '')

      const completedSections = sections?.filter(s => s.is_completed).length || 0

      setStats(prev => ({
        ...prev,
        totalAssets: assets?.length || 0,
        totalBeneficiaries: beneficiaries?.length || 0,
        completedSections,
        totalSections: sections?.length || 6,
        securityScore: calculateSecurityScore(userId)
      }))
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const calculateSecurityScore = (userId: string): number => {
    // Basic security score calculation
    // In a real app, this would check 2FA, password strength, etc.
    let score = 60 // Base score
    
    // Add points for having beneficiaries
    if (stats.totalBeneficiaries > 0) score += 10
    
    // Add points for having assets
    if (stats.totalAssets > 0) score += 10
    
    // Add points for plan progress
    if (stats.completedSections > 0) score += Math.min(20, stats.completedSections * 4)
    
    return Math.min(100, score)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
      <DashboardOverview 
        stats={stats} 
        userName={profile?.full_name || user?.email}
      />
    </DashboardLayout>
  )
}
