"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, FileText, Heart, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/lib/utils/toast"
import { logger } from "@/lib/utils/logger"

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

interface WillCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  completed: boolean
}

export default function WillPage() {
  const [willData] = useState<WillData | null>(null)
  const [wishData] = useState<WishData | null>(null)
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

  const loadWillData = useCallback(async (userId: string) => {
    try {
      // TODO: user_wills table doesn't exist in database schema
      // Need to create migration or use alternative storage (users table metadata, legal table, etc.)
      toast.warning('Feature not available', 'Will management is being implemented')
      // const { data } = await supabase
      //   .from('user_wills')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single()
      // if (data) {
      //   setWillData(data as unknown as WillData)
      // }
    } catch (error) {
      logger.error('Error loading will data', error, { userId })
    }
  }, [])

  const loadWishData = useCallback(async (userId: string) => {
    try {
      // TODO: user_wishes table doesn't exist in database schema
      // Need to create migration or use alternative storage (users table metadata, legal table, etc.)
      toast.warning('Feature not available', 'Wishes management is being implemented')
      // const { data } = await supabase
      //   .from('user_wishes')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single()
      // if (data) {
      //   setWishData(data as unknown as WishData)
      // }
    } catch (error) {
      logger.error('Error loading wish data', error, { userId })
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      
      // Load will data and wish data
      await Promise.all([
        loadWillData(user.id),
        loadWishData(user.id)
      ])
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router, loadWillData, loadWishData])

  // handleSave function removed - not used until will management is fully implemented
  // TODO: Implement when user_wills and user_wishes tables are created

  const completedCount = categories.filter(c => c.completed).length

  return (
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
        {/* TODO: Implement will form components when user_wills table is created */}
        <div className="bg-background-secondary p-6 rounded-lg border border-border">
          <p className="text-text-secondary">
            Will management features are being implemented. The following components need to be created:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-text-secondary">
            <li>WillCategories - Category selection component</li>
            <li>TestamentDetails - Testament content form</li>
            <li>BeneficiariesSection - Beneficiary management</li>
            <li>ExecutorDetails - Executor information form</li>
            <li>BurialPreferences - Burial preference form</li>
            <li>FuneralDetails - Funeral details form</li>
            <li>ServiceProviders - Service provider management</li>
          </ul>
        </div>
        {/* Commented out until components are implemented
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
                onSave={(data: any) => handleSave('testament', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'beneficiaries' && (
              <BeneficiariesSection
                initialData={willData as unknown as Record<string, unknown>}
                onSave={(data: any) => handleSave('beneficiaries', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'executor' && (
              <ExecutorDetails
                initialData={willData as unknown as Record<string, unknown>}
                onSave={(data: any) => handleSave('executor', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'burial' && (
              <BurialPreferences
                initialData={wishData as unknown as Record<string, unknown>}
                onSave={(data: any) => handleSave('burial', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'funeral' && (
              <FuneralDetails
                initialData={wishData as unknown as Record<string, unknown>}
                onSave={(data: any) => handleSave('funeral', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
            {selectedCategory === 'providers' && (
              <ServiceProviders
                initialData={wishData as unknown as Record<string, unknown>}
                onSave={(data: any) => handleSave('providers', data as unknown as Record<string, unknown>)}
                onCancel={() => setSelectedCategory(null)}
              />
            )}
          </div>
        )}
        */}
    </div>
  )
}
