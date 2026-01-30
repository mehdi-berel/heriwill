import { Purchases } from '@revenuecat/purchases-js'
import { REVENUECAT_ENTITLEMENTS, REVENUECAT_PRODUCTS } from './revenuecat-config'

// RevenueCat configuration
const REVENUECAT_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || ''

// Export product IDs for reference
export { REVENUECAT_PRODUCTS, REVENUECAT_ENTITLEMENTS }

let purchasesInstance: Purchases | null = null

export const initializeRevenueCat = async (userId: string) => {
  if (!REVENUECAT_API_KEY) {
    console.error('RevenueCat API key is not set')
    return null
  }

  try {
    if (!purchasesInstance) {
      purchasesInstance = Purchases.configure(REVENUECAT_API_KEY, userId)
    }
    return purchasesInstance
  } catch (error) {
    console.error('Error initializing RevenueCat:', error)
    return null
  }
}

export const getRevenueCat = () => {
  return purchasesInstance
}

// Check if user has pro entitlement
export const checkProEntitlement = async (): Promise<boolean> => {
  try {
    // If RevenueCat is not configured, return false (use Supabase subscription_tier instead)
    if (!REVENUECAT_API_KEY) return false
    
    const purchases = getRevenueCat()
    if (!purchases) return false

    const customerInfo = await purchases.getCustomerInfo()
    
    // Check if user has 'pro' entitlement
    return customerInfo.entitlements.active[REVENUECAT_ENTITLEMENTS.PRO] !== undefined
  } catch (error) {
    console.error('Error checking pro entitlement:', error)
    return false
  }
}

// Get all active entitlements
export const getActiveEntitlements = async (): Promise<string[]> => {
  try {
    // If RevenueCat is not configured, return empty array (use Supabase subscription_tier instead)
    if (!REVENUECAT_API_KEY) return []
    
    const purchases = getRevenueCat()
    if (!purchases) return []

    const customerInfo = await purchases.getCustomerInfo()
    return Object.keys(customerInfo.entitlements.active)
  } catch (error) {
    console.error('Error getting active entitlements:', error)
    return []
  }
}

// Get available offerings (subscription plans)
export const getOfferings = async () => {
  try {
    const purchases = getRevenueCat()
    if (!purchases) return null

    const offerings = await purchases.getOfferings()
    return offerings
  } catch (error) {
    console.error('Error getting offerings:', error)
    return null
  }
}

// Purchase a package
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const purchasePackage = async (packageToPurchase: any) => {
  try {
    const purchases = getRevenueCat()
    if (!purchases) throw new Error('RevenueCat not initialized')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { customerInfo } = await purchases.purchasePackage(packageToPurchase as any)
    return customerInfo
  } catch (error) {
    console.error('Error purchasing package:', error)
    throw error
  }
}

// Sync purchases (Web SDK doesn't have restorePurchases)
export const syncPurchases = async () => {
  try {
    const purchases = getRevenueCat()
    if (!purchases) throw new Error('RevenueCat not initialized')

    // For web, we just get the latest customer info
    const customerInfo = await purchases.getCustomerInfo()
    return customerInfo
  } catch (error) {
    console.error('Error syncing purchases:', error)
    throw error
  }
}

// Get subscription tier from customer info
export const getSubscriptionTier = async (): Promise<'free' | 'premium' | 'pro'> => {
  try {
    const purchases = getRevenueCat()
    if (!purchases) return 'free'

    const customerInfo = await purchases.getCustomerInfo()
    const activeEntitlements = Object.keys(customerInfo.entitlements.active)

    // Check for pro entitlement first
    if (activeEntitlements.includes(REVENUECAT_ENTITLEMENTS.PRO)) return 'pro'
    // Then check for premium entitlement
    if (activeEntitlements.includes(REVENUECAT_ENTITLEMENTS.PREMIUM)) return 'premium'
    
    return 'free'
  } catch (error) {
    console.error('Error getting subscription tier:', error)
    return 'free'
  }
}

// Get customer info with subscription details
export const getCustomerInfo = async () => {
  try {
    const purchases = getRevenueCat()
    if (!purchases) return null

    const customerInfo = await purchases.getCustomerInfo()
    return {
      activeSubscriptions: Object.keys(customerInfo.activeSubscriptions),
      entitlements: customerInfo.entitlements.active,
      originalAppUserId: customerInfo.originalAppUserId,
      managementURL: customerInfo.managementURL,
    }
  } catch (error) {
    console.error('Error getting customer info:', error)
    return null
  }
}

// Check if user can access a feature based on tier
export const canAccessFeature = async (feature: 'sign_off' | 'assets' | 'legal' | 'notary'): Promise<boolean> => {
  const tier = await getSubscriptionTier()
  
  // Pro features
  const proFeatures = ['sign_off', 'assets', 'legal', 'notary']
  if (proFeatures.includes(feature)) {
    return tier === 'pro'
  }
  
  return true
}

// Check vault/heir limits based on tier
export const checkLimits = async (type: 'vaults' | 'heirs', currentCount: number): Promise<{ allowed: boolean; limit: number }> => {
  const tier = await getSubscriptionTier()
  
  const limits = {
    free: { vaults: 1, heirs: 1 },
    premium: { vaults: Infinity, heirs: Infinity },
    pro: { vaults: Infinity, heirs: Infinity }
  }
  
  const limit = limits[tier][type]
  return {
    allowed: currentCount < limit,
    limit: limit === Infinity ? -1 : limit
  }
}
