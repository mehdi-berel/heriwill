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
  const [profile, setProfile] = useState<any>(null)
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
      // Load vaults count
      const { data: vaults } = await supabase
        .from('vaults')
        .select('id')
        .eq('user_id', userId)

      // Load heirs count
      const { data: heirs } = await supabase
        .from('heirs')
        .select('id')
        .eq('user_id', userId)

      // Load assets count
      const { data: assets } = await supabase
        .from('assets')
        .select('id')
        .eq('user_id', userId)

      // Load vault items count
      const { data: vaultItems } = await supabase
        .from('vault_items')
        .select('id')
        .eq('user_id', userId)

      // Load inheritance plans
      const { data: plans } = await supabase
        .from('inheritance_plans')
        .select('id, is_triggered, is_active')
        .eq('user_id', userId)

      const activePlans = plans?.filter((p: any) => p.is_active && !p.is_triggered).length || 0
      const completedSections = plans?.filter((p: any) => p.is_triggered).length || 0

      // Calculate security score
      const securityScore = calculateSecurityScore(
        vaults?.length || 0,
        heirs?.length || 0,
        assets?.length || 0,
        vaultItems?.length || 0
      )

      setStats({
        totalAssets: assets?.length || 0,
        totalBeneficiaries: heirs?.length || 0,
        completedSections,
        totalSections: (vaults?.length || 0) + (heirs?.length || 0) + (assets?.length || 0),
        securityScore,
        pendingTasks: activePlans
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const calculateSecurityScore = (
    vaultsCount: number,
    heirsCount: number,
    assetsCount: number,
    vaultItemsCount: number
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
    
    // Points for having assets (max 20 points)
    if (assetsCount > 0) {
      score += Math.min(20, assetsCount * 10)
    }
    
    // Points for vault items (max 25 points)
    if (vaultItemsCount > 0) {
      score += Math.min(25, vaultItemsCount * 2)
    }
    
    return Math.min(100, score)
  }

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
