"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { LegalDashboard } from "@/components/module/legal/legal-dashboard"
import { LegalDocumentCard } from "@/components/module/legal/legal-document-card"
import { NotaryRequirements } from "@/components/module/legal/notary-requirements"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

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

interface NotaryRequirement {
  id: string
  title: string
  description: string
  document_types: string[]
  is_required: boolean
  status: 'pending' | 'completed' | 'verified' | 'expired'
  due_date?: string
  completed_date?: string
  verification_method: 'in_person' | 'online' | 'mobile'
  notary_details?: {
    name: string
    commission_number: string
    location: string
    contact: string
    seal: string
  }
  instructions: string
  resources: {
    title: string
    url: string
    description: string
  }[]
  created_at: string
  updated_at: string
}

type ViewMode = 'dashboard' | 'documents' | 'notary'

export default function LegalPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [notaryRequirements, setNotaryRequirements] = useState<NotaryRequirement[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
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
      await Promise.all([
        loadDocuments(user.id),
        loadNotaryRequirements(user.id)
      ])
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
        loadDocuments(session.user.id)
        loadNotaryRequirements(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadDocuments = async (userId: string) => {
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
          file_size: 1024 * 500, // 500KB
          upload_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          notarized: true,
          notarized_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
  }

  const loadNotaryRequirements = async (userId: string) => {
    try {
      // Mock data for now
      const mockRequirements: NotaryRequirement[] = [
        {
          id: '1',
          title: 'Will Notarization',
          description: 'Last Will and Testament must be notarized for legal validity',
          document_types: ['will'],
          is_required: true,
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          verification_method: 'in_person',
          instructions: 'Visit a licensed notary public with valid identification and witnesses',
          resources: [
            {
              title: 'Find a Notary Near You',
              url: 'https://www.nationalnotary.org',
              description: 'Official directory of notaries in your area'
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Power of Attorney Notarization',
          description: 'Power of Attorney documents require notarization',
          document_types: ['power_of_attorney'],
          is_required: true,
          status: 'completed',
          completed_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          verification_method: 'in_person',
          notary_details: {
            name: 'Jane Smith',
            commission_number: 'CA-123456',
            location: 'Los Angeles, CA',
            contact: 'jane@notary.com',
            seal: 'CA-Notary-Seal-123'
          },
          instructions: 'Document has been successfully notarized',
          resources: [],
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setNotaryRequirements(mockRequirements)
    } catch (error) {
      console.error('Error loading notary requirements:', error)
    }
  }

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

  const handleDocumentNotarize = async (documentId: string) => {
    try {
      // In a real app, mark for notarization
      console.log('Marking document for notarization:', documentId)
    } catch (error) {
      console.error('Error marking for notarization:', error)
    }
  }

  const getLegalStats = () => {
    const totalDocuments = documents.length
    const requiredDocuments = documents.filter(d => d.is_required).length
    const uploadedDocuments = documents.filter(d => d.is_uploaded).length
    const approvedDocuments = documents.filter(d => d.status === 'approved').length
    const notarizedDocuments = documents.filter(d => d.notarized).length
    const expiredDocuments = documents.filter(d => {
      return d.expiry_date && new Date(d.expiry_date) < new Date()
    }).length
    const pendingNotarization = documents.filter(d => d.is_uploaded && !d.notarized).length
    const overdueDocuments = documents.filter(d => {
      return d.is_required && !d.is_uploaded
    }).length

    return {
      totalDocuments,
      requiredDocuments,
      uploadedDocuments,
      approvedDocuments,
      notarizedDocuments,
      expiredDocuments,
      pendingNotarization,
      overdueDocuments,
      documentsByType: {
        will: documents.filter(d => d.document_type === 'will').length,
        trust: documents.filter(d => d.document_type === 'trust').length,
        power_of_attorney: documents.filter(d => d.document_type === 'power_of_attorney').length,
        healthcare_directive: documents.filter(d => d.document_type === 'healthcare_directive').length,
        life_insurance: documents.filter(d => d.document_type === 'life_insurance').length,
        deed: documents.filter(d => d.document_type === 'deed').length,
        other: documents.filter(d => d.document_type === 'other').length
      },
      complianceScore: Math.round((approvedDocuments / requiredDocuments) * 100),
      nextDueDate: documents.find(d => d.expiry_date)?.expiry_date,
      recentActivity: {
        uploads: 2,
        approvals: 1,
        notarizations: 1
      }
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Legal Documents</h1>
            <p className="text-muted-foreground">
              Manage your legal documents and notary requirements.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setViewMode('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant={viewMode === 'documents' ? 'default' : 'outline'}
              onClick={() => setViewMode('documents')}
            >
              Documents
            </Button>
            <Button
              variant={viewMode === 'notary' ? 'default' : 'outline'}
              onClick={() => setViewMode('notary')}
            >
              Notary
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'dashboard' && (
          <LegalDashboard
            stats={getLegalStats()}
            onUploadDocument={() => setViewMode('documents')}
            onViewAllDocuments={() => setViewMode('documents')}
            onViewNotaryRequirements={() => setViewMode('notary')}
          />
        )}

        {viewMode === 'documents' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {documents
                .filter(doc => 
                  doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  doc.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((document) => (
                  <LegalDocumentCard
                    key={document.id}
                    document={document}
                    onView={(doc) => console.log('View document:', doc)}
                    onEdit={(doc) => console.log('Edit document:', doc)}
                    onDelete={(id) => setDocuments(documents.filter(d => d.id !== id))}
                    onUpload={handleDocumentUpload}
                    onDownload={handleDocumentDownload}
                    onNotarize={handleDocumentNotarize}
                  />
                ))}
            </div>
          </div>
        )}

        {viewMode === 'notary' && (
          <NotaryRequirements
            requirements={notaryRequirements}
            onRequirementComplete={(id) => {
              setNotaryRequirements(reqs => 
                reqs.map(req => 
                  req.id === id ? { ...req, status: 'completed' as const } : req
                )
              )
            }}
            onRequirementView={(req) => console.log('View requirement:', req)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
