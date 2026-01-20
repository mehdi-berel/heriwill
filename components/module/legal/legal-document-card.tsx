"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Eye,
  Upload,
  Calendar,
  User,
  Scale,
  Gavel,
  FileCheck,
  Trash2,
  MoreVertical,
  Link,
  ExternalLink
} from "lucide-react"

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

interface LegalDocumentCardProps {
  document: LegalDocument
  onView: (document: LegalDocument) => void
  onEdit: (document: LegalDocument) => void
  onDelete: (documentId: string) => void
  onUpload: (documentId: string, file: File) => void
  onDownload: (documentId: string) => void
  onNotarize: (documentId: string) => void
}

export function LegalDocumentCard({ 
  document, 
  onView, 
  onEdit, 
  onDelete, 
  onUpload, 
  onDownload, 
  onNotarize 
}: LegalDocumentCardProps) {
  const [showActions, setShowActions] = useState(false)

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'will': return <FileText className="h-5 w-5" />
      case 'trust': return <Shield className="h-5 w-5" />
      case 'power_of_attorney': return <Gavel className="h-5 w-5" />
      case 'healthcare_directive': return <User className="h-5 w-5" />
      case 'life_insurance': return <Scale className="h-5 w-5" />
      case 'deed': return <FileCheck className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'will': return 'bg-blue-100 text-blue-800'
      case 'trust': return 'bg-purple-100 text-purple-800'
      case 'power_of_attorney': return 'bg-green-100 text-green-800'
      case 'healthcare_directive': return 'bg-red-100 text-red-800'
      case 'life_insurance': return 'bg-orange-100 text-orange-800'
      case 'deed': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'uploaded': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'reviewed': return <Eye className="h-4 w-4" />
      case 'uploaded': return <Upload className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'expired': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = () => {
    const steps = ['pending', 'uploaded', 'reviewed', 'approved']
    const currentIndex = steps.indexOf(document.status)
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0
  }

  const isExpired = () => {
    return document.expiry_date && new Date(document.expiry_date) < new Date()
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getDocumentColor(document.document_type)}`}>
              {getDocumentIcon(document.document_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg truncate">{document.title}</CardTitle>
                {document.is_required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                {isExpired() && (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                )}
              </div>
              <CardDescription className="truncate">{document.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={() => onView(document)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(document)}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(document.status)}>
                {getStatusIcon(document.status)}
                <span className="ml-1 capitalize">{document.status}</span>
              </Badge>
              <Badge className={getPriorityColor(document.priority)}>
                {document.priority}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {document.notarized && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Notarized</span>
                </div>
              )}
              {document.file_url && (
                <div className="flex items-center space-x-1">
                  <FileCheck className="h-3 w-3 text-blue-600" />
                  <span>{formatFileSize(document.file_size)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Document Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Tags */}
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <div className="flex items-center space-x-2">
                {getDocumentIcon(document.document_type)}
                <span className="capitalize">{document.document_type.replace('_', ' ')}</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(document.created_at)}</span>
            </div>
            {document.expiry_date && (
              <div>
                <span className="text-muted-foreground">Expires:</span>
                <span className={isExpired() ? 'text-red-600' : ''}>
                  {formatDate(document.expiry_date)}
                </span>
              </div>
            )}
            {document.notarized_date && (
              <div>
                <span className="text-muted-foreground">Notarized:</span>
                <span>{formatDate(document.notarized_date)}</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          {document.instructions && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{document.instructions}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!document.file_url && (
              <div className="relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onUpload(document.id, file)
                  }}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            )}
            {document.file_url && (
              <Button size="sm" variant="outline" onClick={() => onDownload(document.id)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {!document.notarized && document.status === 'approved' && (
              <Button size="sm" variant="outline" onClick={() => onNotarize(document.id)}>
                <Gavel className="h-4 w-4 mr-2" />
                Notarize
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onDelete(document.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
