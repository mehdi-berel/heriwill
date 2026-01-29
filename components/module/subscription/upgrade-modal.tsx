"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Crown, X } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: 'vault_limit' | 'heir_limit' | 'pro_feature'
  currentPlan?: 'free' | 'premium' | 'pro'
}

export function UpgradeModal({ isOpen, onClose, reason = 'pro_feature', currentPlan = 'free' }: UpgradeModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const getReasonMessage = () => {
    switch (reason) {
      case 'vault_limit':
        return 'You\'ve reached your vault limit. Upgrade to create unlimited vaults.'
      case 'heir_limit':
        return 'You\'ve reached your heir limit. Upgrade to add unlimited heirs.'
      case 'pro_feature':
        return 'This is a premium feature. Upgrade to unlock it.'
      default:
        return 'Upgrade to unlock premium features.'
    }
  }

  const handleUpgrade = (plan: 'premium' | 'pro') => {
    setLoading(true)
    // Navigate to upgrade page with selected plan
    router.push(`/upgrade?plan=${plan}`)
  }

  const premiumFeatures = [
    'Unlimited vaults',
    'Unlimited heirs',
    'Advanced vault settings',
    'Priority support',
    'Email notifications',
  ]

  const proFeatures = [
    'Everything in Premium',
    'Asset management',
    'Legal document storage',
    'Notary services',
    'Sign-off after death vaults',
    'Advanced analytics',
    'White-label options',
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-500" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-base">
            {getReasonMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Premium Plan */}
          <div className={`relative border-2 rounded-xl p-6 transition-all ${
            currentPlan === 'premium' 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' 
              : 'hover:border-primary-300'
          }`}
            style={{ borderColor: currentPlan === 'premium' ? undefined : '#232629' }}
          >
            {currentPlan === 'premium' && (
              <Badge className="absolute top-4 right-4 bg-primary-500">Current Plan</Badge>
            )}
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-amber-500" />
                <h3 className="text-2xl font-bold">Premium</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">€10</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

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
              onClick={() => handleUpgrade('premium')}
              disabled={loading || currentPlan === 'premium' || currentPlan === 'pro'}
            >
              {currentPlan === 'premium' ? 'Current Plan' : currentPlan === 'pro' ? 'Downgrade' : 'Upgrade to Premium'}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className={`relative border-2 rounded-xl p-6 transition-all ${
            currentPlan === 'pro'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
              : 'border-primary-500 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-950/20'
          }`}>
            {currentPlan === 'pro' && (
              <Badge className="absolute top-4 right-4 bg-primary-500">Current Plan</Badge>
            )}
            {currentPlan !== 'pro' && (
              <Badge className="absolute top-4 right-4 bg-primary-500">Recommended</Badge>
            )}
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-primary-500" />
                <h3 className="text-2xl font-bold">Pro</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">€20</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

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
              onClick={() => handleUpgrade('pro')}
              disabled={loading || currentPlan === 'pro'}
            >
              {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>All plans include a 14-day free trial • Cancel anytime • Secure payment via Stripe</p>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  )
}
