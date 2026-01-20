"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Users, 
  FolderOpen, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Circle,
  ArrowRight,
  Home,
  Settings,
  Lock,
  Archive,
  Heart,
  Globe,
  Key
} from "lucide-react"

interface DashboardStats {
  totalAssets: number
  totalBeneficiaries: number
  completedSections: number
  totalSections: number
  securityScore: number
  pendingTasks: number
}

interface DashboardOverviewProps {
  stats: DashboardStats
  userName?: string
}

interface DashboardSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  isCompleted: boolean
  href: string
  count?: number
}

export function DashboardOverview({ stats, userName }: DashboardOverviewProps) {
  const progressPercentage = stats.totalSections > 0 
    ? (stats.completedSections / stats.totalSections) * 100 
    : 0

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "text-green-600" }
    if (score >= 60) return { level: "Good", color: "text-yellow-600" }
    return { level: "Needs Attention", color: "text-red-600" }
  }

  const securityLevel = getSecurityLevel(stats.securityScore)

  const dashboardSections: DashboardSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Dashboard and statistics',
      icon: <Home className="h-5 w-5" />,
      isCompleted: true,
      href: '/dashboard',
      count: stats.totalAssets + stats.totalBeneficiaries
    },
    {
      id: 'inheritance',
      title: 'Inheritance Plan',
      description: 'Complete inheritance preparation',
      icon: <FileText className="h-5 w-5" />,
      isCompleted: stats.completedSections >= 3,
      href: '/dashboard/inheritance',
      count: stats.completedSections
    },
    {
      id: 'assets',
      title: 'Digital Assets',
      description: 'Manage your digital assets',
      icon: <FolderOpen className="h-5 w-5" />,
      isCompleted: stats.totalAssets > 0,
      href: '/dashboard/assets',
      count: stats.totalAssets
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiaries',
      description: 'Manage designated beneficiaries',
      icon: <Users className="h-5 w-5" />,
      isCompleted: stats.totalBeneficiaries > 0,
      href: '/dashboard/beneficiaries',
      count: stats.totalBeneficiaries
    },
    {
      id: 'vaults',
      title: 'Secure Vaults',
      description: 'Encrypted document storage',
      icon: <Lock className="h-5 w-5" />,
      isCompleted: false,
      href: '/dashboard/vaults'
    },
    {
      id: 'resources',
      title: 'Resources',
      description: 'Educational materials and guides',
      icon: <Globe className="h-5 w-5" />,
      isCompleted: false,
      href: '/dashboard/resources'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Security settings and authentication',
      icon: <Shield className="h-5 w-5" />,
      isCompleted: stats.securityScore >= 80,
      href: '/dashboard/security'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Account and application settings',
      icon: <Settings className="h-5 w-5" />,
      isCompleted: false,
      href: '/dashboard/settings'
    }
  ]

  const completedSections = dashboardSections.filter(s => s.isCompleted).length
  const totalSections = dashboardSections.length

  const quickActions = [
    {
      title: "Add Beneficiary",
      icon: Users,
      href: "/dashboard/beneficiaries"
    },
    {
      title: "Upload Document", 
      icon: FileText,
      href: "/dashboard/vaults"
    },
    {
      title: "Security Check",
      icon: Shield,
      href: "/dashboard/security"
    },
    {
      title: "View Resources",
      icon: Globe,
      href: "/dashboard/resources"
    }
  ]

  const recentActivity = [
    {
      icon: CheckCircle,
      iconColor: "text-green-600",
      title: "Dashboard overview completed",
      description: "Your dashboard is set up and ready",
      time: "Just now",
      badge: "Completed"
    },
    {
      icon: FileText,
      iconColor: "text-blue-600", 
      title: "Inheritance plan started",
      description: "Begin your inheritance preparation journey",
      time: "2 days ago",
      badge: "In Progress"
    },
    {
      icon: Users,
      iconColor: "text-purple-600",
      title: "Beneficiaries added",
      description: "Designated heirs for your assets",
      time: "5 days ago", 
      badge: "Updated"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userName || "User"}. Manage your inheritance preparation from here.
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {completedSections} of {totalSections} sections completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Getting Started</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
            <span>Almost There</span>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardSections.map((section) => (
          <Card key={section.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className={section.isCompleted ? "text-green-600" : "text-gray-400"}>
                  {section.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                {section.isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  {section.count !== undefined && (
                    <Badge variant={section.isCompleted ? "default" : "secondary"}>
                      {section.count} {section.count === 1 ? 'item' : 'items'}
                    </Badge>
                  )}
                </div>
                <Button size="sm" variant="outline">
                  {section.isCompleted ? "View" : "Start"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digital Assets</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              Accounts and files tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBeneficiaries}</div>
            <p className="text-xs text-muted-foreground">
              People designated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedSections} of {stats.totalSections} sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${securityLevel.color}`}>
              {stats.securityScore}
            </div>
            <p className="text-xs text-muted-foreground">
              {securityLevel.level} security
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      {stats.pendingTasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span>Pending Tasks</span>
              <Badge variant="secondary">{stats.pendingTasks}</Badge>
            </CardTitle>
            <CardDescription>
              Tasks that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Complete legal documents section</span>
                </div>
                <Button size="sm" variant="outline">
                  Complete
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Verify beneficiary contact information</span>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and resources for your inheritance plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Button key={index} variant="outline" className="h-20 flex-col">
                <action.icon className="h-6 w-6 mb-2" />
                <span>{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest inheritance plan updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">{activity.badge}</Badge>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
