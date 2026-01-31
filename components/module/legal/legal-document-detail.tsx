"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Upload, 
  Lock, 
  Calendar, 
  Trash2,
  Edit,
  Shield,
  Gavel,
  User,
  Scale,
  FileCheck
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
  status: 'pending' | 'uploaded' | 'reviewed' | 'approved' | 'expired'
  priority: 'low' | 'medium' | 'high' | 'critical'
  instructions?: string
  created_at: string
  updated_at: string
  tags: string[]
}

interface LegalDocumentDetailProps {
  document: LegalDocument
  onEdit?: () => void
  onDelete?: () => void
  onUpload?: (file: File) => void
  onDownload?: () => void
}

export function LegalDocumentDetail({ document, onEdit, onDelete, onUpload, onDownload }: LegalDocumentDetailProps) {
  const renderDocumentIcon = (type: string) => {
    switch (type) {
      case 'will': return <FileText className="h-8 w-8 text-primary" />
      case 'trust': return <Shield className="h-8 w-8 text-primary" />
      case 'power_of_attorney': return <Gavel className="h-8 w-8 text-primary" />
      case 'healthcare_directive': return <User className="h-8 w-8 text-primary" />
      case 'life_insurance': return <Scale className="h-8 w-8 text-primary" />
      case 'deed': return <FileCheck className="h-8 w-8 text-primary" />
      default: return <FileText className="h-8 w-8 text-primary" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500'
      case 'uploaded': return 'bg-blue-500/20 text-blue-500'
      case 'reviewed': return 'bg-yellow-500/20 text-yellow-500'
      case 'pending': return 'bg-gray-500/20 text-gray-500'
      case 'expired': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {renderDocumentIcon(document.document_type)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{document.title}</h2>
              <Badge className={getStatusColor(document.status)}>
                {document.status}
              </Badge>
            </div>
            <p className="text-muted-foreground capitalize">
              {document.document_type.replace('_', ' ')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-500 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-gray-700">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{document.description}</p>
            </CardContent>
          </Card>

          {document.instructions && (
            <Card className="border-gray-700">
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{document.instructions}</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-gray-700">
            <CardHeader>
              <CardTitle>File Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.is_uploaded ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium truncate max-w-[200px]">
                        {document.file_url ? document.file_url.split('/').pop() : 'Document.pdf'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(document.file_size)} • Uploaded {formatDate(document.upload_date)}
                      </p>
                    </div>
                  </div>
                  {onDownload && (
                    <Button variant="outline" size="sm" onClick={onDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">No file uploaded yet</p>
                  {onUpload && (
                    <div className="relative inline-block">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) onUpload(file)
                        }}
                        accept=".pdf,.doc,.docx"
                      />
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-gray-700">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Priority</p>
                <Badge variant={document.priority === 'critical' ? 'destructive' : 'secondary'} className="capitalize">
                  {document.priority}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created On</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(document.created_at)}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(document.updated_at)}</span>
                </div>
              </div>

              {document.notarized && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notarization</p>
                  <div className="flex items-center gap-2 text-green-600">
                    <Lock className="h-4 w-4" />
                    <span>Notarized on {formatDate(document.notarized_date)}</span>
                  </div>
                </div>
              )}

              {document.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
