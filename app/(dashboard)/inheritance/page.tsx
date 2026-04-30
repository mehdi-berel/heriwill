"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Info, Search } from "lucide-react"
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
  const [searchTerm, setSearchTerm] = useState('')

  const loadInheritedVaults = useCallback(async (currentUserId: string) => {
    try {
      setLoading(true)
      
      // Get shared vaults directly — these are created by the inheritance trigger
      const { data: sharedVaults, error: sharedError } = await supabase
        .from('shared_vaults')
        .select(`
          vault_id,
          owner_id,
          shared_at,
          vaults (id, name, description, icon, color, category, created_at, user_id)
        `)
        .eq('shared_with_user_id', currentUserId)
        .eq('is_active', true)
        .eq('accepted', true)

      if (sharedError || !sharedVaults || sharedVaults.length === 0) {
        if (sharedError) logger.error('Error loading shared vaults', sharedError)
        setVaults([])
        return
      }

      // Get owner names and item counts
      const vaultsWithDetails = await Promise.all(
        sharedVaults.map(async (sv) => {
          const vault = sv.vaults as unknown as {
            id: string; name: string; description: string | null
            icon: string | null; color: string | null; category: string
            created_at: string; user_id: string
          }
          if (!vault) return null

          const { data: ownerData } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', sv.owner_id)
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

      setVaults(vaultsWithDetails.filter(Boolean) as InheritedVault[])
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Inherited Vaults</h1>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search inherited vaults..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-background-secondary rounded-xl"
            style={{ borderColor: '#232629' }}
          />
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-500/5 border-blue-500/20 mb-6">
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
        searchTerm={searchTerm}
      />
    </div>
  )
}
