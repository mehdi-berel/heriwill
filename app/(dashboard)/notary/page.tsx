"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProTierGuard } from "@/components/module/auth/pro-tier-guard"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { NotarySelector } from "@/components/module/notary/notary-selector"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

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
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'primary' | 'secondary' | null>(null)
  const router = useRouter()

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
      
      // Load notaries
      await loadNotaries(user.id)
      
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleAddNotary = async (notaryData: any) => {
    try {
      const { data, error } = await supabase
        .from('notaries')
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

  const handleUpdateNotary = async (notaryId: string, notaryData: any) => {
    try {
      const { error } = await supabase
        .from('notaries')
        .update(notaryData)
        .eq('id', notaryId)

      if (error) throw error

      await loadNotaries(user.id)
    } catch (error) {
      console.error('Error updating notary:', error)
    }
  }

  const handleDeleteNotary = async (notaryId: string) => {
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
      console.error('Error setting primary notary:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const hasPrimaryNotary = notaries.some(n => n.is_primary)

  return (
    <ProTierGuard pageName="Notary Services">
      <DashboardLayout 
        userName={profile?.full_name || user?.email} 
        onSignOut={handleSignOut}
      >
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
          
          {/* Category Tabs - Centered */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(selectedFilter === 'all' ? null : 'all')}
              className="rounded-lg"
            >
              All ({notaries.length})
            </Button>
            <Button
              variant={selectedFilter === 'primary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(selectedFilter === 'primary' ? null : 'primary')}
              className="rounded-lg"
            >
              Primary ({notaries.filter(n => n.is_primary).length})
            </Button>
            <Button
              variant={selectedFilter === 'secondary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(selectedFilter === 'secondary' ? null : 'secondary')}
              className="rounded-lg"
            >
              Secondary ({notaries.filter(n => !n.is_primary).length})
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search notaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background-secondary border-border rounded-xl"
            />
          </div>
        </div>

        {/* Notary Selector */}
        <NotarySelector
          notaries={notaries}
          onAddNotary={handleAddNotary}
          onUpdateNotary={handleUpdateNotary}
          onDeleteNotary={handleDeleteNotary}
          onSetPrimary={handleSetPrimary}
          searchTerm={searchTerm}
          selectedFilter={selectedFilter}
        />
      </div>
    </DashboardLayout>
    </ProTierGuard>
  )
}
