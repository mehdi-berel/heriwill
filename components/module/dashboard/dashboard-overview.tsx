"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Lock,
  Users,
  FolderOpen,
  ArrowRight,
  Power
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
]

export function DashboardOverview({ stats, userName }: DashboardOverviewProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Welcome back, {userName?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-text-secondary mt-1">
            Here&apos;s your digital legacy overview
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {/* Vaults */}
        <Card className="border" style={{ borderColor: '#232629' }}>
          <CardContent className="p-2 md:p-3">
            {/* Mobile: Vertical centered layout */}
            <div className="flex flex-col items-center text-center gap-1 md:hidden">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <div className="text-lg font-bold text-text-primary">
                {stats.totalAssets}
              </div>
              <div className="text-[10px] text-text-tertiary leading-tight">
                Active Vaults
              </div>
            </div>
            {/* Desktop: Horizontal layout */}
            <div className="hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-xl font-bold text-text-primary">
                  {stats.totalAssets}
                </div>
              </div>
              <div className="text-xs text-text-tertiary">
                Active Vaults
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="border" style={{ borderColor: '#232629' }}>
          <CardContent className="p-2 md:p-3">
            {/* Mobile: Vertical centered layout */}
            <div className="flex flex-col items-center text-center gap-1 md:hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="text-lg font-bold text-text-primary">
                {stats.totalAssets * 3}
              </div>
              <div className="text-[10px] text-text-tertiary leading-tight">
                Stored Items
              </div>
            </div>
            {/* Desktop: Horizontal layout */}
            <div className="hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-xl font-bold text-text-primary">
                  {stats.totalAssets * 3}
                </div>
              </div>
              <div className="text-xs text-text-tertiary">
                Stored Items
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heirs */}
        <Card className="border" style={{ borderColor: '#232629' }}>
          <CardContent className="p-2 md:p-3">
            {/* Mobile: Vertical centered layout */}
            <div className="flex flex-col items-center text-center gap-1 md:hidden">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-3.5 w-3.5 text-green-500" />
              </div>
              <div className="text-lg font-bold text-text-primary">
                {stats.totalBeneficiaries}
              </div>
              <div className="text-[10px] text-text-tertiary leading-tight">
                Designated Heirs
              </div>
            </div>
            {/* Desktop: Horizontal layout */}
            <div className="hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-xl font-bold text-text-primary">
                  {stats.totalBeneficiaries}
                </div>
              </div>
              <div className="text-xs text-text-tertiary">
                Designated Heirs
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.id} href={action.href}>
                <Card className="border hover:border-primary-500/50 transition-all hover:shadow-card-hover cursor-pointer group" style={{ borderColor: '#232629' }}>
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
    </div>
  )
}
