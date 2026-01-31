"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FeedbackButton } from "@/components/module/feedback/feedback-button"
import { useRevenueCat } from "@/contexts/RevenueCatContext"
import { Crown, Zap, CheckCircle } from "lucide-react"

export function Header() {
  const { entitlements, loading } = useRevenueCat()
  
  // Determine subscription tier from entitlements
  const getTier = () => {
    if (loading) return null
    if (entitlements.includes('pro')) return 'pro'
    if (entitlements.includes('premium')) return 'premium'
    return 'free'
  }

  const tier = getTier()

  const tierConfig = {
    free: {
      label: 'Classic',
      icon: CheckCircle,
      className: 'bg-gray-700/50 text-gray-300 border-gray-600',
    },
    premium: {
      label: 'Premium',
      icon: Zap,
      className: 'bg-primary-500/20 text-primary-400 border-primary-500/50',
    },
    pro: {
      label: 'Pro',
      icon: Crown,
      className: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    },
  }

  const config = tier ? tierConfig[tier] : null
  const Icon = config?.icon

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background-primary/80 backdrop-blur-xl" style={{ borderColor: '#232629' }}>
      <div className="flex h-14 items-center justify-between px-3 md:px-6">
        {/* Left side - Inheritance and Help (mobile only) */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary text-xs px-2"
            asChild
          >
            <Link href="/inheritance">Inheritance</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary text-xs px-2"
            asChild
          >
            <Link href="/help">Help</Link>
          </Button>
        </div>

        {/* Right side - Tier badge and actions */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* Subscription Tier Badge */}
          {config && (
            <Link href="/upgrade">
              <Badge variant="outline" className={`flex items-center gap-1 md:gap-1.5 cursor-pointer transition-all hover:scale-105 text-xs md:text-sm ${config.className}`}>
                {Icon && <Icon className="h-3 w-3 md:h-3.5 md:w-3.5" />}
                <span className="font-semibold hidden sm:inline">{config.label}</span>
              </Badge>
            </Link>
          )}

          {/* Feedback Button */}
          <FeedbackButton />

          {/* Help Link - Desktop only */}
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary hidden md:flex text-sm px-3"
            asChild
          >
            <Link href="/help">Help</Link>
          </Button>

          {/* Inheritance Link - Desktop only */}
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary hidden md:flex text-sm px-3"
            asChild
          >
            <Link href="/inheritance">Inheritance</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
