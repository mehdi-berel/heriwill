"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Users, 
  FolderOpen, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Home,
  Lock,
  Heart,
  Globe,
  Mail,
  Phone,
  FileCheck,
  UserPlus,
  Upload,
  Bell,
  BookOpen,
  CreditCard,
  Building,
  Briefcase
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
  // App Setup Checklist
  const appSetupTasks: ChecklistItem[] = [
    {
      id: 'create_account',
      title: 'Create Your Account',
      description: 'Set up your HeriWill account with secure credentials',
      icon: <UserPlus className="h-5 w-5" />,
      isCompleted: true,
      href: '/profile',
      priority: 'high',
      category: 'app_setup'
    },
    {
      id: 'add_heirs',
      title: 'Add Heirs',
      description: 'Designate trusted people to inherit your digital assets',
      icon: <Users className="h-5 w-5" />,
      isCompleted: stats.totalBeneficiaries > 0,
      href: '/heirs',
      priority: 'high',
      category: 'app_setup'
    },
    {
      id: 'create_vaults',
      title: 'Create Vaults',
      description: 'Organize your digital assets into secure vaults',
      icon: <Lock className="h-5 w-5" />,
      isCompleted: false,
      href: '/vaults',
      priority: 'high',
      category: 'app_setup'
    },
    {
      id: 'upload_documents',
      title: 'Upload Important Documents',
      description: 'Store passwords, files, and sensitive information',
      icon: <Upload className="h-5 w-5" />,
      isCompleted: stats.totalAssets > 0,
      href: '/vaults',
      priority: 'high',
      category: 'app_setup'
    },
    {
      id: 'setup_trigger',
      title: 'Configure Global Trigger',
      description: 'Set up when and how your assets will be released',
      icon: <Bell className="h-5 w-5" />,
      isCompleted: false,
      href: '/signoff',
      priority: 'high',
      category: 'app_setup'
    },
    {
      id: 'enable_2fa',
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      icon: <Shield className="h-5 w-5" />,
      isCompleted: stats.securityScore >= 80,
      href: '/security',
      priority: 'medium',
      category: 'app_setup'
    },
    {
      id: 'verify_contacts',
      title: 'Verify Heir Contact Information',
      description: 'Ensure all heir contact details are accurate',
      icon: <Mail className="h-5 w-5" />,
      isCompleted: false,
      href: '/heirs',
      priority: 'medium',
      category: 'app_setup'
    },
    {
      id: 'test_notifications',
      title: 'Test Notification System',
      description: 'Verify heirs receive invitation notifications',
      icon: <Phone className="h-5 w-5" />,
      isCompleted: false,
      href: '/heirs',
      priority: 'low',
      category: 'app_setup'
    }
  ]

  // Pre-Death Preparation Checklist
  const preDeathTasks: ChecklistItem[] = [
    {
      id: 'create_will',
      title: 'Create or Update Your Will',
      description: 'Legal document outlining asset distribution',
      icon: <FileText className="h-5 w-5" />,
      isCompleted: false,
      href: '/Legal',
      priority: 'high',
      category: 'pre_death'
    },
    {
      id: 'list_assets',
      title: 'List All Physical Assets',
      description: 'Property, vehicles, jewelry, and valuables',
      icon: <Home className="h-5 w-5" />,
      isCompleted: false,
      href: '/assets',
      priority: 'high',
      category: 'pre_death'
    },
    {
      id: 'financial_accounts',
      title: 'Document Financial Accounts',
      description: 'Bank accounts, investments, retirement funds',
      icon: <CreditCard className="h-5 w-5" />,
      isCompleted: false,
      href: '/vaults',
      priority: 'high',
      category: 'pre_death'
    },
    {
      id: 'insurance_policies',
      title: 'Organize Insurance Policies',
      description: 'Life, health, property insurance documents',
      icon: <Shield className="h-5 w-5" />,
      isCompleted: false,
      href: '/vaults',
      priority: 'high',
      category: 'pre_death'
    },
    {
      id: 'debts_obligations',
      title: 'List Debts and Obligations',
      description: 'Mortgages, loans, credit cards, subscriptions',
      icon: <FileCheck className="h-5 w-5" />,
      isCompleted: false,
      href: '/vaults',
      priority: 'high',
      category: 'pre_death'
    },
    {
      id: 'business_interests',
      title: 'Document Business Interests',
      description: 'Company ownership, partnerships, contracts',
      icon: <Briefcase className="h-5 w-5" />,
      isCompleted: false,
      href: '/vaults',
      priority: 'medium',
      category: 'pre_death'
    },
    {
      id: 'medical_directives',
      title: 'Prepare Medical Directives',
      description: 'Living will, healthcare proxy, DNR orders',
      icon: <Heart className="h-5 w-5" />,
      isCompleted: false,
      href: '/Legal',
      priority: 'high',
      category: 'pre_death'
    },
    {
      id: 'funeral_wishes',
      title: 'Document Funeral Wishes',
      description: 'Burial preferences, ceremony details, obituary',
      icon: <BookOpen className="h-5 w-5" />,
      isCompleted: false,
      href: '/vaults',
      priority: 'medium',
      category: 'pre_death'
    },
    {
      id: 'power_of_attorney',
      title: 'Assign Power of Attorney',
      description: 'Legal authority for financial and medical decisions',
      icon: <FileText className="h-5 w-5" />,
      isCompleted: false,
      href: '/Legal',
      priority: 'high',
      category: 'pre_death'
    },
    {
      id: 'digital_legacy',
      title: 'Plan Your Digital Legacy',
      description: 'Social media, email, online accounts management',
      icon: <Globe className="h-5 w-5" />,
      isCompleted: stats.totalAssets > 0,
      href: '/vaults',
      priority: 'medium',
      category: 'pre_death'
    },
    {
      id: 'tax_documents',
      title: 'Organize Tax Documents',
      description: 'Recent returns, property records, receipts',
      icon: <Building className="h-5 w-5" />,
      isCompleted: false,
      href: '/vaults',
      priority: 'medium',
      category: 'pre_death'
    },
    {
      id: 'final_messages',
      title: 'Write Final Messages',
      description: 'Personal letters to loved ones',
      icon: <Mail className="h-5 w-5" />,
      isCompleted: false,
      href: '/vaults',
      priority: 'low',
      category: 'pre_death'
    }
  ]

  const allTasks = [...appSetupTasks, ...preDeathTasks]
  const completedTasks = allTasks.filter(t => t.isCompleted).length
  const totalTasks = allTasks.length
  const progressPercentage = (completedTasks / totalTasks) * 100

  const appSetupCompleted = appSetupTasks.filter(t => t.isCompleted).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Your Preparation Checklist</h1>
        <p className="text-muted-foreground">
          Welcome back, {userName || "User"}. Complete these essential tasks to secure your digital legacy.
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {completedTasks} of {totalTasks} tasks completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Just Started</span>
            <span className="font-bold">{Math.round(progressPercentage)}% Complete</span>
            <span>Fully Prepared</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border">
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalAssets}</div>
            <div className="text-sm text-muted-foreground font-medium text-center">Vaults</div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalAssets}</div>
            <div className="text-sm text-muted-foreground font-medium text-center">Items</div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalBeneficiaries}</div>
            <div className="text-sm text-muted-foreground font-medium text-center">Heirs</div>
          </CardContent>
        </Card>
      </div>

      {/* App Setup Checklist */}
      <Card className="border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">App Setup Tasks</CardTitle>
              <CardDescription>
                {appSetupCompleted} of {appSetupTasks.length} tasks completed
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {Math.round((appSetupCompleted / appSetupTasks.length) * 100)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appSetupTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center p-4 bg-background-card border border-border rounded-xl hover:border-primary/50 transition-all cursor-pointer"
              >
                {/* Bullet Point */}
                <div className="mr-4 flex-shrink-0">
                  {task.isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 bg-primary/20">
                  <div className="text-primary">{task.icon}</div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${
                      task.isCompleted ? 'line-through text-muted-foreground' : ''
                    }`}>{task.title}</h4>
                    {task.priority === 'high' && !task.isCompleted && (
                      <Badge variant="destructive" className="text-xs">High Priority</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips & Resources */}
      <Card className="border bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Important Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <p>Keep your vault passwords secure and share them only with trusted heirs</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <p>Review and update your information regularly, especially after major life events</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <p>Inform your heirs about HeriWill and ensure they know how to access their inheritance</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <p>Store physical copies of critical documents in a safe location</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
