"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProTierGuard } from "@/components/module/auth/pro-tier-guard"
import { NotarySelector } from "@/components/module/notary/notary-selector"
import { NotaryDetail } from "@/components/module/notary/notary-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

interface NotaryData {
  name: string
  firm_name?: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  license_number?: string
  specialization?: string
  notes?: string
  is_primary: boolean
}

interface Notary {
  id: string
  user_id: string
  name: string
  firm_name?: string | null
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  license_number?: string | null
  specialization?: string | null
  notes?: string | null
  is_primary: boolean | null
  created_at: string
  updated_at: string
}

export default function NotaryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [selectedFilter] = useState<'all' | 'primary' | 'secondary' | null>(null)
  const [selectedNotary, setSelectedNotary] = useState<Notary | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load notaries
      await loadNotaries(user.id)
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

  const loadNotaries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notaries')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error loading notaries', error, { userId })
        return
      }

      setNotaries((data || []) as Notary[])
    } catch (error) {
      logger.error('Error loading notaries', error, { userId })
      toast.error('Failed to load notaries', 'Please refresh the page')
    }
  }

  const handleAddNotary = async (notaryData: NotaryData) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notaries')
        .insert({
          user_id: user.id,
          ...notaryData
        })
        .select()
        .single()

      if (error) throw error

      await loadNotaries(user.id)
    } catch (error) {
      logger.error('Error adding notary', error, { userId: user.id })
      toast.error('Failed to add notary', 'Please try again')
    }
  }

  const handleUpdateNotary = async (notaryId: string, notaryData: Partial<NotaryData>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notaries')
        .update(notaryData)
        .eq('id', notaryId)

      if (error) throw error

      await loadNotaries(user.id)
    } catch (error) {
      logger.error('Error updating notary', error, { notaryId })
      toast.error('Failed to update notary', 'Please try again')
    }
  }

  const handleDeleteNotary = async (notaryId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notaries')
        .delete()
        .eq('id', notaryId)

      if (error) throw error

      await loadNotaries(user.id)
    } catch (error) {
      logger.error('Error deleting notary', error, { notaryId })
      toast.error('Failed to delete notary', 'Please try again')
    }
  }

  const handleSetPrimary = async (notaryId: string) => {
    if (!user) return

    try {
      // First, set all notaries to non-primary
      await supabase
        .from('notaries')
        .update({ is_primary: false })
        .eq('user_id', user.id)

      // Then set the selected notary as primary
      const { error } = await supabase
        .from('notaries')
        .update({ is_primary: true })
        .eq('id', notaryId)

      if (error) throw error

      await loadNotaries(user.id)
    } catch (error) {
      logger.error('Error setting primary notary', error, { notaryId })
      toast.error('Failed to set primary notary', 'Please try again')
    }
  }

  return (
    <ProTierGuard pageName="Notary Services">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/heirs')}
                className="h-10 sm:h-9 px-2 sm:px-3 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Notaries</h1>
            </div>
            <Button 
              onClick={() => {
                const notarySelector = document.querySelector('[data-add-notary-btn]') as HTMLButtonElement
                notarySelector?.click()
              }}
              className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full p-0 flex-shrink-0 ml-2"
            >
              <span className="text-lg sm:text-xl md:text-2xl">+</span>
            </Button>
          </div>
          
        </div>

        {/* Notary Selector or Detail View */}
        {selectedNotary ? (
          <NotaryDetail
            notary={selectedNotary}
            onEdit={() => {
              // Edit functionality handled by NotarySelector component
              setSelectedNotary(null)
            }}
            onDelete={() => {
              if (selectedNotary.id) {
                handleDeleteNotary(selectedNotary.id)
              }
              setSelectedNotary(null)
            }}
            onSetPrimary={() => {
              if (selectedNotary.id) {
                handleSetPrimary(selectedNotary.id)
              }
              setSelectedNotary(null)
            }}
          />
        ) : (
          <NotarySelector
            notaries={notaries}
            onAddNotary={handleAddNotary}
            onUpdateNotary={handleUpdateNotary}
            onDeleteNotary={handleDeleteNotary}
            onSetPrimary={handleSetPrimary}
            onViewDetails={(notary) => setSelectedNotary(notary)}
            selectedFilter={selectedFilter}
          />
        )}
      </div>
    </ProTierGuard>
  )
}
