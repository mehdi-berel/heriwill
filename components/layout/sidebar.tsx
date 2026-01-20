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
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg"></div>
          <span className="text-lg font-bold">Heriwill Pro</span>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b">
        <div className="text-sm font-medium text-foreground">{userName || "User"}</div>
        <div className="text-xs text-muted-foreground">Premium Plan</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={onSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
