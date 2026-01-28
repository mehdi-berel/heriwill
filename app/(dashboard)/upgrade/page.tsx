"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Crown, ArrowLeft, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getOfferings, purchasePackage } from "@/lib/revenuecat"

export default function UpgradePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get('plan') as 'premium' | 'pro' | null

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
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
      
      setProfile(profileData)
      setCurrentPlan((profileData as any)?.subscription_tier || 'free')
      setLoading(false)
    }

    getUser()
  }, [router])

  const handlePurchase = async (plan: 'premium' | 'pro') => {
    setPurchasing(plan)
    
    try {
      // Get offerings from RevenueCat
      const offerings = await getOfferings()
      
      if (!offerings?.current) {
        alert('No subscription plans available. Please contact support.')
        setPurchasing(null)
        return
      }

      // Select the appropriate package
      const packageToPurchase = plan === 'premium' 
        ? offerings.current.availablePackages.find((p: any) => p.identifier.includes('premium'))
        : offerings.current.availablePackages.find((p: any) => p.identifier.includes('pro'))

      if (!packageToPurchase) {
        alert(`${plan} plan not found. Please contact support.`)
        setPurchasing(null)
        return
      }

      // Purchase the package
      const customerInfo = await purchasePackage(packageToPurchase)
      
      // Update Supabase with new subscription tier
      await supabase
        .from('users')
        .update({ 
          subscription_tier: plan,
          subscription_status: 'active',
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        } as any)
        .eq('id', user.id)

      // Success! Redirect to dashboard
      alert(`Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Purchase error:', error)
      alert(error.message || 'Purchase failed. Please try again.')
    } finally {
      setPurchasing(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const premiumFeatures = [
    'Unlimited vaults',
    'Unlimited heirs',
    'Advanced vault settings',
    'Priority support',
    'Email notifications',
    'Vault sharing',
    'Encryption options',
  ]

  const proFeatures = [
    'Everything in Premium',
    'Asset management',
    'Legal document storage',
    'Notary services',
    'Sign-off after death vaults',
    'Advanced analytics',
    'White-label options',
    'API access',
  ]

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Upgrade Your Plan</h1>
            <p className="text-lg text-muted-foreground">
              Choose the perfect plan for your estate planning needs
            </p>
            {currentPlan !== 'free' && (
              <Badge className="mt-2 bg-primary-500">
                Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <Card className={`border-2 ${currentPlan === 'free' ? 'border-primary-500' : 'border-border'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Free
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">€0</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1 vault</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1 heir</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Community support</span>
                </li>
              </ul>
              
              {currentPlan === 'free' ? (
                <Badge className="w-full justify-center py-2">Current Plan</Badge>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Downgrade
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`border-2 ${
            currentPlan === 'premium' 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' 
              : selectedPlan === 'premium'
              ? 'border-amber-500 shadow-lg'
              : 'border-border'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-500" />
                Premium
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">€10</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                onClick={() => handlePurchase('premium')}
                disabled={purchasing !== null || currentPlan === 'premium' || currentPlan === 'pro'}
              >
                {purchasing === 'premium' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentPlan === 'premium' ? (
                  'Current Plan'
                ) : currentPlan === 'pro' ? (
                  'Downgrade'
                ) : (
                  'Upgrade to Premium'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`border-2 ${
            currentPlan === 'pro'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
              : selectedPlan === 'pro'
              ? 'border-primary-500 shadow-lg bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-950/20'
              : 'border-primary-500 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-950/10'
          }`}>
            {currentPlan !== 'pro' && (
              <Badge className="absolute top-4 right-4 bg-primary-500">Recommended</Badge>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary-500" />
                Pro
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">€20</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg"
                onClick={() => handlePurchase('pro')}
                disabled={purchasing !== null || currentPlan === 'pro'}
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
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ / Additional Info */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</p>
          <p>✓ All plans include a 14-day free trial</p>
          <p>✓ Cancel anytime, no questions asked</p>
          <p>✓ Secure payment processing via Stripe</p>
          <p>✓ Instant access to all features upon upgrade</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
