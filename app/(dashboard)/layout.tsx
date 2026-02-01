"use client"

import { ReactNode, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { supabase } from "@/lib/supabase"

export default function DashboardLayoutWrapper({
  children,
}: {
  children: ReactNode
}) {
  const [userName, setUserName] = useState<string>()
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      setUserName((profile as { full_name?: string; email?: string } | null)?.full_name || user.email || undefined)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <DashboardLayout userName={userName} onSignOut={handleSignOut}>
      {children}
    </DashboardLayout>
  )
}
