"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProTierGuard } from "@/components/module/auth/pro-tier-guard"
import { LegalDocumentForm } from "@/components/module/legal/legal-document-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, Shield, Gavel, User as UserIcon, Scale, FileCheck, Edit, Trash2, Lock, Upload, Download, CheckCircle, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { toast } from "@/lib/utils/toast"
import { logger } from "@/lib/utils/logger"

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
  notary_details?: {
    notary_name: string
    notary_seal: string
    notary_location: string
    commission_number: string
  }
  status: 'pending' | 'uploaded' | 'reviewed' | 'approved' | 'expired'
  priority: 'low' | 'medium' | 'high' | 'critical'
  instructions?: string
  created_at: string
  updated_at: string
  tags: string[]
}

function LegalPageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'will' | 'trust' | 'power_of_attorney' | 'healthcare_directive' | 'life_insurance' | 'deed' | 'other' | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/vaults'

  const loadDocuments = useCallback(async () => {
    try {
      if (!user) return

      // Fetch user's legal documents from legal table
      const { data: legalDocs, error } = await supabase
        .from('legal')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error loading legal documents', error, { userId: user?.id })
        return
      }

      // Map legal documents to LegalDocument format
      const mappedDocuments: LegalDocument[] = (legalDocs || []).map((doc: Record<string, unknown>) => ({
        id: doc.id as string,
        title: (doc.name as string) || 'Untitled',
        document_type: (doc.document_type as LegalDocument['document_type']) || 'other',
        description: (doc.description as string) || '',
        is_required: false,
        is_uploaded: !!doc.template_file_url,
        file_url: doc.template_file_url as string | undefined,
        file_size: doc.file_size as number | undefined,
        notarized: false,
        status: doc.template_file_url ? 'uploaded' as const : 'pending' as const,
        priority: 'medium' as const,
        created_at: doc.created_at as string,
        updated_at: doc.updated_at as string,
        tags: [doc.document_type as string, 'legal']
      }))

      setDocuments(mappedDocuments)
    } catch (error) {
      logger.error('Error loading documents', error, { userId: user?.id })
      toast.error('Failed to load documents', 'Please refresh the page')
    }
  }, [user])

  const handleSaveDocument = async (documentType: string) => {
    try {
      if (!user) return

      // Template names for each document type
      const templateNames: Record<string, string> = {
        'will': 'Last Will and Testament',
        'trust': 'Living Trust',
        'power_of_attorney': 'Power of Attorney',
        'healthcare_directive': 'Healthcare Directive',
        'life_insurance': 'Life Insurance Policy',
        'deed': 'Property Deed',
        'other': 'Legal Document'
      }

      const templateDescriptions: Record<string, string> = {
        'will': 'Your final wishes for asset distribution',
        'trust': 'Living or testamentary trust agreement',
        'power_of_attorney': 'Legal authority to act on your behalf',
        'healthcare_directive': 'Medical decisions and living will',
        'life_insurance': 'Insurance policy documents',
        'deed': 'Real estate ownership documents',
        'other': 'Other important legal documents'
      }

      // Create a legal document entry for this user
      const { data: legalDoc, error: legalError } = await supabase
        .from('legal')
        .insert({
          created_by: user.id,
          name: templateNames[documentType] || 'Legal Document',
          document_type: documentType,
          description: templateDescriptions[documentType] || '',
          is_active: true
        } as never)
        .select()
        .single()

      if (legalError) {
        logger.error('Error creating legal document', legalError, { documentType })
        toast.error('Failed to create legal document')
        return
      }

      toast.success('Legal document created successfully')

      logger.info('Created legal document', { documentId: legalDoc.id })
      
      // Reload documents
      await loadDocuments()
      setShowForm(false)
      setEditingDocument(null)
    } catch (error) {
      logger.error('Error saving document', error, { documentType })
      toast.error('Failed to save document', 'Please try again')
      throw error
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load legal data
      await loadDocuments()
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
        loadDocuments()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, loadDocuments])

  const handleDocumentUpload = async (documentId: string, file: File) => {
    try {
      // In a real app, upload to storage and update database
      logger.info('Uploading file for document', { documentId, fileName: file.name })
      
      // Update document status
      setDocuments(documents.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              is_uploaded: true, 
              file_url: `/documents/${file.name}`,
              file_size: file.size,
              upload_date: new Date().toISOString(),
              status: 'uploaded' as const
            }
          : doc
      ))
    } catch (error) {
      logger.error('Error uploading document', error, { documentId })
      toast.error('Failed to upload document', 'Please try again')
    }
  }

  const handleDocumentDownload = async (documentId: string) => {
    try {
      // In a real app, download from storage
      logger.info('Downloading document', { documentId })
    } catch (error) {
      logger.error('Error downloading document', error, { documentId })
      toast.error('Failed to download document', 'Please try again')
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'will': return <FileText className="h-6 w-6 text-white" />
      case 'trust': return <Shield className="h-6 w-6 text-white" />
      case 'power_of_attorney': return <Gavel className="h-6 w-6 text-white" />
      case 'healthcare_directive': return <UserIcon className="h-6 w-6 text-white" />
      case 'life_insurance': return <Scale className="h-6 w-6 text-white" />
      case 'deed': return <FileCheck className="h-6 w-6 text-white" />
      default: return <FileText className="h-6 w-6 text-white" />
    }
  }

  const getDocumentColor = () => {
    // Return different colors based on document type if needed
    // For now returning the primary purple color
    return 'rgb(124, 58, 237)' // purple for all
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === null || doc.document_type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <ProTierGuard pageName="Legal Documents">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          {/* Back Button and Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Button 
                variant="ghost" 
                onClick={() => router.push(returnTo)}
                className="h-10 sm:h-9 px-2 sm:px-3 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Vault</span>
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Legal</h1>
            </div>
            <Button 
              onClick={() => {
                setEditingDocument(null)
                setShowForm(true)
              }}
              className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full p-0 flex-shrink-0 ml-2"
            >
              <span className="text-lg sm:text-xl md:text-2xl">+</span>
            </Button>
          </div>
          
          {/* Category Tabs - Centered */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Button
              variant={selectedType === 'will' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(selectedType === 'will' ? null : 'will')}
              className="rounded-lg h-9 sm:h-8 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              Will ({documents.filter(d => d.document_type === 'will').length})
            </Button>
            <Button
              variant={selectedType === 'trust' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(selectedType === 'trust' ? null : 'trust')}
              className="rounded-lg h-9 sm:h-8 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              Trust ({documents.filter(d => d.document_type === 'trust').length})
            </Button>
            <Button
              variant={selectedType === 'power_of_attorney' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(selectedType === 'power_of_attorney' ? null : 'power_of_attorney')}
              className="rounded-lg h-9 sm:h-8 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              POA ({documents.filter(d => d.document_type === 'power_of_attorney').length})
            </Button>
            <Button
              variant={selectedType === 'healthcare_directive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(selectedType === 'healthcare_directive' ? null : 'healthcare_directive')}
              className="rounded-lg h-9 sm:h-8 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              Healthcare ({documents.filter(d => d.document_type === 'healthcare_directive').length})
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 h-10 sm:h-11 bg-background-secondary border-border rounded-xl text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">No documents found</h3>
              <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8 max-w-md">
                {searchTerm || selectedType !== null 
                  ? 'Try adjusting your search or filters.' 
                  : 'Create your first legal document to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center p-3 sm:p-4 bg-background-card border border-gray-700 rounded-xl cursor-pointer hover:border-primary/50 transition-all group"
                  onClick={() => router.push(`/Legal/${document.id}`)}
                >
                  {/* Icon Container */}
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-2.5 sm:mr-3 flex-shrink-0"
                    style={{ backgroundColor: getDocumentColor() }}
                  >
                    <div className="scale-75 sm:scale-100">
                      {getDocumentIcon(document.document_type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                      <h3 className="text-sm sm:text-base font-semibold truncate">{document.title}</h3>
                      {document.is_uploaded && (
                        <div className="px-1.5 py-0.5 rounded bg-success/20 flex items-center">
                          <CheckCircle className="h-3 w-3 text-success" />
                        </div>
                      )}
                      {document.notarized && (
                        <div className="px-1.5 py-0.5 rounded bg-blue-500/20 flex items-center">
                          <Lock className="h-3 w-3 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground">
                      <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="capitalize hidden xs:inline">{document.document_type.replace('_', ' ')}</span>
                      <span className="capitalize xs:hidden">{document.document_type.split('_')[0]}</span>
                      {document.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(document.file_size)}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="capitalize">{document.status}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
                    {!document.is_uploaded && (
                      <div className="relative">
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation()
                            const file = e.target.files?.[0]
                            if (file) handleDocumentUpload(document.id, file)
                          }}
                          accept=".pdf,.doc,.docx,.txt"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 sm:h-9 sm:w-9 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        >
                          <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    )}
                    {document.is_uploaded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 sm:h-9 sm:w-9 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDocumentDownload(document.id)
                        }}
                      >
                        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 sm:h-9 sm:w-9 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingDocument(document)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 sm:h-9 sm:w-9 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDocuments(documents.filter(d => d.id !== document.id))
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Form Modal */}
        <LegalDocumentForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setEditingDocument(null)
          }}
          onSave={handleSaveDocument}
          initialData={editingDocument || undefined}
        />
      </div>
    </ProTierGuard>
  )
}

export default function LegalPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LegalPageContent />
    </Suspense>
  )
}
