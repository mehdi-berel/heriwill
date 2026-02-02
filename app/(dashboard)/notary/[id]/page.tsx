"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { NotaryDetail } from "@/components/module/notary/notary-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { toast } from "@/lib/utils/toast"
import { logger } from "@/lib/utils/logger"
import { notaryActions } from "@/app/actions/notaries"

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

export default function NotaryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const notaryId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [notary, setNotary] = useState<Notary | null>(null)

  const loadNotary = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('notaries')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('Error loading notary', error, { notaryId: id })
        toast.error('Failed to load notary', 'Please try again')
        router.push("/notary")
        return
      }

      setNotary(data as Notary)
    } catch (error) {
      logger.error('Error loading notary', error, { notaryId: id })
      toast.error('Failed to load notary', 'Please try again')
      router.push("/notary")
    }
  }, [router])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load notary
      await loadNotary(notaryId)
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
  }, [router, notaryId, loadNotary])

  const handleDeleteNotary = async () => {
    if (!notary) return

    if (confirm('Are you sure you want to delete this notary?')) {
      try {
        await notaryActions.deleteNotary(notaryId)
        toast.success('Notary deleted successfully')
        router.push("/notary")
      } catch (error) {
        logger.error('Error deleting notary', error, { notaryId })
        toast.error('Failed to delete notary')
      }
    }
  }

  const handleSetPrimary = async () => {
    if (!user || !notary) return

    try {
      await notaryActions.setPrimaryNotary(user.id, notaryId)
      await loadNotary(notaryId)
      toast.success('Primary notary updated')
    } catch (error) {
      logger.error('Error setting primary notary', error, { notaryId })
      toast.error('Failed to set primary notary')
    }
  }

  if (!notary) return null

  return (
    <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/notary")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notaries
          </Button>
        </div>

        <NotaryDetail
          notary={notary}
          onDelete={handleDeleteNotary}
          onSetPrimary={handleSetPrimary}
          onEdit={() => {
            // TODO: Implement edit functionality or navigation to edit page
            router.push(`/notary/${notaryId}/edit`)
          }}
        />
    </div>
  )
}
