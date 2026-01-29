"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ProTierGuard } from "@/components/module/auth/pro-tier-guard"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { LegalDocumentForm } from "@/components/module/legal/legal-document-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, Shield, Gavel, User as UserIcon, Scale, FileCheck, Edit, Trash2, Lock, Upload, Download, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  full_name?: string
  subscription_tier?: string
}

interface DocumentFormData {
  title: string
  document_type: 'will' | 'trust' | 'power_of_attorney' | 'healthcare_directive' | 'life_insurance' | 'deed' | 'other'
  description: string
  is_required: boolean
  instructions?: string
  tags: string[]
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

export default function LegalPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'will' | 'trust' | 'power_of_attorney' | 'healthcare_directive' | 'life_insurance' | 'deed' | 'other' | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null)
  const router = useRouter()

  const loadDocuments = useCallback(async () => {
    try {
      // Mock data for now - in real app, fetch from database
      const mockDocuments: LegalDocument[] = [
        {
          id: '1',
          title: 'Last Will and Testament',
          document_type: 'will',
          description: 'Primary will document outlining asset distribution',
          is_required: true,
          is_uploaded: false,
          notarized: false,
          status: 'pending',
          priority: 'critical',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: ['estate', 'assets', 'beneficiaries']
        },
        {
          id: '2',
          title: 'Durable Power of Attorney',
          document_type: 'power_of_attorney',
          description: 'Legal authority for financial decisions',
          is_required: true,
          is_uploaded: true,
          file_url: '/documents/poa.pdf',
          file_size: 245000,
          notarized: true,
          notarized_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'approved',
          priority: 'high',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['financial', 'authority', 'legal']
        }
      ]
      setDocuments(mockDocuments)
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }, [])

  const handleSaveDocument = async (formData: DocumentFormData, file?: File) => {
    try {
      // In a real app, this would save to Supabase
      const newDocument: LegalDocument = {
        id: Date.now().toString(),
        title: formData.title,
        document_type: formData.document_type,
        description: formData.description,
        is_required: formData.is_required,
        is_uploaded: !!file,
        file_url: file ? URL.createObjectURL(file) : undefined,
        file_size: file?.size,
        notarized: false,
        status: 'pending',
        priority: formData.is_required ? 'high' : 'medium',
        instructions: formData.instructions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: formData.tags
      }
      
      setDocuments([newDocument, ...documents])
      setShowForm(false)
      setEditingDocument(null)
    } catch (error) {
      console.error('Error saving document:', error)
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
      
      // Load user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setProfile(profileData)
      
      // Load legal data
      await loadDocuments()
      
      setLoading(false)
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
      console.log('Uploading file for document:', documentId, file)
      
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
      console.error('Error uploading document:', error)
    }
  }

  const handleDocumentDownload = async (documentId: string) => {
    try {
      // In a real app, download from storage
      console.log('Downloading document:', documentId)
    } catch (error) {
      console.error('Error downloading document:', error)
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <ProTierGuard pageName="Legal Documents">
      <DashboardLayout 
        userName={profile?.full_name || user?.email} 
        onSignOut={handleSignOut}
      >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Legal Documents</h1>
            <Button 
              onClick={() => {
                setEditingDocument(null)
                setShowForm(true)
              }}
              className="h-12 w-12 rounded-full p-0"
            >
              <span className="text-2xl">+</span>
            </Button>
          </div>
          
          {/* Category Tabs - Centered */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={selectedType === 'will' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(selectedType === 'will' ? null : 'will')}
              className="rounded-lg"
            >
              Will ({documents.filter(d => d.document_type === 'will').length})
            </Button>
            <Button
              variant={selectedType === 'trust' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(selectedType === 'trust' ? null : 'trust')}
              className="rounded-lg"
            >
              Trust ({documents.filter(d => d.document_type === 'trust').length})
            </Button>
            <Button
              variant={selectedType === 'power_of_attorney' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(selectedType === 'power_of_attorney' ? null : 'power_of_attorney')}
              className="rounded-lg"
            >
              POA ({documents.filter(d => d.document_type === 'power_of_attorney').length})
            </Button>
            <Button
              variant={selectedType === 'healthcare_directive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(selectedType === 'healthcare_directive' ? null : 'healthcare_directive')}
              className="rounded-lg"
            >
              Healthcare ({documents.filter(d => d.document_type === 'healthcare_directive').length})
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background-secondary border-border rounded-xl"
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-6">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">No documents found</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                {searchTerm || selectedType !== null 
                  ? 'Try adjusting your search or filters.' 
                  : 'Create your first legal document to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center p-4 bg-background-card border border-border rounded-xl cursor-pointer hover:border-primary/50 transition-all group"
                  onClick={() => console.log('View document:', document)}
                >
                  {/* Icon Container */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                    style={{ backgroundColor: getDocumentColor() }}
                  >
                    {getDocumentIcon(document.document_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold truncate">{document.title}</h3>
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
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="capitalize">{document.document_type.replace('_', ' ')}</span>
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
                  <div className="flex items-center gap-2 ml-2">
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
                          className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {document.is_uploaded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDocumentDownload(document.id)
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingDocument(document)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDocuments(documents.filter(d => d.id !== document.id))
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
    </DashboardLayout>
    </ProTierGuard>
  )
}
