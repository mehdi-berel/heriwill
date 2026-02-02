"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Download, AlertTriangle, CheckCircle, Crown, Zap, Loader2, ExternalLink } from "lucide-react"
import { useRevenueCat } from "@/contexts/RevenueCatContext"
import { getOfferings, purchasePackage, getCustomerInfo, getSubscriptionTier } from "@/lib/revenuecat"
import { isProPackage, isMonthlyPackage, isYearlyPackage } from "@/lib/revenuecat-config"
import { SyncSubscriptionButton } from "./sync-subscription-button"

interface BillingSettingsProps {
  subscriptionTier?: string
}

export function BillingSettings({
  subscriptionTier: propTier,
}: BillingSettingsProps) {
  const { entitlements, loading: contextLoading, refreshEntitlements } = useRevenueCat()
  const [offerings, setOfferings] = useState<unknown>(null)
  const [customerInfo, setCustomerInfo] = useState<unknown>(null)
  const [subscriptionTier, setSubscriptionTier] = useState(propTier || 'free')
  const [loading, setLoading] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  // Commented out unused function to fix lint warning
  // const getPlanDetails = () => {
  //   switch (subscriptionTier) {
  //     case 'premium':
  //       return {
  //         name: 'Legacy Plan',
  //         price: '€10/month',
  //         icon: Zap,
  //         color: 'text-primary-400',
  //         bgColor: 'bg-primary-500/10',
  //         features: [
  //           'Unlimited vaults',
  //           'Unlimited heirs',
  //           'Store up to 10GB',
  //           'Advanced security',
  //           'Priority support'
  //         ]
  //       }
  //     case 'pro':
  //       return {
  //         name: 'Pro Plan',
  //         price: '€20/month',
  //         icon: Crown,
  //         color: 'text-amber-400',
  //         bgColor: 'bg-amber-500/10',
  //         features: [
  //           'Everything in Legacy',
  //           'Store up to 100GB',
  //           'Asset management',
  //           'Legal document storage',
  //           'Notary services'
  //         ]
  //       }
  //     default:
  //       return {
  //         name: 'Classic Plan',
  //         price: 'Free',
  //         icon: CheckCircle,
  //         color: 'text-gray-400',
  //         bgColor: 'bg-gray-500/10',
  //         features: [
  //           '1 vault',
  //           '1 heir',
  //           'Store up to 1GB',
  //           'Basic security',
  //           'Email support'
  //         ]
  //       }
  //   }
  // }

  useEffect(() => {
    const loadRevenueCatData = async () => {
      setLoading(true)
      try {
        const [offeringsData, customerData, revenueCatTier] = await Promise.all([
          getOfferings(),
          getCustomerInfo(),
          getSubscriptionTier()
        ])
        
        // Only set offerings if data is available
        if (offeringsData) {
          setOfferings(offeringsData)
        }
        
        if (customerData) {
          setCustomerInfo(customerData)
        }
        
        // Use database tier (propTier) if provided, otherwise use RevenueCat tier
        if (!propTier && revenueCatTier) {
          setSubscriptionTier(revenueCatTier)
        }
        
        // Entitlements loaded successfully
      } catch (error) {
        // Silently handle errors - RevenueCat may not be configured
        if (process.env.NODE_ENV === 'development') {
          console.debug('RevenueCat data not available:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    if (!contextLoading) {
      loadRevenueCatData()
    }
  }, [contextLoading, entitlements, propTier])

  const handlePurchase = async (packageToPurchase: unknown, packageId: string) => {
    setPurchaseLoading(packageId)
    try {
      await purchasePackage(packageToPurchase as never)
      await refreshEntitlements()
      
      const tier = await getSubscriptionTier()
      setSubscriptionTier(tier)
      
      alert('Subscription purchased successfully!')
    } catch (error: unknown) {
      console.error('Purchase error:', error)
      const err = error as Record<string, unknown>
      if (err.userCancelled) {
        alert('Purchase cancelled')
      } else {
        alert('Purchase failed: ' + (err.message || 'Unknown error'))
      }
    } finally {
      setPurchaseLoading(null)
    }
  }

  const handleManageSubscription = () => {
    if ((customerInfo as { managementURL?: string })?.managementURL) {
      window.open((customerInfo as { managementURL: string }).managementURL, '_blank')
    }
  }

  if (contextLoading || loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sync Subscription Tool */}
      {subscriptionTier !== propTier && (
        <Card className="border-gray-700 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Subscription Mismatch Detected
            </CardTitle>
            <CardDescription>
              Your RevenueCat subscription doesn&apos;t match your database. Click below to sync.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SyncSubscriptionButton />
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {(offerings as { current?: { availablePackages: unknown[] } })?.current && subscriptionTier === 'free' && (
        <Card className="border-gray-700">
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that&apos;s right for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Billing Period Toggle */}
            <div className="flex justify-center mb-6">
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

            <div className="grid gap-6 md:grid-cols-2">
              {(offerings as { current: { availablePackages: Array<Record<string, unknown>> } }).current.availablePackages
                .filter((pkg: Record<string, unknown>) => {
                  return billingPeriod === 'monthly' 
                    ? isMonthlyPackage(pkg.identifier as string)
                    : isYearlyPackage(pkg.identifier as string)
                })
                .map((pkg: Record<string, unknown>) => {
                const packageId = pkg.identifier as string
                const product = pkg.product as Record<string, unknown>
                const isPro = isProPackage(packageId)
                
                return (
                  <div 
                    key={packageId} 
                    className="rounded-xl border-2 border-gray-700 bg-gray-900/60 p-6 md:p-8 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  >
                    {/* Plan Icon */}
                    <div className="mb-4">
                      <div className={`inline-flex p-2 rounded-lg bg-gray-800/50 border border-gray-700 ${
                        isPro ? 'text-amber-400' : 'text-primary-400'
                      }`}>
                        {isPro ? (
                          <Crown size={20} className="text-amber-400" />
                        ) : (
                          <Zap size={20} className="text-primary-400" />
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">
                      {isPro ? 'Pro' : 'Legacy'}
                    </h3>
                    
                    <div className="flex items-baseline mb-3">
                      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {product.priceString as string}
                      </span>
                      <span className={`ml-2 text-lg font-medium ${isPro ? 'text-amber-400' : 'text-primary-400'}`}>
                        /{product.subscriptionPeriod as string || 'month'}
                      </span>
                    </div>
                    
                    <div className="mb-4"></div>
                    
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                      {isPro 
                        ? 'Advanced features for comprehensive estate planning'
                        : 'Complete solution for families and their digital assets'
                      }
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        What&apos;s Included
                      </div>
                      <ul className="space-y-3">
                        {(isPro ? [
                          'Everything in Legacy',
                          'Store up to 100GB',
                          'Asset management',
                          'Legal document storage',
                          'Notary services'
                        ] : [
                          'Unlimited vaults',
                          'Unlimited heirs',
                          'Store up to 10GB',
                          'Advanced security',
                          'Priority email & chat support'
                        ]).map((feature, index) => (
                          <li key={index} className="flex items-start group">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 ${
                              isPro
                                ? 'bg-amber-600/20 border border-amber-500/30 group-hover:bg-amber-600/30'
                                : 'bg-primary-600/20 border border-primary-500/30 group-hover:bg-primary-600/30'
                            } transition-colors`}>
                              <CheckCircle size={12} className={isPro ? 'text-amber-400' : 'text-primary-400'} />
                            </div>
                            <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handlePurchase(pkg, packageId)}
                      disabled={purchaseLoading === packageId}
                      className="w-full py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 transform active:scale-95 flex items-center justify-center bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchaseLoading === packageId ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Subscribe to ${isPro ? 'Pro' : 'Legacy'}`
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card className="border-gray-700">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment methods and billing details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionTier !== 'free' ? (
            <div className="p-4 bg-gray-800/50 border rounded-lg" style={{ borderColor: '#232629' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Payment method managed by Stripe</p>
                    <p className="text-sm text-text-tertiary">Update your payment details through the customer portal</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={!(customerInfo as { managementURL?: string })?.managementURL}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-800/50 border rounded-lg text-center" style={{ borderColor: '#232629' }}>
              <p className="text-text-tertiary">No payment method on file</p>
              <p className="text-sm text-text-tertiary mt-1">Upgrade to add a payment method</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-gray-700">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionTier !== 'free' ? (
            <div className="p-4 bg-gray-800/50 border rounded-lg text-center" style={{ borderColor: '#232629' }}>
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <Download className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium mb-1">View Billing History</p>
                  <p className="text-sm text-text-tertiary mb-3">
                    Access your invoices and payment history through the Stripe customer portal
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleManageSubscription}
                    disabled={!(customerInfo as { managementURL?: string })?.managementURL}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Customer Portal
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-800/50 border rounded-lg text-center" style={{ borderColor: '#232629' }}>
              <p className="text-text-tertiary">No billing history</p>
              <p className="text-sm text-text-tertiary mt-1">You&apos;re on the free plan</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
