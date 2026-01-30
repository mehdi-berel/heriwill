"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Phone, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface Notary {
  id: string
  name: string
  email: string
  phone?: string
  license_number?: string
  is_verified: boolean
  is_primary: boolean
  created_at: string
  notary_user_id?: string
  user_id: string
  users?: {
    full_name: string
    email: string
  }
}

export default function NotarySearchPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [filteredNotaries, setFilteredNotaries] = useState<Notary[]>([])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      loadNotaries()
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

  const loadNotaries = async () => {
    try {
      setLoading(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('notaries')
        .select(`
          *,
          users!notaries_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false }) as any)

      if (error) throw error
      setNotaries(data || [])
      setFilteredNotaries(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading notaries:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotaries(notaries)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = notaries.filter(notary => 
        notary.name.toLowerCase().includes(query) ||
        notary.email.toLowerCase().includes(query) ||
        (notary.phone && notary.phone.toLowerCase().includes(query)) ||
        (notary.license_number && notary.license_number.toLowerCase().includes(query)) ||
        (notary.users?.full_name && notary.users.full_name.toLowerCase().includes(query))
      )
      setFilteredNotaries(filtered)
    }
  }, [searchQuery, notaries])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <DashboardLayout 
      userName={user?.email} 
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Notary Directory</h1>
          <p className="text-text-secondary mt-2">
            Browse all notaries invited by users
          </p>
        </div>

        {/* Search */}
        <Card className="border-gray-700">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              <Input
                placeholder="Search by name, email, phone, or license number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription>Total Notaries</CardDescription>
              <CardTitle className="text-3xl">{notaries.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription>Verified</CardDescription>
              <CardTitle className="text-3xl text-green-500">
                {notaries.filter(n => n.is_verified).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription>With Accounts</CardDescription>
              <CardTitle className="text-3xl text-primary-500">
                {notaries.filter(n => n.notary_user_id).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Notaries List */}
        <div className="space-y-4">
          {filteredNotaries.length === 0 ? (
            <Card className="border-gray-700">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-text-tertiary opacity-50" />
                <p className="text-text-secondary">
                  {searchQuery ? 'No notaries found matching your search' : 'No notaries have been invited yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotaries.map((notary) => (
              <Card key={notary.id} className="border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{notary.name}</CardTitle>
                        {notary.is_verified && (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {notary.is_primary && (
                          <Badge className="bg-primary-500/10 text-primary-400 border-primary-500/20">
                            Primary
                          </Badge>
                        )}
                        {notary.notary_user_id && (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            Has Account
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Invited by: {notary.users?.full_name || notary.users?.email || 'Unknown'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-text-tertiary" />
                      <span className="text-text-secondary">{notary.email}</span>
                    </div>
                    {notary.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-text-tertiary" />
                        <span className="text-text-secondary">{notary.phone}</span>
                      </div>
                    )}
                    {notary.license_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-text-tertiary" />
                        <span className="text-text-secondary">License: {notary.license_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-tertiary">Added:</span>
                      <span className="text-text-secondary">
                        {new Date(notary.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
