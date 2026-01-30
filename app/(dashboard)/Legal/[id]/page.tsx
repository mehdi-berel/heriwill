"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { LegalDocumentDetail } from "@/components/module/legal/legal-document-detail"
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
  title: string
  document_type: 'will' | 'trust' | 'power_of_attorney' | 'healthcare_directive' | 'life_insurance' | 'deed' | 'other'
  description: string
  is_required: boolean
  is_uploaded: boolean
  file_url?: string
  file_size?: number
  upload_date?: string
  expiry_date?: string
  notarized: boolean
  notarized_date?: string
  status: 'pending' | 'uploaded' | 'reviewed' | 'approved' | 'expired'
  priority: 'low' | 'medium' | 'high' | 'critical'
  instructions?: string
  created_at: string
  updated_at: string
  tags: string[]
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
    // In a real app, this would fetch from Supabase
    // Simulating fetch with mock data for now since we're using mock data in the main page
    try {
      // Mock data matching the structure
      const mockDocument: LegalDocument = {
        id: id,
        title: 'Last Will and Testament',
        document_type: 'will',
        description: 'Primary will document outlining asset distribution and guardianship.',
        is_required: true,
        is_uploaded: false,
        notarized: false,
        status: 'pending',
        priority: 'critical',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['estate', 'assets', 'beneficiaries'],
        instructions: 'Must be signed in the presence of two disinterested witnesses.'
      }
      
      // If we had a real backend connected for documents:
      /*
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setDocument(data)
      */
     
      setDocument(mockDocument)
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

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this document?')) {
      // API call to delete
      router.push("/Legal")
    }
  }

  const handleUpload = async (file: File) => {
    // API call to upload
    console.log("Uploading file:", file)
    // Refresh document
    await loadDocument(documentId)
  }

  const handleDownload = () => {
    // API call to download
    console.log("Downloading document")
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

        <LegalDocumentDetail
          document={document}
          onDelete={handleDelete}
          onUpload={handleUpload}
          onDownload={handleDownload}
          onEdit={() => console.log("Edit clicked")}
        />
      </div>
    </DashboardLayout>
  )
}
