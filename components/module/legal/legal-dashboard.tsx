"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Shield, 
  Scale,
  Gavel,
  User,
  FileCheck,
  Upload,
  Download
} from "lucide-react"

interface LegalStats {
  totalDocuments: number
  requiredDocuments: number
  uploadedDocuments: number
  approvedDocuments: number
  notarizedDocuments: number
  expiredDocuments: number
  pendingNotarization: number
  overdueDocuments: number
  documentsByType: {
    will: number
    trust: number
    power_of_attorney: number
    healthcare_directive: number
    life_insurance: number
    deed: number
    other: number
  }
  complianceScore: number
  nextDueDate?: string
  recentActivity: {
    uploads: number
    approvals: number
    notarizations: number
  }
}

interface LegalDashboardProps {
  stats: LegalStats
  onUploadDocument: () => void
  onViewAllDocuments: () => void
  onViewNotaryRequirements: () => void
}

export function LegalDashboard({ 
  stats, 
  onUploadDocument, 
  onViewAllDocuments, 
  onViewNotaryRequirements 
}: LegalDashboardProps) {
  const getComplianceLevel = (score: number) => {
    if (score >= 90) return { level: "Excellent", color: "text-green-600" }
    if (score >= 75) return { level: "Good", color: "text-blue-600" }
    if (score >= 60) return { level: "Fair", color: "text-yellow-600" }
    return { level: "Poor", color: "text-red-600" }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'will': return <FileText className="h-4 w-4" />
      case 'trust': return <Shield className="h-4 w-4" />
      case 'power_of_attorney': return <Gavel className="h-4 w-4" />
      case 'healthcare_directive': return <User className="h-4 w-4" />
      case 'life_insurance': return <Scale className="h-4 w-4" />
      case 'deed': return <FileCheck className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
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

  const complianceLevel = getComplianceLevel(stats.complianceScore)
  const uploadProgress = stats.totalDocuments > 0 ? (stats.uploadedDocuments / stats.totalDocuments) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.requiredDocuments} required
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploaded</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.uploadedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(uploadProgress)}% complete
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notarized</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.notarizedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingNotarization} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${complianceLevel.color}`}>
              {stats.complianceScore}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceLevel.level} compliance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Document Types */}
      <Card className="border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documents by Type</span>
          </CardTitle>
          <CardDescription>
            Distribution of your legal documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats.documentsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getDocumentColor(type)}`}>
                    {getDocumentIcon(type)}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{type.replace('_', ' ')}</div>
                    <div className="text-sm text-muted-foreground">
                      {count} document{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing your legal documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col" onClick={onUploadDocument}>
              <Upload className="h-6 w-6 mb-2" />
              <span>Upload Document</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={onViewAllDocuments}>
              <FileText className="h-6 w-6 mb-2" />
              <span>View All Documents</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={onViewNotaryRequirements}>
              <Gavel className="h-6 w-6 mb-2" />
              <span>Notary Requirements</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Download Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
