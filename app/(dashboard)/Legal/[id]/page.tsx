"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { PDFEditor } from "@/components/module/legal/pdf-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/lib/utils/toast"
import { logger } from "@/lib/utils/logger"

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

  const [document, setDocument] = useState<LegalDocument | null>(null)

  const loadDocument = useCallback(async (id: string) => {
    try {
      // Fetch legal document from legal table
      const { data, error } = await supabase
        .from('legal')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        logger.error('Error loading document', error, { documentId: id })
        throw error
      }

      if (!data) {
        throw new Error('Document not found')
      }

      // Set document data directly
      setDocument(data as LegalDocument)
    } catch (error) {
      logger.error('Error loading document', error, { documentId: id })
      toast.error('Failed to load document', 'Please try again')
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
      
      await loadDocument(documentId)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
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
        logger.error('Error saving content', error, { documentId })
        toast.error('Failed to save document')
        return
      }

      toast.success('Document saved successfully!')
      await loadDocument(documentId)
    } catch (error) {
      logger.error('Error saving document', error, { documentId })
      toast.error('Failed to save document')
    }
  }

  if (!document) return null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/Legal")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Legal Documents
        </Button>

        <PDFEditor
          documentType={document.document_type}
          documentData={document}
          onSave={handleSaveContent}
        />
      </div>
    </div>
  )
}
