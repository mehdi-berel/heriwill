"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Crown, Loader2, Zap, Gift } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { REVENUECAT_PAYWALL } from "@/lib/revenuecat-config"
import { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  subscription_tier?: string
  subscription_status?: string
  subscription_expires_at?: string
}

function UpgradePageContent() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium' | 'pro'>('free')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

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
      
      setProfile(profileData as unknown as UserProfile)
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
      // Redirect to RevenueCat paywall with user ID as path parameter
      // Format: https://pay.rev.cat/{token}/{app_user_id}
      const paywallUrl = `${REVENUECAT_PAYWALL.URL}${encodeURIComponent(user.id)}`
      window.location.href = paywallUrl
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to redirect to payment page.'
      console.error('Redirect error:', error)
      alert(errorMessage)
      setPurchasing(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <DashboardLayout userName="Loading..." onSignOut={handleSignOut}>
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
      </DashboardLayout>
    )
  }

  const classicFeatures = [
    '1 vault',
    '1 heir',
    'Store up to 1GB',
    'Basic security',
    'Email support',
    'Essential features',
  ]

  const legacyFeatures = [
    'Unlimited vaults',
    'Unlimited heirs',
    'Store up to 10GB',
    'Advanced security',
    'Priority email & chat support',
  ]

  const proFeatures = [
    'Everything in Legacy',
    'Store up to 100GB',
    'Asset management',
    'Legal document storage',
    'Notary services',
  ]

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
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
            <p className="text-lg md:text-xl text-gray-400 mb-6 max-w-3xl mx-auto">
              Choose the plan that&apos;s right for you. Start with Classic for free, or upgrade to Legacy for advanced features and peace of mind.
            </p>
            {currentPlan !== 'free' && (
              <Badge className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm px-4 py-1.5">
                Current Plan: {currentPlan === 'premium' ? 'Legacy' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12 relative z-10">
          {/* Classic Plan (Free) */}
          <Card className={`rounded-xl md:rounded-2xl border-2 ${
            currentPlan === 'free'
              ? 'border-primary-500 bg-gradient-to-br from-gray-900/80 to-primary-900/20 shadow-xl shadow-primary-500/20'
              : 'border-gray-800 bg-gray-900/60'
          } p-6 md:p-8 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
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
            <p className="text-sm text-gray-400">Perfect for individuals who want to get started with digital legacy planning</p>
            
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
              <div className="w-full py-3 px-4 rounded-xl font-bold text-base bg-gray-800 text-white border-2 border-gray-700 flex items-center justify-center">
                Current Plan
              </div>
            ) : (
              <Button variant="outline" className="w-full py-3 rounded-xl text-base font-bold bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 hover:border-gray-600" disabled>
                Current Plan
              </Button>
            )}
          </Card>

          {/* Legacy Plan (Premium) */}
          <Card className={`rounded-xl md:rounded-2xl border-2 border-primary-500 bg-gradient-to-br from-gray-900/80 to-primary-900/20 shadow-xl shadow-primary-500/20 p-6 md:p-8 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl md:scale-105`}>
            {/* Plan Icon */}
            <div className="mb-4">
              <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-primary-600/20 to-indigo-600/20 border border-primary-500/30">
                <Zap size={20} className="text-primary-400" />
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Legacy</h3>
            <div className="flex items-baseline mb-3">
              <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">€10</span>
              <span className="text-primary-400 ml-2 text-lg font-medium">/month</span>
            </div>
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
            <button
              onClick={() => handlePurchase('premium')}
              disabled={purchasing !== null || currentPlan === 'premium' || currentPlan === 'pro'}
              className="w-full py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 transform active:scale-95 flex items-center justify-center bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing === 'premium' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === 'premium' || currentPlan === 'pro' ? (
                'Current Plan'
              ) : (
                'Subscribe to Legacy'
              )}
            </button>
          </Card>

          {/* Pro Plan */}
          <Card className={`rounded-xl md:rounded-2xl border-2 ${
            currentPlan === 'pro'
              ? 'border-amber-500 bg-gradient-to-br from-gray-900/80 to-amber-900/20 shadow-xl shadow-amber-500/20'
              : 'border-gray-800 bg-gray-900/60'
          } p-6 md:p-8 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
            {currentPlan === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Crown size={12} className="fill-current" />
                Enterprise
              </div>
            )}
            
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
              <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">€20</span>
              <span className="text-amber-400 ml-2 text-lg font-medium">/month</span>
            </div>
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
            <button
              onClick={() => handlePurchase('pro')}
              disabled={purchasing !== null || currentPlan === 'pro'}
              className={`w-full py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 transform active:scale-95 flex items-center justify-center ${
                currentPlan === 'pro'
                  ? 'bg-gray-800 text-white border-2 border-gray-700'
                  : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {purchasing === 'pro' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === 'pro' ? (
                'Current Plan'
              ) : (
                'Upgrade to Pro'
              )}
            </button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
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
