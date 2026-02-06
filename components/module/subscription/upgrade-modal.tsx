"use client"

import { useState, useRef, useCallback } from "react"
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
  const [activeSlide, setActiveSlide] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return
    const { scrollLeft, clientWidth } = sliderRef.current
    const slideIndex = Math.round(scrollLeft / (clientWidth * 0.85))
    setActiveSlide(Math.min(slideIndex, 1))
  }, [])

  const scrollToSlide = useCallback((index: number) => {
    if (!sliderRef.current) return
    const cardWidth = sliderRef.current.clientWidth * 0.85
    sliderRef.current.scrollTo({ left: cardWidth * index, behavior: 'smooth' })
  }, [])

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {getReasonMessage()}
          </DialogDescription>
        </DialogHeader>

        {/* Mobile: horizontal slider / Desktop: grid */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:snap-none sm:grid sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Premium Plan */}
          <div className={`relative border-2 rounded-xl p-5 sm:p-6 transition-all flex-shrink-0 w-[85%] sm:w-auto snap-center ${
            currentPlan === 'premium' 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' 
              : 'hover:border-primary-300'
          }`}
            style={{ borderColor: currentPlan === 'premium' ? undefined : '#232629' }}
          >
            {currentPlan === 'premium' && (
              <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-primary-500">Current Plan</Badge>
            )}
            
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
                <h3 className="text-xl sm:text-2xl font-bold">Premium</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold">€10</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
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
          <div className={`relative border-2 rounded-xl p-5 sm:p-6 transition-all flex-shrink-0 w-[85%] sm:w-auto snap-center ${
            currentPlan === 'pro'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
              : 'border-primary-500 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-950/20'
          }`}>
            {currentPlan === 'pro' && (
              <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-primary-500">Current Plan</Badge>
            )}
            {currentPlan !== 'pro' && (
              <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-primary-500">Recommended</Badge>
            )}
            
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
                <h3 className="text-xl sm:text-2xl font-bold">Pro</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold">€20</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 flex-shrink-0 mt-0.5" />
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

        {/* Mobile Slide Indicators */}
        <div className="flex justify-center gap-2 mt-4 sm:hidden">
          {['Premium', 'Pro'].map((label, index) => (
            <button
              key={label}
              onClick={() => scrollToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                activeSlide === index
                  ? 'w-8 h-2 bg-primary-500'
                  : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to ${label} plan`}
            />
          ))}
        </div>

        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
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
