"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  FileText, 
  Video, 
  Download, 
  Eye, 
  Calendar,
  Clock,
  Users,
  Star,
  ExternalLink,
  Tag,
  CheckCircle
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

interface ResourceCardProps {
  resource: Resource
  onView: (resource: Resource) => void
  onMarkComplete?: (resource: Resource) => void
  onDownload?: (resource: Resource) => void
  showActions?: boolean
}

export function ResourceCard({ 
  resource, 
  onView, 
  onMarkComplete, 
  onDownload, 
  showActions = true 
}: ResourceCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal': return <FileText className="h-4 w-4" />
      case 'financial': return <BookOpen className="h-4 w-4" />
      case 'healthcare': return <Users className="h-4 w-4" />
      case 'digital': return <ExternalLink className="h-4 w-4" />
      case 'family': return <Users className="h-4 w-4" />
      case 'business': return <BookOpen className="h-4 w-4" />
      case 'personal': return <Star className="h-4 w-4" />
      case 'emergency': return <Clock className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'tool': return <Tag className="h-4 w-4" />
      case 'service': return <ExternalLink className="h-4 w-4" />
      case 'guide': return <BookOpen className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'legal': return 'bg-blue-100 text-blue-800'
      case 'financial': return 'bg-green-100 text-green-800'
      case 'healthcare': return 'bg-red-100 text-red-800'
      case 'digital': return 'bg-purple-100 text-purple-800'
      case 'family': return 'bg-yellow-100 text-yellow-800'
      case 'business': return 'bg-indigo-100 text-indigo-800'
      case 'personal': return 'bg-pink-100 text-pink-800'
      case 'emergency': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getReadTimeDisplay = (minutes?: number) => {
    if (!minutes) return ''
    if (minutes < 60) return `${minutes} min read`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m read`
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}>
              {getCategoryIcon(resource.category)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {resource.description}
              </CardDescription>
            </div>
          </div>
          {resource.isRecommended && (
            <Badge variant="default" className="ml-2">
              <Star className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Metadata */}
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            {getTypeIcon(resource.type)}
            <span className="capitalize">{resource.type}</span>
          </div>
          {resource.author && (
            <span>By {resource.author}</span>
          )}
          {resource.readTime && (
            <span>{getReadTimeDisplay(resource.readTime)}</span>
          )}
        </div>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Difficulty */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Difficulty:</span>
          <Badge className={`text-xs ${getDifficultyColor(resource.difficulty)}`}>
            {resource.difficulty}
          </Badge>
        </div>

        {/* Progress/Status */}
        {resource.isCompleted !== undefined && (
          <div className="flex items-center space-x-2">
            <CheckCircle className={`h-4 w-4 ${resource.isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="text-sm">
              {resource.isCompleted ? 'Completed' : 'Not Started'}
            </span>
          </div>
        )}

        {/* Last Accessed */}
        {resource.lastAccessed && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Last accessed: {formatDate(resource.lastAccessed)}</span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(resource)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {resource.url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(resource.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(resource)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onMarkComplete && (
              <Button
                variant={resource.isCompleted ? "outline" : "default"}
                size="sm"
                onClick={() => onMarkComplete(resource)}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
