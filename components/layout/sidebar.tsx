"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"
import {
  Home,
  Users,
  LogOut,
  Lock,
  Power,
  Settings
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
    name: "Sign-Off",
    href: "/sign-off",
    icon: Power,
    description: "Death detection",
  },
]

interface SidebarProps {
  userName?: string
  onSignOut?: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

export function Sidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className={cn(
        "flex h-full flex-col bg-black/30 backdrop-blur-xl border-r transition-all duration-300 relative",
        isHovered ? "w-64" : "w-20"
      )}
      style={{ 
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        borderColor: '#232629'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b justify-between" style={{ borderColor: '#232629' }}>
        <div className={cn(
          "flex items-center gap-2.5 transition-all duration-300",
          !isHovered && "justify-center w-full"
        )}>
          <div className="relative h-8 w-8 flex-shrink-0">
            <Image
              src="/heriwill-transparent.png"
              alt="Heriwill Logo"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
          {isHovered && (
            <div className="flex items-baseline gap-1 overflow-hidden">
              <span className="text-base font-bold text-text-primary tracking-tight">Heriwill</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-3 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="space-y-1 py-2">
          {navigation.map((item: NavigationItem) => {
            const isActive = pathname === item.href

            const navItem = (
              <div
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-600/10 text-primary-400 shadow-sm"
                    : "text-text-muted hover:bg-background-hover hover:text-text-secondary cursor-pointer",
                  !isHovered && "justify-center"
                )}
              >
                {isActive && isHovered && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-500 rounded-r-full" />
                )}

                <div className={cn(
                  "relative flex items-center justify-center transition-all duration-200 transform-gpu will-change-transform",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )}>
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    isActive ? "text-primary-400" : "text-text-tertiary group-hover:text-text-muted"
                  )} />
                </div>

                {isHovered && (
                  <>
                    <span className="flex-1 whitespace-nowrap">{item.name}</span>
                    {isActive && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />
                    )}
                  </>
                )}
              </div>
            )

            const content = !isHovered ? (
              <Tooltip content={item.name} side="right">
                <Link key={item.name} href={item.href} className="block">
                  {navItem}
                </Link>
              </Tooltip>
            ) : (
              <Link key={item.name} href={item.href} className="block">
                {navItem}
              </Link>
            )

            return <div key={item.name}>{content}</div>
          })}
        </div>
      </nav>

      {/* Divider before settings */}
      <div className="mx-2 mb-2 h-px bg-gradient-to-r from-transparent via-border-default to-transparent opacity-50"></div>

      {/* Settings */}
      <div className="px-2 pb-2">
        <Link
          href="/settings"
          className={cn(
            "group w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-text-muted hover:bg-background-hover hover:text-text-primary transition-all duration-200",
            pathname === "/settings" && "bg-primary-600/10 text-primary-400",
            !isHovered && "justify-center"
          )}
          title={!isHovered ? "Settings" : undefined}
        >
          <div className="group-hover:scale-105 transition-all duration-200">
            <Settings className="h-4 w-4" />
          </div>
          {isHovered && <span className="flex-1 text-left whitespace-nowrap">Settings</span>}
        </Link>
      </div>

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
          {isHovered && <span className="flex-1 text-left whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </div>
  )
}

