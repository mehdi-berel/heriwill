"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardOverview } from "@/components/module/dashboard/dashboard-overview"
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

interface DashboardStats {
  totalAssets: number
  totalBeneficiaries: number
  completedSections: number
  totalSections: number
  securityScore: number
  pendingTasks: number
}

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalBeneficiaries: 0,
    completedSections: 0,
    totalSections: 6,
    securityScore: 75,
    pendingTasks: 2
  })
  const router = useRouter()

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url, subscription_tier, subscription_status, is_active')
        .eq('id', userId)
        .single()
      
      if (error) {
        throw error
      }
      
      if (data) {
        setProfile(data as UserProfile)
      }
    } catch {
      // Silent error - user can still use dashboard with limited profile data
      setProfile(null)
    }
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
      const [vaultsResult, heirsResult, assetsResult] = await Promise.all([
        supabase.from('vaults').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('heirs').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('assets').select('id', { count: 'exact' }).eq('user_id', userId)
      ])

      const vaultsCount = vaultsResult.count || 0
      const heirsCount = heirsResult.count || 0
      const assetsCount = assetsResult.count || 0

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
    } catch {
      // Set default stats on error
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
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      
      // Load user data
      await Promise.all([
        loadProfile(user.id),
        loadStats(user.id)
      ])
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        loadProfile(session.user.id)
        loadStats(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, loadProfile, loadStats, calculateSecurityScore])

  return (
    <DashboardOverview 
      userName={profile?.full_name || 'User'}
      stats={stats}
    />
  )
}
