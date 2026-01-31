"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Sparkles, Crown, ArrowLeft, Loader2, Zap, Shield, Star, Gift } from "lucide-react"
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

// Remove local Package interface if importing from library, or keep if library not available
// interface Package {
//   identifier: string
//   [key: string]: unknown
// }

function UpgradePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get('plan') as 'premium' | 'pro' | null

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
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
      
      setProfile(profileData as unknown as UserProfile)
      const tier = (profileData as unknown as Record<string, unknown>)?.subscription_tier
      setCurrentPlan((tier as 'free' | 'premium' | 'pro') || 'free')
      setLoading(false)
    }

    getUser()
  }, [router])

  const handlePurchase = async (plan: 'premium' | 'pro', billingPeriod: 'monthly' | 'yearly' = 'monthly') => {
    if (!user) return
    
    setPurchasing(plan)
    
    try {
      // RevenueCat paywall URLs for specific packages
      const paywallUrls = {
        premium_monthly: 'https://pay.rev.cat/fjyfycitnereerpd/${encodeURIComponent(user.id)}/checkout?package_id=%24rc_monthly',
        premium_yearly: 'https://pay.rev.cat/fjyfycitnereerpd/${encodeURIComponent(user.id)}/checkout?package_id=%24rc_annual',
        pro_monthly: `https://pay.rev.cat/kpsocvhsrpuwhvpw/${encodeURIComponent(user.id)}/checkout?package_id=%24rc_monthly`,
        pro_yearly: `https://pay.rev.cat/kpsocvhsrpuwhvpw/${encodeURIComponent(user.id)}/checkout?package_id=%24rc_annual`,
      }

      let paywallUrl = ''
      if (plan === 'premium') {
        paywallUrl = billingPeriod === 'yearly' ? paywallUrls.premium_yearly : paywallUrls.premium_monthly
      } else {
        paywallUrl = billingPeriod === 'yearly' ? paywallUrls.pro_yearly : paywallUrls.pro_monthly
      }

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
        <div className="mb-16 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Simple, Transparent Pricing
            </h1>
            
            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 ${
                  billingPeriod === 'yearly'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>

            {currentPlan !== 'free' && (
              <Badge className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-base px-6 py-2 shadow-lg">
                <Crown className="h-4 w-4 mr-2 inline" />
                Current Plan: {currentPlan === 'premium' ? 'Legacy' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12 relative z-10">
          {/* Classic Plan (Free) */}
          <Card className={`rounded-2xl border-2 ${
            currentPlan === 'free'
              ? 'border-primary-500 bg-gradient-to-br from-gray-900/80 to-primary-900/20 shadow-xl shadow-primary-500/20'
              : 'border-gray-800 bg-gray-900/60'
          } p-8 md:p-10 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
            {/* Plan Icon */}
            <div className="mb-6">
              <div className="inline-flex p-3 rounded-xl bg-gray-800/50 border border-gray-700">
                <Gift size={24} className="text-gray-400" />
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">Classic</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Free</span>
            </div>
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              Essential digital legacy management for individuals
            </p>
            
            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                What's Included
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
              <div className="w-full py-4 px-6 rounded-lg font-semibold text-base bg-gray-800/50 text-gray-400 border border-gray-700/50 flex items-center justify-center cursor-not-allowed">
                Current Plan
              </div>
            ) : (
              <button className="w-full py-4 px-6 rounded-lg font-semibold text-base bg-white hover:bg-gray-100 text-gray-900 transition-colors duration-200 flex items-center justify-center">
                Get Started
              </button>
            )}
          </Card>

          {/* Legacy Plan (Premium) */}
          <Card className={`rounded-2xl border-2 border-primary-500 bg-gradient-to-br from-gray-900/80 to-primary-900/20 shadow-xl shadow-primary-500/20 p-8 md:p-10 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl md:scale-105`}>
            
            {/* Plan Icon */}
            <div className="mb-6">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-600/20 to-indigo-600/20 border border-primary-500/30">
                <Zap size={24} className="text-primary-400" />
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">Legacy</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {billingPeriod === 'monthly' ? '€10' : '€100'}
              </span>
              <span className="text-primary-400 ml-2 text-xl font-medium">
                /{billingPeriod === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-green-400 mb-2">€8.33/month - Save €20/year</p>
            )}
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              Complete solution for families and their digital assets
            </p>
            
            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                What's Included
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
              onClick={() => handlePurchase('premium', billingPeriod)}
              disabled={purchasing !== null || currentPlan === 'premium' || currentPlan === 'pro'}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-250 flex items-center justify-center ${
                currentPlan === 'premium' || currentPlan === 'pro'
                  ? 'bg-gray-800/50 text-gray-400 border border-gray-700/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#9333EA] bg-[length:200%_100%] text-white hover:bg-[position:100%_0] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_12px_-2px_rgba(147,51,234,0.25),0_2px_6px_-1px_rgba(147,51,234,0.15)] hover:shadow-[0_12px_24px_-4px_rgba(147,51,234,0.3),0_4px_12px_-2px_rgba(147,51,234,0.2)]'
              }`}
            >
              {purchasing === 'premium' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === 'premium' || currentPlan === 'pro' ? (
                'Current Plan'
              ) : (
                'Subscribe'
              )}
            </button>
          </Card>

          {/* Pro Plan */}
          <Card className={`rounded-2xl border-2 ${
            currentPlan === 'pro'
              ? 'border-amber-500 bg-gradient-to-br from-gray-900/80 to-amber-900/20 shadow-xl shadow-amber-500/20'
              : 'border-gray-800 bg-gray-900/60'
          } p-8 md:p-10 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
            {currentPlan === 'pro' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Crown size={12} className="fill-current" />
                  ENTERPRISE
                </div>
              </div>
            )}
            
            {/* Plan Icon */}
            <div className="mb-6">
              <div className={`inline-flex p-3 rounded-xl ${
                currentPlan === 'pro'
                  ? 'bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30'
                  : 'bg-gray-800/50 border border-gray-700'
              }`}>
                <Crown size={24} className={currentPlan === 'pro' ? 'text-amber-400' : 'text-gray-400'} />
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">Pro</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {billingPeriod === 'monthly' ? '€20' : '€200'}
              </span>
              <span className="text-amber-400 ml-2 text-xl font-medium">
                /{billingPeriod === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-green-400 mb-2">€16.67/month - Save €40/year</p>
            )}
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              Advanced features for comprehensive estate planning
            </p>
            
            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                What's Included
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
              onClick={() => handlePurchase('pro', billingPeriod)}
              disabled={purchasing !== null || currentPlan === 'pro'}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-250 flex items-center justify-center ${
                currentPlan === 'pro'
                  ? 'bg-gray-800/50 text-gray-400 border border-gray-700/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#9333EA] bg-[length:200%_100%] text-white hover:bg-[position:100%_0] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_12px_-2px_rgba(147,51,234,0.25),0_2px_6px_-1px_rgba(147,51,234,0.15)] hover:shadow-[0_12px_24px_-4px_rgba(147,51,234,0.3),0_4px_12px_-2px_rgba(147,51,234,0.2)]'
              }`}
            >
              {purchasing === 'pro' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === 'pro' ? (
                'Current Plan'
              ) : (
                'Subscribe'
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
