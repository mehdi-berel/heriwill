"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { HelpCenter } from "@/components/module/help/help-center"
import { supabase } from "@/lib/supabase"

export default function HelpPage() {
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return <HelpCenter />
}
