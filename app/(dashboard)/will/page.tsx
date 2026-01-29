"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { WillCategories } from "@/components/module/will/will-categories"
import { TestamentDetails } from "@/components/module/will/testament-details"
import { BeneficiariesSection } from "@/components/module/will/beneficiaries-section"
import { ExecutorDetails } from "@/components/module/will/executor-details"
import { BurialPreferences } from "@/components/module/will/burial-preferences"
import { FuneralDetails } from "@/components/module/will/funeral-details"
import { ServiceProviders } from "@/components/module/will/service-providers"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, AlertCircle, CheckCircle, Heart } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { User } from "@supabase/supabase-js"

interface UserProfile {
  user_id: string
  full_name?: string
  email?: string
  avatar_url?: string
  subscription_tier?: string
}

interface WillData {
  user_id: string
  testament_content?: string
  primary_beneficiaries?: unknown
  executor_details?: unknown
  updated_at?: string
  executor_name?: string // Added missing property
}

interface WishData {
  user_id: string
  burial_preferences?: unknown
  funeral_details?: unknown
  service_providers?: unknown
  updated_at?: string
  burial_type?: string // Added missing property
  funeral_type?: string // Added missing property
  funeral_home?: string // Added missing property
}

interface SaveData {
  [key: string]: unknown
}

interface WillCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  completed: boolean
}

export default function WillPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [willData, setWillData] = useState<WillData | null>(null)
  const [wishData, setWishData] = useState<WishData | null>(null)
  const router = useRouter()

  const categories: WillCategory[] = [
    {
      id: 'testament',
      title: 'Testament & Last Will',
      description: 'Your main will document and final wishes',
      icon: FileText,
      color: '#8B5CF6',
      completed: !!willData?.testament_content
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiaries & Distribution',
      description: 'Who inherits your assets and how they are distributed',
      icon: FileText,
      color: '#3B82F6',
      completed: !!willData?.primary_beneficiaries
    },
    {
      id: 'executor',
      title: 'Executor Information',
      description: 'Who will manage and execute your estate',
      icon: FileText,
      color: '#10B981',
      completed: !!willData?.executor_name
    },
    {
      id: 'burial',
      title: 'Burial Preferences',
      description: 'Where and how you want to be laid to rest',
      icon: Heart,
      color: '#EC4899',
      completed: !!wishData?.burial_type
    },
    {
      id: 'funeral',
      title: 'Funeral Details',
      description: 'Guest list, ceremony preferences, and special requests',
      icon: Heart,
      color: '#F59E0B',
      completed: !!wishData?.funeral_type
    },
    {
      id: 'providers',
      title: 'Service Providers',
      description: 'Companies and contacts to handle arrangements',
      icon: Heart,
      color: '#06B6D4',
      completed: !!wishData?.funeral_home
    },
  ]

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
      
      // Load will data and wish data
      await Promise.all([
        loadWillData(user.id),
        loadWishData(user.id)
      ])
      
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

  const loadWillData = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_wills')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        setWillData(data as unknown as WillData)
      }
    } catch (error) {
      console.error('Error loading will data:', error)
    }
  }

  const loadWishData = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_wishes')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        setWishData(data as unknown as WishData)
      }
    } catch (error) {
      console.error('Error loading wish data:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleSave = async (category: string, data: SaveData) => {
    try {
      if (!user) return

      const updateData = {
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString()
      }

      // Determine which table to update based on category
      const isWishCategory = ['burial', 'funeral', 'providers'].includes(category)
      const tableName = isWishCategory ? 'user_wishes' : 'user_wills'

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(tableName as any) as any)
        .upsert(updateData, { onConflict: 'user_id' })

      if (error) throw error

      // Reload appropriate data
      if (isWishCategory) {
        await loadWishData(user.id)
      } else {
        await loadWillData(user.id)
      }
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const completedCount = categories.filter(c => c.completed).length

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Last Will & Testament</h1>
            <p className="text-text-secondary mt-1">
              Create and manage your legal will and estate distribution
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        {/* Progress Banner */}
        <Card className={completedCount === categories.length ? "bg-green-600/5 border-green-600/20" : "bg-blue-600/5 border-blue-600/20"}>
          <CardContent className="flex items-center gap-3 p-4">
            {completedCount === categories.length ? (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                {completedCount === categories.length 
                  ? "Will completed" 
                  : `${completedCount} of ${categories.length} sections completed`}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {completedCount === categories.length
                  ? "Your will has been documented and is ready for legal review"
                  : "Complete all sections to finalize your will"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="bg-purple-600/5 border-purple-600/20">
          <CardContent className="flex items-start gap-3 p-4">
            <FileText className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-text-secondary">
                This will document your final wishes and ensure your assets are distributed according to your preferences. 
                We recommend consulting with a legal professional to ensure your will is legally valid in your jurisdiction.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Categories or Form */}
        {!selectedCategory ? (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Will Sections</h2>
            <WillCategories
              categories={categories}
              onCategorySelect={setSelectedCategory}
            />
          </div>
        ) : (
          <div>
            {selectedCategory === 'testament' && (
              <TestamentDetails
                initialData={willData as unknown as Record<string, unknown>}
                onSave={(data) => handleSave('testament', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'beneficiaries' && (
              <BeneficiariesSection
                initialData={willData as unknown as Record<string, unknown>}
                onSave={(data) => handleSave('beneficiaries', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'executor' && (
              <ExecutorDetails
                initialData={willData as unknown as Record<string, unknown>}
                onSave={(data) => handleSave('executor', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'burial' && (
              <BurialPreferences
                initialData={wishData as unknown as Record<string, unknown>}
                onSave={(data) => handleSave('burial', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'funeral' && (
              <FuneralDetails
                initialData={wishData as unknown as Record<string, unknown>}
                onSave={(data) => handleSave('funeral', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'providers' && (
              <ServiceProviders
                initialData={wishData as unknown as Record<string, unknown>}
                onSave={(data) => handleSave('providers', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
