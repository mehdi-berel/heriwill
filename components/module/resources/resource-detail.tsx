"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download, 
  ExternalLink, 
  Calendar,
  Clock,
  Users,
  BookOpen,
  FileText,
  Video,
  Star,
  CheckCircle,
  Share2,
  Bookmark,
  Tag
} from "lucide-react"

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

interface ResourceDetailProps {
  resource: Resource
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onMarkComplete: () => void
  onDownload: () => void
  onShare: () => void
  onBookmark: () => void
}

export function ResourceDetail({ 
  resource, 
  onBack, 
  onEdit, 
  onDelete, 
  onMarkComplete, 
  onDownload, 
  onShare, 
  onBookmark 
}: ResourceDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal': return <FileText className="h-6 w-6" />
      case 'financial': return <BookOpen className="h-6 w-6" />
      case 'healthcare': return <Users className="h-6 w-6" />
      case 'digital': return <ExternalLink className="h-6 w-6" />
      case 'family': return <Users className="h-6 w-6" />
      case 'business': return <BookOpen className="h-6 w-6" />
      case 'personal': return <Star className="h-6 w-6" />
      case 'emergency': return <Clock className="h-6 w-6" />
      default: return <FileText className="h-6 w-6" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      case 'document': return <FileText className="h-5 w-5" />
      case 'tool': return <Tag className="h-5 w-5" />
      case 'service': return <ExternalLink className="h-5 w-5" />
      case 'guide': return <BookOpen className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'legal': return 'Legal'
      case 'financial': return 'Financial'
      case 'healthcare': return 'Healthcare'
      case 'digital': return 'Digital'
      case 'family': return 'Family'
      case 'business': return 'Business'
      case 'personal': return 'Personal'
      case 'emergency': return 'Emergency'
      default: return 'Other'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'Article'
      case 'video': return 'Video'
      case 'document': return 'Document'
      case 'tool': return 'Tool'
      case 'service': return 'Service'
      case 'guide': return 'Guide'
      default: return 'Other'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getReadTimeDisplay = (minutes?: number) => {
    if (!minutes) return ''
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              {getCategoryIcon(resource.category)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{resource.title}</h1>
              <p className="text-muted-foreground">{getCategoryLabel(resource.category)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={onBookmark}>
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmark
          </Button>
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(resource.type)}
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <p className="text-sm">{getTypeLabel(resource.type)}</p>
                  </div>
                </div>

                {resource.author && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Author</p>
                      <p className="text-sm">{resource.author}</p>
                    </div>
                  </div>
                )}

                {resource.readTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Reading Time</p>
                      <p className="text-sm">{getReadTimeDisplay(resource.readTime)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Difficulty</p>
                    <Badge className={getDifficultyColor(resource.difficulty)}>
                      {resource.difficulty}
                    </Badge>
                  </div>
                </div>

                {resource.isRecommended && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant="default">Recommended</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tags</span>
                  <Badge variant="secondary">{resource.tags.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Created</span>
                  <span className="text-sm">{formatDate(resource.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm">{formatDate(resource.updatedAt)}</span>
                </div>
                {resource.lastAccessed && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Accessed</span>
                    <span className="text-sm">{formatDate(resource.lastAccessed)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm">Progress</span>
                  <Badge variant={resource.isCompleted ? "default" : "outline"}>
                    {resource.isCompleted ? 'Completed' : 'Not Started'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{resource.description}</p>
            </CardContent>
          </Card>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {resource.url ? (
            <Card>
              <CardHeader>
                <CardTitle>External Resource</CardTitle>
                <CardDescription>
                  This resource is available at an external URL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-mono break-all">{resource.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => window.open(resource.url, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Resource
                    </Button>
                    <Button variant="outline" onClick={onDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : resource.content ? (
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{resource.content}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Content Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This resource doesn't have any content available yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resource Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Resource ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{resource.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm">{getCategoryLabel(resource.category)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm">{getTypeLabel(resource.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Difficulty</p>
                  <p className="text-sm">{resource.difficulty}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timestamps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm">{formatDate(resource.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{formatDate(resource.updatedAt)}</p>
                  </div>
                </div>
                {resource.lastAccessed && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Accessed</p>
                      <p className="text-sm">{formatDate(resource.lastAccessed)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>
                Track your progress with this resource
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-6 w-6 ${resource.isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium">
                        {resource.isCompleted ? 'Completed' : 'Not Started'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {resource.isCompleted 
                          ? 'You have completed this resource' 
                          : 'Start learning to track your progress'
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={resource.isCompleted ? "outline" : "default"}
                    onClick={onMarkComplete}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {resource.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </Button>
                </div>

                {resource.lastAccessed && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Last accessed: {formatDate(resource.lastAccessed)}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Recommended Actions:</p>
                  <div className="space-y-2">
                    {!resource.isCompleted && (
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Complete the resource to mark it as done</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Share this resource with others who might benefit</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Bookmark for easy access later</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
