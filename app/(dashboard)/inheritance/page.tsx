"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { InheritancePage } from "@/components/module/inheritance/inheritance-page"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

export default function InheritanceRoute() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
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

  if (!user) return null

  return <InheritancePage userId={user.id} />
}
