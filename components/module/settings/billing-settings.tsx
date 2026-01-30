"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, AlertTriangle, CheckCircle, Crown, Zap, Loader2, ExternalLink } from "lucide-react"
import { useRevenueCat } from "@/contexts/RevenueCatContext"
import { getOfferings, purchasePackage, getCustomerInfo, getSubscriptionTier } from "@/lib/revenuecat"

interface BillingSettingsProps {
  subscriptionTier?: string
  subscriptionStatus?: string
  subscriptionExpiresAt?: string
}

export function BillingSettings({
  subscriptionTier: propTier,
  subscriptionStatus: propStatus,
  subscriptionExpiresAt: propExpiresAt
}: BillingSettingsProps) {
  const { entitlements, loading: contextLoading, refreshEntitlements } = useRevenueCat()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [offerings, setOfferings] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customerInfo, setCustomerInfo] = useState<any>(null)
  const [subscriptionTier, setSubscriptionTier] = useState(propTier || 'free')
  const [subscriptionStatus, setSubscriptionStatus] = useState(propStatus || 'active')
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState(propExpiresAt)
  const [loading, setLoading] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlanDetails = () => {
    switch (subscriptionTier) {
      case 'premium':
        return {
          name: 'Legacy Plan',
          price: '€10/month',
          icon: Zap,
          color: 'text-primary-400',
          bgColor: 'bg-primary-500/10',
          features: [
            'Unlimited vaults',
            'Unlimited heirs',
            'Store up to 10GB',
            'Advanced security',
            'Priority support'
          ]
        }
      case 'pro':
        return {
          name: 'Pro Plan',
          price: '€20/month',
          icon: Crown,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          features: [
            'Everything in Legacy',
            'Store up to 100GB',
            'Asset management',
            'Legal document storage',
            'Notary services'
          ]
        }
      default:
        return {
          name: 'Classic Plan',
          price: 'Free',
          icon: CheckCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          features: [
            '1 vault',
            '1 heir',
            'Store up to 1GB',
            'Basic security',
            'Email support'
          ]
        }
    }
  }

  useEffect(() => {
    const loadRevenueCatData = async () => {
      setLoading(true)
      try {
        const [offeringsData, customerData, revenueCatTier] = await Promise.all([
          getOfferings(),
          getCustomerInfo(),
          getSubscriptionTier()
        ])
        
        setOfferings(offeringsData)
        setCustomerInfo(customerData)
        
        // Use database tier (propTier) if provided, otherwise use RevenueCat tier
        if (!propTier) {
          setSubscriptionTier(revenueCatTier)
        }
        
        if (entitlements.length > 0) {
          setSubscriptionStatus('active')
        }
      } catch (error) {
        console.error('Error loading RevenueCat data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!contextLoading) {
      loadRevenueCatData()
    }
  }, [contextLoading, entitlements, propTier])

  const handlePurchase = async (packageToPurchase: any, packageId: string) => {
    setPurchaseLoading(packageId)
    try {
      await purchasePackage(packageToPurchase)
      await refreshEntitlements()
      
      const tier = await getSubscriptionTier()
      setSubscriptionTier(tier)
      setSubscriptionStatus('active')
      
      alert('Subscription purchased successfully!')
    } catch (error: any) {
      console.error('Purchase error:', error)
      if (error.userCancelled) {
        alert('Purchase cancelled')
      } else {
        alert('Purchase failed: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setPurchaseLoading(null)
    }
  }

  const handleManageSubscription = () => {
    if (customerInfo?.managementURL) {
      window.open(customerInfo.managementURL, '_blank')
    }
  }

  const planDetails = getPlanDetails()
  const PlanIcon = planDetails.icon

  if (contextLoading || loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Available Plans */}
      {offerings?.current && subscriptionTier === 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that's right for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {offerings.current.availablePackages.map((pkg: any) => {
                const packageId = pkg.identifier
                const isPremium = packageId.toLowerCase().includes('premium') || packageId.toLowerCase().includes('legacy')
                const isPro = packageId.toLowerCase().includes('pro')
                
                return (
                  <div 
                    key={packageId} 
                    className={`rounded-xl border-2 p-6 md:p-8 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                      isPro
                        ? 'border-amber-500 bg-gradient-to-br from-gray-900/80 to-amber-900/20 shadow-lg shadow-amber-500/20'
                        : 'border-primary-500 bg-gradient-to-br from-gray-900/80 to-primary-900/20 shadow-lg shadow-primary-500/20'
                    }`}
                  >
                    {/* Plan Icon */}
                    <div className="mb-4">
                      <div className={`inline-flex p-2 rounded-lg ${
                        isPro
                          ? 'bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30'
                          : 'bg-gradient-to-br from-primary-600/20 to-indigo-600/20 border border-primary-500/30'
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
                        {pkg.product.priceString}
                      </span>
                      <span className={`ml-2 text-lg font-medium ${isPro ? 'text-amber-400' : 'text-primary-400'}`}>
                        /{pkg.product.subscriptionPeriod || 'month'}
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
                        What's Included
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
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment methods and billing details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionTier !== 'free' ? (
            <div className="p-4 border rounded-lg" style={{ borderColor: '#232629' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-text-tertiary">Expires 12/2025</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
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
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionTier !== 'free' ? (
            <div className="space-y-2">
              {[
                { date: '2026-01-01', amount: subscriptionTier === 'pro' ? '€20.00' : '€10.00', status: 'Paid' },
                { date: '2025-12-01', amount: subscriptionTier === 'pro' ? '€20.00' : '€10.00', status: 'Paid' },
                { date: '2025-11-01', amount: subscriptionTier === 'pro' ? '€20.00' : '€10.00', status: 'Paid' }
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#232629' }}>
                  <div>
                    <p className="font-medium">{formatDate(invoice.date)}</p>
                    <p className="text-sm text-text-tertiary">{invoice.amount}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-status-success">{invoice.status}</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-800/50 border rounded-lg text-center" style={{ borderColor: '#232629' }}>
              <p className="text-text-tertiary">No billing history</p>
              <p className="text-sm text-text-tertiary mt-1">You're on the free plan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-400" />
            <CardTitle>Current Plan</CardTitle>
          </div>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`p-6 ${planDetails.bgColor} border rounded-lg`} style={{ borderColor: '#232629' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 ${planDetails.bgColor} rounded-lg`}>
                  <PlanIcon className={`h-6 w-6 ${planDetails.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{planDetails.name}</h3>
                  <p className="text-2xl font-bold text-primary-400 mt-1">{planDetails.price}</p>
                </div>
              </div>
              <Badge className={subscriptionStatus === 'active' ? 'bg-status-success' : 'bg-status-warning'}>
                {subscriptionStatus}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              {planDetails.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-status-success" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {subscriptionExpiresAt && (
              <div className="pt-4 border-t" style={{ borderColor: '#232629' }}>
                <p className="text-sm text-text-tertiary">
                  {subscriptionStatus === 'active' ? 'Renews on' : 'Expires on'}: {formatDate(subscriptionExpiresAt)}
                </p>
              </div>
            )}
          </div>

          {subscriptionTier === 'free' && (
            <div className="flex gap-3">
              <Button className="flex-1 bg-primary-500 hover:bg-primary-600">
                Upgrade to Legacy
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                Upgrade to Pro
              </Button>
            </div>
          )}

          {subscriptionTier === 'premium' && (
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                Upgrade to Pro
              </Button>
              <Button variant="outline" className="flex-1">
                Cancel Subscription
              </Button>
            </div>
          )}

          {subscriptionTier === 'pro' && (
            <Button variant="outline" className="w-full">
              Cancel Subscription
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
