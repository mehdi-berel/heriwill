"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProTierGuardProps {
  children: React.ReactNode
  pageName: string
}

export function ProTierGuard({ children, pageName }: ProTierGuardProps) {
  const router = useRouter()
  const [isProUser, setIsProUser] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkProAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase
          .from("users")
          .select("subscription_tier")
          .eq("id", user.id)
          .single()

        const hasProAccess = (profile as { subscription_tier?: string } | null)?.subscription_tier === "pro"
        setIsProUser(hasProAccess)
        setLoading(false)
      } catch (error) {
        logger.error('Error checking pro access', error)
        setIsProUser(false)
        setLoading(false)
      }
    }

    checkProAccess()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isProUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          {/* Logo */}
          <div className="mb-12 flex justify-center pt-8">
            <Image
              src="/heriwill-transparent.png"
              alt="Heriwill Logo"
              width={150}
              height={150}
              className="object-contain"
              priority
            />
          </div>

          {/* Title */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              Pro Feature
            </h1>
            <Sparkles className="h-6 w-6 text-primary-500" />
          </div>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-2">
            {pageName} is a premium feature
          </p>
          <p className="text-base text-muted-foreground mb-8">
            Upgrade to Heriwill Pro to unlock advanced estate planning tools
          </p>

          {/* Features List */}
          <div className="bg-background-card border border-border rounded-xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-500" />
              What you&apos;ll get with Pro:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  <strong className="text-text-primary">Asset Management</strong> - Track and manage all your real estate, vehicles, investments, and more
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  <strong className="text-text-primary">Legal Documents</strong> - Store and organize wills, trusts, power of attorney, and other critical documents
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  <strong className="text-text-primary">Notary Services</strong> - Connect with verified notaries for document authentication
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  <strong className="text-text-primary">Pro Vaults</strong> - Advanced vault features with sign-off capabilities
                </span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all"
              onClick={() => router.push("/settings?tab=subscription")}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Upgrade to Pro
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </div>

          {/* Pricing hint */}
          <p className="mt-6 text-sm text-muted-foreground">
            Starting at just $9.99/month • Cancel anytime
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
