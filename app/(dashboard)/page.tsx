"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { DashboardOverview } from "@/components/module/dashboard/dashboard-overview"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface UserProfile {
  user_id: string
  full_name?: string
  email?: string
  avatar_url?: string
  subscription_tier?: string
}

interface DashboardStats {
  totalAssets: number
  totalBeneficiaries: number
  completedSections: number
  totalSections: number
  securityScore: number
  pendingTasks: number
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
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

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    setProfile(data)
  }, [])

  const calculateSecurityScore = useCallback((
    vaultsCount: number,
    heirsCount: number,
    assetsCount: number
  ): number => {
    let score = 0
    
    // Base score for having vaults (max 30 points)
    if (vaultsCount > 0) {
      score += Math.min(30, vaultsCount * 10)
    }
    
    // Points for having heirs (max 25 points)
    if (heirsCount > 0) {
      score += Math.min(25, heirsCount * 12)
    }
    
    // Points for having assets (max 45 points)
    if (assetsCount > 0) {
      score += Math.min(45, assetsCount * 15)
    }
    
    return Math.min(100, score)
  }, [])

  const loadStats = useCallback(async (userId: string) => {
    try {
      const { data: vaults } = await supabase
        .from('vaults')
        .select('*')
        .eq('user_id', userId)

      const { data: heirs } = await supabase
        .from('heirs')
        .select('*')
        .eq('user_id', userId)

      const { data: assets } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)

      const vaultsCount = vaults?.length || 0
      const heirsCount = heirs?.length || 0
      const assetsCount = assets?.length || 0

      const completedSections = [
        vaultsCount > 0,
        heirsCount > 0,
        assetsCount > 0
      ].filter(Boolean).length

      const securityScore = calculateSecurityScore(
        vaultsCount,
        heirsCount,
        assetsCount
      )

      setStats({
        totalAssets: assetsCount,
        totalBeneficiaries: heirsCount,
        completedSections,
        totalSections: 6,
        securityScore,
        pendingTasks: 6 - completedSections
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [calculateSecurityScore])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
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
        router.push("/login")
      } else {
        setUser(session.user)
        loadProfile(session.user.id)
        loadStats(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, loadProfile, loadStats, calculateSecurityScore])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
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
