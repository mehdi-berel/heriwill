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
