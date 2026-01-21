"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  FileText, 
  Users, 
  Shield, 
  FolderOpen, 
  Settings, 
  HelpCircle,
  LogOut,
  BookOpen,
  Archive,
  UserCheck,
  Heart
} from "lucide-react"

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    current: false,
  },
  {
    name: "Vaults",
    href: "/vaults",
    icon: Users,
    current: false,
  },
  {
    name: "Heirs",
    href: "/heirs",
    icon: UserCheck,
    current: false,
  },
  {
    name: "Assets",
    href: "/assets",
    icon: FolderOpen,
    current: false,
  },
  {
    name: "Legal",
    href: "/Legal",
    icon: Archive,
    current: false,
  },
  {
    name: "Legacy",
    href: "/legacy",
    icon: Heart,
    current: false,
  },
    {
    name: "Inheritance",
    href: "/inheritance",
    icon: FileText,
    current: false,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    current: false,
  },
  {
    name: "Help & Support",
    href: "/help",
    icon: HelpCircle,
    current: false,
  },
]

interface SidebarProps {
  userName?: string
  onSignOut?: () => void
}

export function Sidebar({ userName, onSignOut }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-background-card">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border-separator">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/30 flex items-center justify-center">
            <div className="h-4 w-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-lg font-bold text-text-primary">Heriwill Pro</span>
        </div>
      </div>

      {/* User Info Card */}
      <div className="px-4 py-4">
        <div className="bg-background-elevated rounded-xl p-4 border border-border-muted">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-purple rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">
                {userName || "User"}
              </div>
              <div className="text-xs text-text-accent">Premium Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-600/10 text-primary-400 border border-primary-600/20"
                    : "text-text-muted hover:bg-background-elevated hover:text-text-primary"
                )}
              >
                <div className={cn(
                  "mr-3 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "bg-background-card text-text-muted group-hover:bg-background-elevated group-hover:text-primary-400"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 bg-primary-400 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Sign Out Card */}
      <div className="p-4 border-t border-border-separator">
        <div className="bg-background-elevated rounded-xl border border-border-muted">
          <Button
            variant="ghost"
            className="w-full justify-start text-text-muted hover:text-status-error hover:bg-transparent transition-all duration-200 h-12 rounded-xl"
            onClick={onSignOut}
          >
            <div className="mr-3 h-8 w-8 rounded-lg flex items-center justify-center bg-background-card group-hover:bg-background-elevated transition-all duration-200">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
