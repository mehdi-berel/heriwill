"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { ResourceCard } from "@/components/module/resources/resource-card"
import { ResourceList } from "@/components/module/resources/resource-list"
import { ResourceDetail } from "@/components/module/resources/resource-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, BookOpen, Star, Users, Clock, FileText, Video } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Resource {
  id: string
  title: string
  description: string
  category: 'legal' | 'financial' | 'healthcare' | 'digital' | 'family' | 'business' | 'personal' | 'emergency'
  type: 'article' | 'video' | 'document' | 'tool' | 'service' | 'guide'
  url?: string
  content?: string
  author?: string
  readTime?: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  isRecommended: boolean
  isCompleted?: boolean
  lastAccessed?: string
  createdAt: string
  updatedAt: string
}

export default function ResourcesPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

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
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      
      // Load resources data
      await loadResources(user.id)
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
        loadResources(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadResources = async (userId: string) => {
    try {
      // Mock data for resources - in real app, fetch from resources table
      const mockResources: Resource[] = [
        {
          id: '1',
          title: 'How to Write a Will: Complete Guide',
          description: 'A comprehensive guide to writing your last will and testament, including legal requirements, common mistakes to avoid, and best practices.',
          category: 'legal',
          type: 'guide',
          url: 'https://example.com/will-guide',
          author: 'Legal Experts Association',
          readTime: 25,
          difficulty: 'beginner',
          tags: ['will', 'testament', 'legal', 'estate planning'],
          isRecommended: true,
          isCompleted: false,
          createdAt: new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Understanding Power of Attorney',
          description: 'Learn about different types of power of attorney, when you need one, and how to set it up properly.',
          category: 'legal',
          type: 'article',
          content: 'Power of attorney is a legal document that allows someone to act on your behalf...',
          author: 'Estate Planning Institute',
          readTime: 15,
          difficulty: 'intermediate',
          tags: ['power of attorney', 'legal authority', 'healthcare decisions'],
          isRecommended: true,
          isCompleted: true,
          lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 365 * 1.5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Digital Legacy Planning',
          description: 'How to manage your digital assets, social media accounts, and online presence after you pass away.',
          category: 'digital',
          type: 'video',
          url: 'https://example.com/digital-legacy-video',
          author: 'Digital Legacy Foundation',
          readTime: 20,
          difficulty: 'beginner',
          tags: ['digital assets', 'social media', 'online accounts', 'passwords'],
          isRecommended: false,
          isCompleted: false,
          createdAt: new Date(Date.now() - 365 * 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          title: 'Healthcare Directives and Living Wills',
          description: 'Essential information about healthcare directives, living wills, and medical power of attorney.',
          category: 'healthcare',
          type: 'document',
          content: 'Healthcare directives are legal documents that specify your medical treatment preferences...',
          author: 'Healthcare Legal Services',
          readTime: 18,
          difficulty: 'intermediate',
          tags: ['healthcare', 'medical decisions', 'living will', 'advance directive'],
          isRecommended: true,
          isCompleted: false,
          createdAt: new Date(Date.now() - 365 * 0.5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          title: 'Financial Planning for End of Life',
          description: 'Comprehensive guide to financial planning, including investments, insurance, and tax considerations.',
          category: 'financial',
          type: 'guide',
          url: 'https://example.com/financial-planning',
          author: 'Financial Planning Association',
          readTime: 30,
          difficulty: 'advanced',
          tags: ['financial planning', 'investments', 'insurance', 'taxes', 'retirement'],
          isRecommended: false,
          isCompleted: false,
          createdAt: new Date(Date.now() - 365 * 0.8 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '6',
          title: 'Family Communication About End-of-Life Wishes',
          description: 'How to have difficult conversations with family members about your end-of-life preferences.',
          category: 'family',
          type: 'article',
          content: 'Talking about end-of-life wishes with family can be challenging but is essential...',
          author: 'Family Counseling Services',
          readTime: 12,
          difficulty: 'beginner',
          tags: ['family communication', 'difficult conversations', 'end-of-life'],
          isRecommended: true,
          isCompleted: true,
          lastAccessed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 365 * 0.3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '7',
          title: 'Business Succession Planning',
          description: 'Essential guide for business owners on how to plan for business continuity and succession.',
          category: 'business',
          type: 'tool',
          url: 'https://example.com/business-succession',
          author: 'Business Succession Institute',
          readTime: 35,
          difficulty: 'advanced',
          tags: ['business', 'succession planning', 'ownership transfer', 'continuity'],
          isRecommended: false,
          isCompleted: false,
          createdAt: new Date(Date.now() - 365 * 0.6 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '8',
          title: 'Emergency Preparedness Checklist',
          description: 'A comprehensive checklist for emergency preparedness and important document organization.',
          category: 'emergency',
          type: 'document',
          content: 'Being prepared for emergencies is crucial for protecting your family and assets...',
          author: 'Emergency Preparedness Agency',
          readTime: 10,
          difficulty: 'beginner',
          tags: ['emergency', 'preparedness', 'checklist', 'documents'],
          isRecommended: true,
          isCompleted: true,
          lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 365 * 0.2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '9',
          title: 'Personal Legacy Letter Writing',
          description: 'How to write meaningful legacy letters to your loved ones, preserving your memories and values.',
          category: 'personal',
          type: 'guide',
          url: 'https://example.com/legacy-letters',
          author: 'Legacy Writing Institute',
          readTime: 22,
          difficulty: 'intermediate',
          tags: ['legacy letters', 'personal values', 'memories', 'family'],
          isRecommended: false,
          isCompleted: false,
          createdAt: new Date(Date.now() - 365 * 0.4 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '10',
          title: 'Understanding Trusts and Estates',
          description: 'Detailed explanation of different types of trusts, their benefits, and how they work in estate planning.',
          category: 'legal',
          type: 'video',
          url: 'https://example.com/trusts-video',
          author: 'Trust and Estate Law Firm',
          readTime: 28,
          difficulty: 'advanced',
          tags: ['trusts', 'estates', 'legal structures', 'tax planning'],
          isRecommended: false,
          isCompleted: false,
          createdAt: new Date(Date.now() - 365 * 0.7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setResources(mockResources)
    } catch (error) {
      console.error('Error loading resources:', error)
    }
  }

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource)
    setViewMode('detail')
    
    // Update last accessed
    const updatedResource = {
      ...resource,
      lastAccessed: new Date().toISOString()
    }
    
    setResources(resources.map(r => r.id === resource.id ? updatedResource : r))
    setSelectedResource(updatedResource)
  }

  const handleResourceComplete = async (resource: Resource) => {
    try {
      const updatedResource = {
        ...resource,
        isCompleted: !resource.isCompleted,
        lastAccessed: new Date().toISOString()
      }
      
      setResources(resources.map(r => r.id === resource.id ? updatedResource : r))
      
      if (selectedResource?.id === resource.id) {
        setSelectedResource(updatedResource)
      }
    } catch (error) {
      console.error('Error updating resource completion:', error)
    }
  }

  const handleResourceDownload = async (resource: Resource) => {
    // In a real app, this would download the resource
    console.log('Downloading resource:', resource.title)
  }

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
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Resources</h1>
            <p className="text-muted-foreground">
              Educational resources to help you prepare your afterlife and testament
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Browse
            </Button>
            <Button onClick={() => {/* Open add resource modal */}}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </div>

        {/* Featured Resources */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Recommended Resources
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.filter(r => r.isRecommended).slice(0, 3).map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onView={handleResourceSelect}
                onMarkComplete={handleResourceComplete}
                onDownload={handleResourceDownload}
                showActions={true}
              />
            ))}
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'list' && (
          <ResourceList
            resources={resources}
            onResourceSelect={handleResourceSelect}
            onResourceComplete={handleResourceComplete}
            onResourceDownload={handleResourceDownload}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}

        {viewMode === 'detail' && selectedResource && (
          <ResourceDetail
            resource={selectedResource}
            onBack={() => setViewMode('list')}
            onEdit={() => {/* Open edit modal */}}
            onDelete={() => {/* Handle delete */}}
            onMarkComplete={() => handleResourceComplete(selectedResource)}
            onDownload={() => handleResourceDownload(selectedResource)}
            onShare={() => {/* Handle share */}}
            onBookmark={() => {/* Handle bookmark */}}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
