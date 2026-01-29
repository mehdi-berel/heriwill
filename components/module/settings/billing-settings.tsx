"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, AlertTriangle, CheckCircle, Crown, Zap } from "lucide-react"

interface BillingSettingsProps {
  subscriptionTier?: string
  subscriptionStatus?: string
  subscriptionExpiresAt?: string
}

export function BillingSettings({
  subscriptionTier = 'free',
  subscriptionStatus = 'active',
  subscriptionExpiresAt
}: BillingSettingsProps) {
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

  const planDetails = getPlanDetails()
  const PlanIcon = planDetails.icon

  return (
    <div className="space-y-6">
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
          <div className={`p-6 ${planDetails.bgColor} border border-border-default rounded-lg`}>
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
              <div className="pt-4 border-t border-border-default">
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
            <div className="p-4 border border-border-default rounded-lg">
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
            <div className="p-4 bg-gray-800/50 border border-border-default rounded-lg text-center">
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
                <div key={index} className="flex items-center justify-between p-4 border border-border-default rounded-lg">
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
            <div className="p-4 bg-gray-800/50 border border-border-default rounded-lg text-center">
              <p className="text-text-tertiary">No billing history</p>
              <p className="text-sm text-text-tertiary mt-1">You're on the free plan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {subscriptionTier !== 'free' && (
        <Card className="border-red-500/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Irreversible actions that affect your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="font-medium mb-2">Cancel Subscription</p>
              <p className="text-sm text-text-tertiary mb-4">
                Once you cancel, you'll lose access to all premium features at the end of your billing period.
              </p>
              <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
