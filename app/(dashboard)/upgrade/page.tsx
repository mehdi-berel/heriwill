"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Crown, Loader2, Zap, Gift } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCheckoutUrl } from "@/lib/revenuecat-config"
import { User } from "@supabase/supabase-js"
import { toast } from "@/lib/utils/toast"
import { logger } from "@/lib/utils/logger"

// Remove local Package interface if importing from library, or keep if library not available
// interface Package {
//   identifier: string
//   [key: string]: unknown
// }

function UpgradePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  searchParams.get('plan') as 'premium' | 'pro' | null

  const [user, setUser] = useState<User | null>(null)
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium' | 'pro'>('free')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      const tier = (profileData as unknown as Record<string, unknown>)?.subscription_tier
      setCurrentPlan((tier as 'free' | 'premium' | 'pro') || 'free')
      setLoading(false)
    }

    getUser()
  }, [router])

  const handlePurchase = async (plan: 'premium' | 'pro') => {
    if (!user) return
    
    setPurchasing(plan)
    
    try {
      // Redirect to RevenueCat paywall with user ID and selected plan
      const paywallUrl = getCheckoutUrl(plan, billingPeriod, user.id)
      window.location.href = paywallUrl
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to redirect to payment page.'
      logger.error('Redirect error', error, { plan })
      toast.error(errorMessage)
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border">
                <CardHeader>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-10 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-5 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    )
  }

  const classicFeatures = [
    '1 vault',
    '1 heir',
    'Store up to 1GB',
  ]

  const legacyFeatures = [
    'Unlimited vaults',
    'Unlimited heirs',
    'Store up to 10GB',
  ]

  const proFeatures = [
    'Everything in Legacy',
    'Store up to 100GB',
    'Pro vault & Notary',
    'Asset management',
    'Legal document templates'
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
        {/* Background blur effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-40 left-0 w-72 h-72 bg-primary-900/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-900/10 rounded-full filter blur-3xl"></div>
        </div>
        
        {/* Header */}
        <div className="mb-12 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-gray-400 text-lg mb-4">Choose the perfect plan for your digital legacy needs</p>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex rounded-lg border border-gray-700 bg-gray-800/50 p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs text-green-400">Save 17%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6 md:overflow-visible md:snap-none md:pb-0 md:mx-0 md:px-0 md:grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12 relative z-10">
          {/* Classic Plan (Free) */}
          <Card className={`rounded-xl md:rounded-2xl border-2 ${
            currentPlan === 'free'
              ? 'border-primary-500 bg-gradient-to-br from-gray-900/80 to-primary-900/20 shadow-xl shadow-primary-500/20'
              : 'border-gray-800 bg-gray-900/60'
          } p-6 md:p-8 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex-shrink-0 w-[85vw] md:w-auto snap-center`}>
            {/* Plan Icon */}
            <div className="mb-4">
              <div className="inline-flex p-2 rounded-lg bg-gray-800/50 border border-gray-700">
                <Gift size={20} className="text-gray-400" />
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Classic</h3>
            <div className="flex items-baseline mb-3">
              <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Free</span>
            </div>
            <div className="mb-4"></div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Essential digital legacy management for individuals
            </p>
            
            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                What&apos;s Included
              </div>
              <ul className="space-y-3">
                {classicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 bg-gray-800 group-hover:bg-gray-700 transition-colors">
                      <Check size={12} className="text-gray-400" />
                    </div>
                    <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            {currentPlan === 'free' ? (
              <div className="w-full py-3 px-4 rounded-xl font-bold text-base bg-primary-600/20 text-primary-300 border-2 border-primary-500/50 flex items-center justify-center gap-2">
                <Check size={18} className="text-primary-400" />
                Active
              </div>
            ) : (
              <Button variant="outline" className="w-full py-3 rounded-xl text-base font-bold bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 hover:border-gray-600">
                Get Started
              </Button>
            )}
          </Card>

          {/* Legacy Plan (Premium) */}
          <Card 
            className={`rounded-xl md:rounded-2xl border-2 ${
              currentPlan === 'premium'
                ? 'border-primary-500 bg-gradient-to-br from-gray-900/80 to-primary-900/20 shadow-xl shadow-primary-500/20'
                : 'border-primary-500 bg-gray-900/60 shadow-xl shadow-primary-500/20'
            } p-6 md:p-8 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl md:scale-105 flex-shrink-0 w-[85vw] md:w-auto snap-center`}
            style={{ borderColor: 'rgb(168 85 247)' }}
          >
            {/* Plan Icon */}
            <div className="mb-4">
              <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-primary-600/20 to-indigo-600/20 border border-primary-500/30">
                <Zap size={20} className="text-primary-400" />
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Legacy</h3>
            <div className="flex items-baseline mb-3">
              <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {billingPeriod === 'monthly' ? '€10' : '€100'}
              </span>
              <span className="text-primary-400 ml-2 text-lg font-medium">
                /{billingPeriod === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            {billingPeriod === 'yearly' && (
              <div className="mb-2">
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                  Save €20/year
                </Badge>
              </div>
            )}
            <div className="mb-4"></div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Complete solution for families and their digital assets
            </p>
            
            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                What&apos;s Included
              </div>
              <ul className="space-y-3">
                {legacyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 bg-primary-600/20 border border-primary-500/30 group-hover:bg-primary-600/30 transition-colors">
                      <Check size={12} className="text-primary-400" />
                    </div>
                    <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            {currentPlan === 'premium' ? (
              <div className="w-full py-3 px-4 rounded-xl font-bold text-base bg-primary-600/20 text-primary-300 border-2 border-primary-500/50 flex items-center justify-center gap-2">
                <Check size={18} className="text-primary-400" />
                Active
              </div>
            ) : currentPlan === 'pro' ? (
              <Button
                variant="outline"
                className="w-full py-3 rounded-xl text-base font-bold bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 hover:border-gray-600"
                disabled
              >
                Downgrade
              </Button>
            ) : (
              <Button
                onClick={() => handlePurchase('premium')}
                disabled={purchasing !== null}
                className="w-full"
                size="lg"
              >
                {purchasing === 'premium' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Subscribe to Legacy'
                )}
              </Button>
            )}
          </Card>

          {/* Pro Plan */}
          <Card className={`rounded-xl md:rounded-2xl border-2 ${
            currentPlan === 'pro'
              ? 'border-amber-500 bg-gradient-to-br from-gray-900/80 to-amber-900/20 shadow-xl shadow-amber-500/20'
              : 'border-gray-800 bg-gray-900/60'
          } p-6 md:p-8 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex-shrink-0 w-[85vw] md:w-auto snap-center`}>
            {/* Plan Icon */}
            <div className="mb-4">
              <div className={`inline-flex p-2 rounded-lg ${
                currentPlan === 'pro'
                  ? 'bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30'
                  : 'bg-gray-800/50 border border-gray-700'
              }`}>
                <Crown size={20} className={currentPlan === 'pro' ? 'text-amber-400' : 'text-gray-400'} />
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Pro</h3>
            <div className="flex items-baseline mb-3">
              <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {billingPeriod === 'monthly' ? '€20' : '€200'}
              </span>
              <span className="text-amber-400 ml-2 text-lg font-medium">
                /{billingPeriod === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            {billingPeriod === 'yearly' && (
              <div className="mb-2">
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                  Save €40/year
                </Badge>
              </div>
            )}
            <div className="mb-4"></div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Advanced features for comprehensive estate planning
            </p>
            
            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                What&apos;s Included
              </div>
              <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start group">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 ${
                      currentPlan === 'pro'
                        ? 'bg-amber-600/20 border border-amber-500/30 group-hover:bg-amber-600/30'
                        : 'bg-gray-800 group-hover:bg-gray-700'
                    } transition-colors`}>
                      <Check size={12} className={currentPlan === 'pro' ? 'text-amber-400' : 'text-gray-400'} />
                    </div>
                    <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            {currentPlan === 'pro' ? (
              <div className="w-full py-3 px-4 rounded-xl font-bold text-base bg-amber-600/20 text-amber-300 border-2 border-amber-500/50 flex items-center justify-center gap-2">
                <Crown size={18} className="text-amber-400 fill-current" />
                Active
              </div>
            ) : (
              <Button
                onClick={() => handlePurchase('pro')}
                disabled={purchasing !== null}
                className="w-full"
                size="lg"
              >
                {purchasing === 'pro' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upgrade to Pro'
                )}
              </Button>
            )}
          </Card>
        </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <UpgradePageContent />
    </Suspense>
  )
}
