"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FeedbackButton } from "@/components/module/feedback/feedback-button"
import { useRevenueCat } from "@/contexts/RevenueCatContext"
import { supabase } from "@/lib/supabase"
import { Crown, Zap, CheckCircle, LogOut } from "lucide-react"

export function Header() {
  const { entitlements, loading } = useRevenueCat()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }
  
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
    <header className="sticky top-0 z-50 w-full border-b bg-background-primary/95 backdrop-blur-xl shadow-sm" style={{ borderColor: '#232629' }}>
      <div className="flex h-16 md:h-14 items-center justify-between px-4 md:px-6">
        {/* Left side - Logo/Brand (mobile only) */}
        <div className="flex items-center md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 flex items-center justify-center">
              <Image 
                src="/heriwill-transparent.png" 
                alt="Heriwill Logo" 
                width={32} 
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-base font-bold text-text-primary">Heriwill</span>
          </Link>
        </div>

        {/* Right side - Tier badge and actions */}
        <div className="flex items-center gap-2 md:gap-2 ml-auto">
          {/* Subscription Tier Badge */}
          {config && (
            <Link href="/upgrade">
              <Badge variant="outline" className={`flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 h-9 px-2 md:px-3 text-xs md:text-sm ${config.className}`}>
                {Icon && <Icon className="h-3.5 w-3.5 md:h-3.5 md:w-3.5" />}
                <span className="font-semibold hidden md:inline">{config.label}</span>
              </Badge>
            </Link>
          )}

          {/* Feedback Button */}
          <FeedbackButton />

          {/* Sign Out - Mobile only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="md:hidden text-text-secondary hover:text-status-error transition-colors h-9 w-9 p-0 flex items-center justify-center"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
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
