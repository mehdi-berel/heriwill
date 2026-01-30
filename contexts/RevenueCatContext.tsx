"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializeRevenueCat, checkProEntitlement, getActiveEntitlements } from '@/lib/revenuecat'
import { supabase } from '@/lib/supabase'

interface RevenueCatContextType {
  isProUser: boolean
  entitlements: string[]
  loading: boolean
  refreshEntitlements: () => Promise<void>
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined)

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const [isProUser, setIsProUser] = useState(false)
  const [entitlements, setEntitlements] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const refreshEntitlements = async () => {
    try {
      // Skip if RevenueCat API key is not configured
      const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY
      if (!apiKey) return
      
      const isPro = await checkProEntitlement()
      const activeEntitlements = await getActiveEntitlements()
      
      setIsProUser(isPro)
      setEntitlements(activeEntitlements)
    } catch (error) {
      console.error('Error refreshing entitlements:', error)
    }
  }

  useEffect(() => {
    const initializeAndCheckEntitlements = async () => {
      try {
        // Check if RevenueCat API key is configured
        const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY
        if (!apiKey) {
          // Skip RevenueCat initialization if API key not configured
          // App will use Supabase subscription_tier instead
          setLoading(false)
          return
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Initialize RevenueCat with user ID
          await initializeRevenueCat(user.id)
          
          // Check entitlements
          await refreshEntitlements()
        }
      } catch (error) {
        console.error('Error initializing RevenueCat:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAndCheckEntitlements()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY
      if (!apiKey) return // Skip if API key not configured
      
      if (session?.user) {
        await initializeRevenueCat(session.user.id)
        await refreshEntitlements()
      } else {
        setIsProUser(false)
        setEntitlements([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <RevenueCatContext.Provider value={{ isProUser, entitlements, loading, refreshEntitlements }}>
      {children}
    </RevenueCatContext.Provider>
  )
}

export function useRevenueCat() {
  const context = useContext(RevenueCatContext)
  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider')
  }
  return context
}
