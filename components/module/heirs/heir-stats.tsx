"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserCheck, 
  Mail, 
  Phone, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Key,
  Activity,
  Eye
} from "lucide-react"

interface HeirStats {
  totalHeirs: number
  acceptedHeirs: number
  pendingHeirs: number
  rejectedHeirs: number
  expiredHeirs: number
  verifiedHeirs: number
  fullAccessHeirs: number
  partialAccessHeirs: number
  viewAccessHeirs: number
  recentlyActive: number
  averageResponseTime: number
  invitationsSentThisMonth: number
  verificationBreakdown: {
    email: number
    phone: number
    id_document: number
    other: number
  }
}

interface HeirStatsProps {
  stats: HeirStats
}

export function HeirStats({ stats }: HeirStatsProps) {
  const acceptanceRate = stats.totalHeirs > 0 ? (stats.acceptedHeirs / stats.totalHeirs) * 100 : 0
  const verificationRate = stats.acceptedHeirs > 0 ? (stats.verifiedHeirs / stats.acceptedHeirs) * 100 : 0

  const getAcceptanceLevel = (rate: number) => {
    if (rate >= 80) return { level: "Excellent", color: "text-green-600" }
    if (rate >= 60) return { level: "Good", color: "text-blue-600" }
    if (rate >= 40) return { level: "Fair", color: "text-yellow-600" }
    return { level: "Poor", color: "text-red-600" }
  }

  const getResponseTimeLevel = (hours: number) => {
    if (hours <= 24) return { level: "Fast", color: "text-green-600" }
    if (hours <= 72) return { level: "Normal", color: "text-blue-600" }
    if (hours <= 168) return { level: "Slow", color: "text-yellow-600" }
    return { level: "Very Slow", color: "text-red-600" }
  }

  const acceptanceLevel = getAcceptanceLevel(acceptanceRate)
  const responseTimeLevel = getResponseTimeLevel(stats.averageResponseTime)

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Heirs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHeirs}</div>
            <p className="text-xs text-muted-foreground">
              People invited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.acceptedHeirs}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(acceptanceRate)}% acceptance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingHeirs}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.verifiedHeirs}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(verificationRate)}% verification rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Invitation Status</span>
          </CardTitle>
          <CardDescription>
            Current status of all heir invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Accepted</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.acceptedHeirs} heirs
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {Math.round(acceptanceRate)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="font-medium">Pending</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.pendingHeirs} heirs
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {Math.round((stats.pendingHeirs / stats.totalHeirs) * 100)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="font-medium">Rejected</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.rejectedHeirs} heirs
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {Math.round((stats.rejectedHeirs / stats.totalHeirs) * 100)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">Expired</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.expiredHeirs} heirs
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {Math.round((stats.expiredHeirs / stats.totalHeirs) * 100)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Access Levels</span>
          </CardTitle>
          <CardDescription>
            Distribution of access permissions among accepted heirs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Key className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Full Access</div>
                  <div className="text-sm text-muted-foreground">
                    Complete control
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {stats.fullAccessHeirs}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Partial Access</div>
                  <div className="text-sm text-muted-foreground">
                    Limited vaults
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {stats.partialAccessHeirs}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">View Only</div>
                  <div className="text-sm text-muted-foreground">
                    Read-only
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {stats.viewAccessHeirs}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Methods and Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Verification Methods</span>
            </CardTitle>
            <CardDescription>
              How heirs verify their identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Email</span>
                </div>
                <Badge variant="secondary">{stats.verificationBreakdown.email}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Phone</span>
                </div>
                <Badge variant="secondary">{stats.verificationBreakdown.phone}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">ID Document</span>
                </div>
                <Badge variant="secondary">{stats.verificationBreakdown.id_document}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Other</span>
                </div>
                <Badge variant="secondary">{stats.verificationBreakdown.other}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Activity Metrics</span>
            </CardTitle>
            <CardDescription>
              Recent heir activity and response times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Recently Active</span>
                <span className="font-medium">{stats.recentlyActive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Response Time</span>
                <span className={`font-medium ${responseTimeLevel.color}`}>
                  {responseTimeLevel.level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Acceptance Rate</span>
                <span className={`font-medium ${acceptanceLevel.color}`}>
                  {acceptanceLevel.level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Invitations This Month</span>
                <span className="font-medium">{stats.invitationsSentThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
