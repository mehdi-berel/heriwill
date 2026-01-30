import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCustomerInfo, getSubscriptionTier } from '@/lib/revenuecat'
import { logger } from '@/lib/utils/logger'

/**
 * Manual subscription sync endpoint
 * Syncs RevenueCat subscription data to Supabase database
 * Call this endpoint to manually sync your subscription if webhook missed it
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get subscription info from RevenueCat
    const [customerInfo, tier] = await Promise.all([
      getCustomerInfo(),
      getSubscriptionTier()
    ])

    if (!customerInfo) {
      return NextResponse.json(
        { error: 'Failed to fetch RevenueCat customer info' },
        { status: 500 }
      )
    }

    // Determine subscription status and expiration
    const hasActiveSubscription = Object.keys(customerInfo.entitlements).length > 0
    const subscriptionStatus = hasActiveSubscription ? 'active' : 'inactive'
    
    // Get expiration date from first active entitlement
    let expirationDate = null
    const entitlementKeys = Object.keys(customerInfo.entitlements)
    if (entitlementKeys.length > 0) {
      const firstEntitlement = customerInfo.entitlements[entitlementKeys[0]]
      expirationDate = firstEntitlement.expirationDate || null
    }

    // Update database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase
      .from('users') as any)
      .update({
        subscription_tier: tier,
        subscription_status: subscriptionStatus,
        subscription_expires_at: expirationDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      logger.error('Failed to update user subscription in database', error)
      return NextResponse.json(
        { error: 'Failed to update database', details: error.message },
        { status: 500 }
      )
    }

    logger.info('Successfully synced subscription to database', {
      userId,
      tier,
      status: subscriptionStatus
    })

    return NextResponse.json({
      success: true,
      subscription: {
        tier,
        status: subscriptionStatus,
        expiresAt: expirationDate
      }
    })
  } catch (error) {
    logger.error('Error syncing subscription', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
