"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { PDFEditor } from "@/components/module/legal/pdf-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface UserProfile {
  full_name?: string
  email?: string
  subscription_tier?: string
}

interface LegalDocument {
  id: string
  name: string
  document_type: 'will' | 'trust' | 'power_of_attorney' | 'healthcare_directive' | 'life_insurance' | 'deed' | 'other'
  description: string
  template_file_url?: string
  file_size?: number
  is_active: boolean
  created_at: string
  updated_at: string
  user_id: string
  metadata?: {
    content?: string
    [key: string]: unknown
  }
}

export default function LegalDocumentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const documentId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [document, setDocument] = useState<LegalDocument | null>(null)
  const [loading, setLoading] = useState(true)

  const loadDocument = useCallback(async (id: string) => {
    try {
      setLoading(true)
      
      // Fetch legal document from legal table
      const { data, error } = await supabase
        .from('legal')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Error loading document:', error)
        throw error
      }

      if (!data) {
        throw new Error('Document not found')
      }

      // Set document data directly
      setDocument(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading document:', error)
      setLoading(false)
      router.push("/Legal")
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
      
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      
      await loadDocument(documentId)
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
  }, [router, documentId, loadDocument])


  const handleSaveContent = async (data: { content: string }) => {
    try {
      // Get current metadata and merge with new content
      const currentMetadata = document?.metadata || {}
      const updatedMetadata = {
        ...currentMetadata,
        content: data.content
      }

      const { error } = await supabase
        .from('legal')
        .update({
          metadata: updatedMetadata as Record<string, unknown>,
          updated_at: new Date().toISOString()
        } as never)
        .eq('id', documentId)

      if (error) {
        console.error('Error saving content:', error)
        alert('Failed to save document')
        return
      }

      alert('Document saved successfully!')
      await loadDocument(documentId)
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Failed to save document')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Document not found</div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={async () => {
        await supabase.auth.signOut()
        router.push("/login")
      }}
    >
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/Legal")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Legal Documents
          </Button>
        </div>

        <PDFEditor
          documentType={document.document_type}
          documentData={document}
          onSave={handleSaveContent}
        />
      </div>
    </DashboardLayout>
  )
}
