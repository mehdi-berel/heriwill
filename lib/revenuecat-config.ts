/**
 * RevenueCat Product Configuration
 * 
 * Product IDs created in RevenueCat dashboard and linked to Stripe
 */

export const REVENUECAT_PRODUCTS = {
  PREMIUM_MONTHLY: 'prod82b1c69dec',
  PREMIUM_YEARLY: 'prodba9755bf25',
  PRO_MONTHLY: 'prodba087df647',
  PRO_YEARLY: 'prod43d4476b53',
} as const

export const REVENUECAT_ENTITLEMENTS = {
  PREMIUM: 'premium',
  PRO: 'pro',
} as const

export const REVENUECAT_OFFERING = {
  CURRENT: 'current',
  ID: 'ofrng6e1981ca64',
} as const

/**
 * RevenueCat Paywall Configuration
 */
export const REVENUECAT_PAYWALL = {
  URL: 'https://pay.rev.cat/fjyfycitnereerpd/',
} as const

/**
 * Package identifier patterns for filtering
 * These patterns are used to identify packages in the offerings
 */
export const PACKAGE_PATTERNS = {
  PREMIUM: ['premium', 'legacy'],
  PRO: ['pro'],
  MONTHLY: ['monthly'],
  YEARLY: ['yearly', 'annual'],
} as const

/**
 * Pricing information
 */
export const PRICING = {
  PREMIUM_MONTHLY: {
    amount: 10,
    currency: '€',
    period: 'month',
  },
  PREMIUM_YEARLY: {
    amount: 100,
    currency: '€',
    period: 'year',
    savings: 17, // percentage
  },
  PRO_MONTHLY: {
    amount: 20,
    currency: '€',
    period: 'month',
  },
  PRO_YEARLY: {
    amount: 200,
    currency: '€',
    period: 'year',
    savings: 17, // percentage
  },
} as const

/**
 * Helper function to check if a package identifier matches a tier
 */
export function isPremiumPackage(identifier: string): boolean {
  const lowerIdentifier = identifier.toLowerCase()
  return PACKAGE_PATTERNS.PREMIUM.some(pattern => lowerIdentifier.includes(pattern))
}

/**
 * Helper function to check if a package identifier matches pro tier
 */
export function isProPackage(identifier: string): boolean {
  const lowerIdentifier = identifier.toLowerCase()
  return PACKAGE_PATTERNS.PRO.some(pattern => lowerIdentifier.includes(pattern))
}

/**
 * Helper function to check if a package is monthly
 */
export function isMonthlyPackage(identifier: string): boolean {
  const lowerIdentifier = identifier.toLowerCase()
  return PACKAGE_PATTERNS.MONTHLY.some(pattern => lowerIdentifier.includes(pattern))
}

/**
 * Helper function to check if a package is yearly
 */
export function isYearlyPackage(identifier: string): boolean {
  const lowerIdentifier = identifier.toLowerCase()
  return PACKAGE_PATTERNS.YEARLY.some(pattern => lowerIdentifier.includes(pattern))
}
