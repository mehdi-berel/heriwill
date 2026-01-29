"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import {
  Home,
  Users,
  FileText,
  Scale,
  LogOut,
  Lock,
  Gift,
  Power,
  Package
} from "lucide-react"

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Overview",
  },
  {
    name: "Vaults",
    href: "/vaults",
    icon: Lock,
    description: "Secure storage",
  },
  {
    name: "Heirs",
    href: "/heirs",
    icon: Users,
    description: "Beneficiaries",
  },
  {
    name: "Inheritance",
    href: "/inheritance",
    icon: Gift,
    description: "Legacy plan",
  },
  {
    name: "Sign-Off",
    href: "/sign-off",
    icon: Power,
    description: "Death detection",
  },
  {
    name: "Assets",
    href: "/assets",
    icon: Package,
    description: "Digital items",
    isPro: true,
  },
  {
    name: "Legal",
    href: "/Legal",
    icon: FileText,
    description: "Documents",
    isPro: true,
  },
  {
    name: "Notary",
    href: "/notary",
    icon: Scale,
    description: "Legal witnesses",
    isPro: true,
  },
]

interface SidebarProps {
  userName?: string
  onSignOut?: () => void
}

export function Sidebar({ userName, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)
  const [isProUser, setIsProUser] = useState(false)

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()

        interface ProfileData {
          subscription_tier?: string
        }
        setIsProUser((profile as ProfileData | null)?.subscription_tier === 'pro')
      } catch (error) {
        console.error('Error checking pro status:', error)
      }
    }

    checkProStatus()
  }, [])

  interface NavigationItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    description: string
    isPro?: boolean
  }

  // Filter navigation items based on pro status
  const filteredNavigation = navigation.filter(item => {
    if ((item as NavigationItem).isPro && !isProUser) {
      return false
    }
    return true
  })

  return (
    <div 
      className={cn(
        "flex h-full flex-col bg-black/30 backdrop-blur-xl border-r border-border-default/50 transition-all duration-200 relative",
        isHovered ? "w-64" : "w-20"
      )}
      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-border-separator justify-between">
        <div className={cn(
          "flex items-center gap-2.5 transition-all duration-300",
          !isHovered && "justify-center w-full"
        )}>
          <div className="relative h-8 w-8 flex-shrink-0">
            <Image
              src="/heriwill-transparent.png"
              alt="Heriwill Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          {isHovered && (
            <div className="flex items-baseline gap-1 overflow-hidden">
              <span className="text-base font-bold text-text-primary tracking-tight">Heriwill</span>
              <span className="text-[9px] text-primary-400 font-bold uppercase tracking-wider">Pro</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-3 overflow-y-auto scrollbar-thin scrollbar-thumb-border-light scrollbar-track-transparent">
        <div className="space-y-1 py-2">
          {filteredNavigation.map((item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-600/10 text-primary-400 shadow-sm"
                    : "text-text-muted hover:bg-background-hover hover:text-text-secondary",
                  !isHovered && "justify-center"
                )}
                title={!isHovered ? item.name : undefined}
              >
                {isActive && isHovered && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-500 rounded-r-full" />
                )}
                <div className={cn(
                  "flex items-center justify-center transition-all duration-200 transform-gpu will-change-transform",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )}>
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    isActive ? "text-primary-400" : "text-text-tertiary group-hover:text-text-muted"
                  )} />
                </div>
                {isHovered && (
                  <>
                    <span className="flex-1">
                      {item.name}
                      {(item as NavigationItem).isPro && (
                        <span className="ml-1.5 text-[10px] text-primary-400 font-semibold">(pro)</span>
                      )}
                    </span>
                    {isActive && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </div>

      </nav>

      {/* Divider before sign out */}
      <div className="mx-2 mb-2 h-px bg-gradient-to-r from-transparent via-border-default to-transparent opacity-50"></div>

      {/* Sign Out */}
      <div className="px-2 pb-2">
        <button
          onClick={onSignOut}
          className={cn(
            "group w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-text-muted hover:bg-status-error/5 hover:text-status-error transition-all duration-200",
            !isHovered && "justify-center"
          )}
          title={!isHovered ? "Sign Out" : undefined}
        >
          <div className="group-hover:scale-105 group-hover:rotate-6 transition-all duration-200">
            <LogOut className="h-4 w-4" />
          </div>
          {isHovered && <span className="flex-1 text-left">Sign Out</span>}
        </button>
      </div>
    </div>
  )
}
