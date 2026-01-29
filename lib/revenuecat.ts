import { Purchases } from '@revenuecat/purchases-js'

// RevenueCat configuration
const REVENUECAT_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || ''

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
    const purchases = getRevenueCat()
    if (!purchases) return false

    const customerInfo = await purchases.getCustomerInfo()
    
    // Check if user has 'pro' entitlement
    return customerInfo.entitlements.active['pro'] !== undefined
  } catch (error) {
    console.error('Error checking pro entitlement:', error)
    return false
  }
}

// Get all active entitlements
export const getActiveEntitlements = async (): Promise<string[]> => {
  try {
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
