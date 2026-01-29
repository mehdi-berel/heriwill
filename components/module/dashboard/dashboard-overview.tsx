"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { 
  Lock,
  Users,
  FolderOpen,
  Shield,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Power,
  FileText,
  Bell
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

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
  badge?: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'vaults',
    title: 'Manage Vaults',
    description: 'Organize your digital assets',
    icon: Lock,
    href: '/vaults',
    color: '#8B5CF6',
  },
  {
    id: 'heirs',
    title: 'Add Heirs',
    description: 'Designate beneficiaries',
    icon: Users,
    href: '/heirs',
    color: '#3B82F6',
  },
  {
    id: 'sign-off',
    title: 'Sign-Off Plan',
    description: 'Configure death detection',
    icon: Power,
    href: '/sign-off',
    color: '#EF4444',
    badge: 'Important',
  },
  {
    id: 'legal',
    title: 'Legal Documents',
    description: 'Store important papers',
    icon: FileText,
    href: '/Legal',
    color: '#F59E0B',
  },
]

interface ChecklistItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  isCompleted: boolean
  href: string
  priority: 'high' | 'medium' | 'low'
  category: 'app_setup' | 'pre_death'
}

export function DashboardOverview({ stats, userName }: DashboardOverviewProps) {
  const completionPercentage = Math.round((stats.completedSections / stats.totalSections) * 100)
  const isSetupComplete = completionPercentage >= 80

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Welcome back, {userName?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-text-secondary mt-1">
            Here's your digital legacy overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary-400" />
        </div>
      </div>

      {/* Setup Progress Banner */}
      {!isSetupComplete && (
        <Card className="bg-gradient-to-r from-primary-600/10 to-primary-400/10 border-primary-500/20">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                Complete Your Setup
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                You're {completionPercentage}% done! Complete these steps to fully secure your digital legacy.
              </p>
              <Progress value={completionPercentage} className="mb-2 h-2" />
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span>{stats.completedSections} of {stats.totalSections} sections completed</span>
                <span>{stats.pendingTasks} tasks remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Vaults */}
        <Link href="/vaults">
          <Card className="border border-border hover:border-primary-500/50 transition-all hover:shadow-card-hover cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lock className="h-6 w-6 text-purple-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-3xl font-bold text-text-primary mb-1">
                {stats.totalAssets}
              </div>
              <div className="text-sm text-text-secondary font-medium">
                Active Vaults
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Items */}
        <Link href="/vaults">
          <Card className="border border-border hover:border-primary-500/50 transition-all hover:shadow-card-hover cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderOpen className="h-6 w-6 text-blue-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-3xl font-bold text-text-primary mb-1">
                {stats.totalAssets * 3}
              </div>
              <div className="text-sm text-text-secondary font-medium">
                Stored Items
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Heirs */}
        <Link href="/heirs">
          <Card className="border border-border hover:border-primary-500/50 transition-all hover:shadow-card-hover cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-3xl font-bold text-text-primary mb-1">
                {stats.totalBeneficiaries}
              </div>
              <div className="text-sm text-text-secondary font-medium">
                Designated Heirs
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Security Score */}
        <Card className="border border-border hover:border-primary-500/50 transition-all hover:shadow-card-hover cursor-pointer group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-amber-500" />
              </div>
              <Badge 
                variant={stats.securityScore >= 80 ? "default" : "secondary"}
                className="text-xs"
              >
                {stats.securityScore >= 80 ? 'Good' : 'Fair'}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">
              {stats.securityScore}%
            </div>
            <div className="text-sm text-text-secondary font-medium">
              Security Score
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.id} href={action.href}>
                <Card className="border border-border hover:border-primary-500/50 transition-all hover:shadow-card-hover cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{ 
                          backgroundColor: `${action.color}20`,
                          border: `1.5px solid ${action.color}40`
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-text-primary">
                            {action.title}
                          </h3>
                          {action.badge && (
                            <Badge variant="destructive" className="text-xs h-5">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary">
                          {action.description}
                        </p>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Important Reminders */}
      <Card className="bg-blue-600/5 border-blue-600/20">
        <CardContent className="flex items-start gap-3 p-5">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary mb-2">
              Important Reminders
            </h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-success mt-0.5 flex-shrink-0" />
                <p>Keep your vault passwords secure and share them only with trusted heirs</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-success mt-0.5 flex-shrink-0" />
                <p>Review and update your information regularly, especially after major life events</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-success mt-0.5 flex-shrink-0" />
                <p>Inform your heirs about Heriwill and ensure they know how to access their inheritance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
