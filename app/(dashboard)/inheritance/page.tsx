"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"
import { VaultsList } from "@/components/module/inheritance/vaults-list"

interface InheritedVault {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  category: string
  owner_name: string
  item_count: number
  created_at: string
}

export default function InheritanceRoute() {
  const router = useRouter()
  const [vaults, setVaults] = useState<InheritedVault[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const loadInheritedVaults = useCallback(async (currentUserId: string) => {
    try {
      setLoading(true)
      
      // Check if user is an heir
      const { data: heirData, error: heirError } = await supabase
        .from('heirs')
        .select('user_id')
        .eq('heir_user_id', currentUserId)
        .eq('is_active', true)

      if (heirError || !heirData || heirData.length === 0) {
        setVaults([])
        return
      }

      const ownerIds = heirData.map(h => h.user_id)

      // Check for completed inheritance triggers
      const { data: triggersData } = await supabase
        .from('inheritance_triggers')
        .select('user_id')
        .in('user_id', ownerIds)
        .eq('status', 'completed')

      if (!triggersData || triggersData.length === 0) {
        setVaults([])
        return
      }

      const triggeredOwnerIds = triggersData.map(t => t.user_id)

      // Get vaults from triggered owners
      const { data: vaultsData } = await supabase
        .from('vaults')
        .select('*')
        .in('user_id', triggeredOwnerIds)

      if (!vaultsData) {
        setVaults([])
        return
      }

      // Get owner names and item counts
      const vaultsWithDetails = await Promise.all(
        vaultsData.map(async (vault) => {
          const { data: ownerData } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', vault.user_id)
            .single()

          const { count } = await supabase
            .from('vault_items')
            .select('*', { count: 'exact', head: true })
            .eq('vault_id', vault.id)

          return {
            id: vault.id,
            name: vault.name,
            description: vault.description,
            icon: vault.icon,
            color: vault.color,
            category: vault.category,
            owner_name: (ownerData as { full_name?: string; email?: string } | null)?.full_name || (ownerData as { full_name?: string; email?: string } | null)?.email || 'Unknown',
            item_count: count || 0,
            created_at: vault.created_at
          }
        })
      )

      setVaults(vaultsWithDetails)
    } catch (error) {
      logger.error('Error loading inherited vaults', error)
      setVaults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUserId(user.id)
      await loadInheritedVaults(user.id)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUserId(session.user.id)
        await loadInheritedVaults(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, loadInheritedVaults])

  if (!userId || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-lg text-muted-foreground">Loading inherited vaults...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inherited Vaults</h1>
          <p className="text-muted-foreground mt-1">
            Vaults shared with you through inheritance
          </p>
        </div>
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            These vaults have been shared with you as an heir. You have read-only access to view and download contents.
          </p>
        </CardContent>
      </Card>

      {/* Vaults List */}
      <VaultsList 
        vaults={vaults}
        onVaultClick={(vaultId) => router.push(`/inheritance/${vaultId}`)}
      />
    </div>
  )
}
