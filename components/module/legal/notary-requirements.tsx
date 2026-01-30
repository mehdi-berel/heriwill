"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  ExternalLink,
  Info,
  Gavel,
  Eye,
  Shield
} from "lucide-react"

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

interface NotaryRequirementsProps {
  requirements: NotaryRequirement[]
  onRequirementComplete: (requirementId: string) => void
  onRequirementView: (requirement: NotaryRequirement) => void
}

export function NotaryRequirements({ requirements, onRequirementComplete, onRequirementView }: NotaryRequirementsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'verified': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'verified': return <Shield className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'expired': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getVerificationIcon = (method: string) => {
    switch (method) {
      case 'in_person': return <User className="h-4 w-4" />
      case 'online': return <ExternalLink className="h-4 w-4" />
      case 'mobile': return <Phone className="h-4 w-4" />
      default: return <Phone className="h-4 w-4" />
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gavel className="h-5 w-5" />
            <span>Notary Requirements</span>
          </CardTitle>
          <CardDescription>
            Legal documents that require notarization for validity and compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requirements.map((requirement) => (
              <Card key={requirement.id} className="border-gray-700 border-l-4 border-l-transparent">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        requirement.is_required ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{requirement.title}</CardTitle>
                        <CardDescription>{requirement.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(requirement.status)}>
                        {getStatusIcon(requirement.status)}
                        <span className="ml-1 capitalize">{requirement.status}</span>
                      </Badge>
                      {requirement.is_required && (
                        <Badge variant="destructive">Required</Badge>
                      )}
                      {isOverdue(requirement.due_date) && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Document Types */}
                  <div>
                    <div className="text-sm font-medium mb-2">Applies to:</div>
                    <div className="flex flex-wrap gap-2">
                      {requirement.document_types.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Status and Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(requirement.status)}
                        <span className="capitalize">{requirement.status}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due Date:</span>
                      <div className="mt-1">
                        <span className={isOverdue(requirement.due_date) ? 'text-red-600' : ''}>
                          {formatDate(requirement.due_date)}
                        </span>
                      </div>
                    </div>
                    {requirement.completed_date && (
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <div className="mt-1">
                          <span>{formatDate(requirement.completed_date)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verification Method */}
                  {requirement.verification_method && (
                    <div>
                      <span className="text-sm font-medium mb-2">Verification Method:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {getVerificationIcon(requirement.verification_method)}
                        <span className="capitalize">{requirement.verification_method}</span>
                      </div>
                    </div>
                  )}

                  {/* Notary Details */}
                  {requirement.notary_details && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Notary:</span>
                          <span>{requirement.notary_details.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Location:</span>
                          <span>{requirement.notary_details.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Contact:</span>
                          <span>{requirement.notary_details.contact}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Commission:</span>
                          <span>{requirement.notary_details.commission_number}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {requirement.instructions && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Instructions:</span>
                      </div>
                      <p className="text-sm text-blue-700">{requirement.instructions}</p>
                    </div>
                  )}

                  {/* Resources */}
                  {requirement.resources && requirement.resources.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Resources:</div>
                      <div className="space-y-2">
                        {requirement.resources.map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                            <div>
                              <div className="font-medium">{resource.title}</div>
                              <div className="text-sm text-muted-foreground">{resource.description}</div>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              <span className="ml-2">View</span>
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant={requirement.status === 'completed' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => onRequirementComplete(requirement.id)}
                      disabled={requirement.status === 'verified'}
                    >
                      {requirement.status === 'completed' ? 'Mark as Verified' : 'Mark Complete'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onRequirementView(requirement)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="border-gray-700">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{requirements.length}</div>
              <p className="text-sm text-muted-foreground">Total Requirements</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {requirements.filter(r => r.is_required).length}
              </div>
              <p className="text-sm text-muted-foreground">Required</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {requirements.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {requirements.filter(r => r.status === 'verified').length}
              </div>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
