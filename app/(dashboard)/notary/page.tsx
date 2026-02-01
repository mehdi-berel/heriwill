"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProTierGuard } from "@/components/module/auth/pro-tier-guard"
import { NotarySelector } from "@/components/module/notary/notary-selector"
import { NotaryDetail } from "@/components/module/notary/notary-detail"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

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
        console.error('Error loading notaries:', error)
        return
      }

      setNotaries(data || [])
    } catch (error) {
      console.error('Error loading notaries:', error)
    }
  }

  const handleAddNotary = async (notaryData: NotaryData) => {
    if (!user) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('notaries') as any)
        .insert({
          user_id: user.id,
          ...notaryData
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        await loadNotaries(user.id)
      }
    } catch (error) {
      console.error('Error adding notary:', error)
    }
  }

  const handleUpdateNotary = async (notaryId: string, notaryData: Partial<NotaryData>) => {
    if (!user) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('notaries') as any)
        .update(notaryData)
        .eq('id', notaryId)

      if (error) throw error

      await loadNotaries(user.id)
    } catch (error) {
      console.error('Error updating notary:', error)
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
      console.error('Error deleting notary:', error)
    }
  }

  const handleSetPrimary = async (notaryId: string) => {
    if (!user) return

    try {
      // First, set all notaries to non-primary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('notaries') as any)
        .update({ is_primary: false })
        .eq('user_id', user.id)

      // Then set the selected notary as primary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('notaries') as any)
        .update({ is_primary: true })
        .eq('id', notaryId)

      if (error) throw error

      await loadNotaries(user.id)
    } catch (error) {
      console.error('Error setting primary notary:', error)
    }
  }

  return (
    <ProTierGuard pageName="Notary Services">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Notaries</h1>
            <Button 
              onClick={() => {
                const notarySelector = document.querySelector('[data-add-notary-btn]') as HTMLButtonElement
                notarySelector?.click()
              }}
              className="h-12 w-12 rounded-full p-0"
            >
              <span className="text-2xl">+</span>
            </Button>
          </div>
          
        </div>

        {/* Notary Selector or Detail View */}
        {selectedNotary ? (
          <NotaryDetail
            notary={selectedNotary}
            onEdit={() => {
              // TODO: Implement edit functionality
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
