"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import {
  Home,
  Users,
  Lock,
  Power,
  Settings,
  LockKeyhole,
} from "lucide-react"

const mainNavigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Vaults",
    href: "/vaults",
    icon: Lock,
  },
  {
    name: "Sign-Off",
    href: "/sign-off",
    icon: Power,
  },
  {
    name: "Heirs",
    href: "/heirs",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()
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

  // Check if current route is a pro feature
  const isProRoute = (href: string) => {
    return ['/assets', '/Legal', '/notary'].includes(href)
  }

  // Split navigation into left and right groups
  const leftNavItems = mainNavigation.slice(0, 2) // Home, Vaults
  const centerItem = mainNavigation[2] // Sign-Off (center FAB)
  const rightNavItems = mainNavigation.slice(3) // Heirs, Settings

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-primary/95 backdrop-blur-lg border-t border-border-default shadow-2xl"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
    >
      <div className="relative grid grid-cols-5 items-end px-2 pt-2">
        {/* Left nav items */}
        {leftNavItems.map((item) => {
          const isActive = pathname === item.href
          const isLocked = isProRoute(item.href) && !isProUser
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={isLocked ? "/upgrade" : item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary-600/10 text-primary-400"
                  : isLocked
                  ? "text-text-tertiary opacity-60"
                  : "text-text-muted active:bg-background-hover"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive && "scale-110"
                  )} 
                />
                {isLocked && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-background-primary rounded-full flex items-center justify-center">
                    <LockKeyhole className="h-2 w-2 text-amber-500" />
                  </div>
                )}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400 animate-pulse" />
                )}
              </div>
              <span 
                className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive && "font-semibold"
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}

        {/* Center FAB - Sign-Off */}
        <div className="flex items-center justify-center">
          <Link
            href={centerItem.href}
            className="relative -top-6"
          >
            <div className={cn(
              "relative flex items-center justify-center transition-all duration-200",
              "w-16 h-16 rounded-full",
              "bg-gradient-to-br from-purple-600 to-purple-700",
              "border-4 border-background-primary",
              "shadow-lg shadow-purple-500/50",
              "active:scale-95",
              pathname === centerItem.href && "ring-2 ring-purple-400 ring-offset-2 ring-offset-background-primary"
            )}>
              <centerItem.icon className="h-6 w-6 text-white" />
              {pathname === centerItem.href && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-text-muted whitespace-nowrap">
              {centerItem.name}
            </span>
          </Link>
        </div>

        {/* Right nav items */}
        {rightNavItems.map((item) => {
          const isActive = pathname === item.href
          const isLocked = isProRoute(item.href) && !isProUser
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={isLocked ? "/upgrade" : item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary-600/10 text-primary-400"
                  : isLocked
                  ? "text-text-tertiary opacity-60"
                  : "text-text-muted active:bg-background-hover"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive && "scale-110"
                  )} 
                />
                {isLocked && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-background-primary rounded-full flex items-center justify-center">
                    <LockKeyhole className="h-2 w-2 text-amber-500" />
                  </div>
                )}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400 animate-pulse" />
                )}
              </div>
              <span 
                className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive && "font-semibold"
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
