"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardOverview } from "@/components/module/dashboard/dashboard-overview"
import { getDashboardStats, getDashboardProfile } from "@/app/actions/users"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  avatar_url?: string
  subscription_tier?: string
  subscription_status?: string
  is_active?: boolean
}

interface DashboardStatsState {
  totalAssets: number
  totalBeneficiaries: number
  completedSections: number
  totalSections: number
  securityScore: number
  pendingTasks: number
}

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStatsState>({
    totalAssets: 0,
    totalBeneficiaries: 0,
    completedSections: 0,
    totalSections: 6,
    securityScore: 75,
    pendingTasks: 2
  })
  const router = useRouter()

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

  const loadData = useCallback(async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        getDashboardProfile(),
        getDashboardStats()
      ])

      setProfile(profileData as UserProfile)

      const { vaultsCount, heirsCount, assetsCount } = statsData
      const completedSections = [
        vaultsCount > 0,
        heirsCount > 0,
        assetsCount > 0
      ].filter(Boolean).length

      const securityScore = calculateSecurityScore(vaultsCount, heirsCount, assetsCount)

      setStats({
        totalAssets: assetsCount,
        totalBeneficiaries: heirsCount,
        completedSections,
        totalSections: 6,
        securityScore,
        pendingTasks: 6 - completedSections
      })
    } catch {
      setProfile(null)
      setStats({
        totalAssets: 0,
        totalBeneficiaries: 0,
        completedSections: 0,
        totalSections: 6,
        securityScore: 0,
        pendingTasks: 6
      })
    }
  }, [calculateSecurityScore])

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login")
      } else if (mounted) {
        loadData()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        loadData()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, loadData])

  return (
    <DashboardOverview 
      userName={profile?.full_name || 'User'}
      stats={stats}
    />
  )
}
