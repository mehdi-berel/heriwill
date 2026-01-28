"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  BookOpen, 
  FileText, 
  Video, 
  Users,
  Star,
  Clock,
  Calendar,
  CheckCircle,
  TrendingUp,
  Download,
  ExternalLink,
  Eye,
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

interface ResourceListProps {
  resources: Resource[]
  onResourceSelect: (resource: Resource) => void
  onResourceComplete: (resource: Resource) => void
  onResourceDownload: (resource: Resource) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function ResourceList({ 
  resources, 
  onResourceSelect, 
  onResourceComplete, 
  onResourceDownload, 
  searchTerm, 
  onSearchChange 
}: ResourceListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'difficulty' | 'completed'>('date')
  const [showCompletedOnly, setShowCompletedOnly] = useState(false)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal': return <FileText className="h-5 w-5" />
      case 'financial': return <BookOpen className="h-5 w-5" />
      case 'healthcare': return <Users className="h-5 w-5" />
      case 'digital': return <ExternalLink className="h-5 w-5" />
      case 'family': return <Users className="h-5 w-5" />
      case 'business': return <BookOpen className="h-5 w-5" />
      case 'personal': return <Star className="h-5 w-5" />
      case 'emergency': return <Clock className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
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

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner'
      case 'intermediate': return 'Intermediate'
      case 'advanced': return 'Advanced'
      default: return difficulty
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesType = selectedType === 'all' || resource.type === selectedType
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty
    const matchesCompleted = !showCompletedOnly || resource.isCompleted === true
    
    return matchesSearch && matchesCategory && matchesType && matchesDifficulty && matchesCompleted
  })

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
      case 'completed':
        return (b.isCompleted ? 1 : 0) - (a.isCompleted ? 1 : 0)
      default:
        return 0
    }
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'legal', label: 'Legal' },
    { value: 'financial', label: 'Financial' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'digital', label: 'Digital' },
    { value: 'family', label: 'Family' },
    { value: 'business', label: 'Business' },
    { value: 'personal', label: 'Personal' },
    { value: 'emergency', label: 'Emergency' }
  ]

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'article', label: 'Articles' },
    { value: 'video', label: 'Videos' },
    { value: 'document', label: 'Documents' },
    { value: 'tool', label: 'Tools' },
    { value: 'service', label: 'Services' },
    { value: 'guide', label: 'Guides' }
  ]

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const completedCount = resources.filter(r => r.isCompleted).length
  const recommendedCount = resources.filter(r => r.isRecommended).length
  const totalCount = resources.length

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            {types.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'difficulty' | 'completed')}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="difficulty">Sort by Difficulty</option>
            <option value="completed">Sort by Progress</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recommended</p>
                <p className="text-2xl font-bold">{recommendedCount}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Only Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="completed-only"
          checked={showCompletedOnly}
          onChange={(e) => setShowCompletedOnly(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="completed-only" className="text-sm">
          Show completed only
        </label>
      </div>

      {/* Resource Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedResources.map(resource => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getCategoryIcon(resource.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {resource.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {resource.isRecommended && (
                    <Badge variant="default">
                      <Star className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                  {resource.isCompleted && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Metadata */}
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  {getTypeIcon(resource.type)}
                  <span className="capitalize">{getTypeLabel(resource.type)}</span>
                </div>
                {resource.author && (
                  <span>By {resource.author}</span>
                )}
                {resource.readTime && (
                  <span>{resource.readTime} min read</span>
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
                <span className="text-xs text-muted-foreground">Level:</span>
                <Badge variant="outline" className="text-xs">
                  {getDifficultyLabel(resource.difficulty)}
                </Badge>
              </div>

              {/* Last Accessed */}
              {resource.lastAccessed && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Last accessed: {formatDate(resource.lastAccessed)}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResourceSelect(resource)}
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
                {onResourceDownload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResourceDownload(resource)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                {onResourceComplete && (
                  <Button
                    variant={resource.isCompleted ? "outline" : "default"}
                    size="sm"
                    onClick={() => onResourceComplete(resource)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedResources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' || selectedType !== 'all' || selectedDifficulty !== 'all'
              ? 'No resources found matching your criteria.'
              : 'No resources available yet.'
            }
          </div>
          {!searchTerm && selectedCategory === 'all' && selectedType === 'all' && selectedDifficulty === 'all' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Resources to help you prepare your afterlife and testament will appear here.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Popular categories:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">Legal Guides</Badge>
                  <Badge variant="outline">Financial Planning</Badge>
                  <Badge variant="outline">Healthcare Directives</Badge>
                  <Badge variant="outline">Digital Legacy</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
