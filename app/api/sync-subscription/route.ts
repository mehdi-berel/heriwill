import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCustomerInfo, getSubscriptionTier } from '@/lib/revenuecat'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'
import { sanitizeApiError } from '@/lib/utils/error-handler'

/**
 * Manual subscription sync endpoint
 * Syncs RevenueCat subscription data to Supabase database
 * Call this endpoint to manually sync your subscription if webhook missed it
 */
export async function POST(request: NextRequest) {
  try {
    // Apply standard rate limiting
    const rateLimitResult = await rateLimit(RateLimitPresets.standard)(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

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
      const sanitized = sanitizeApiError(new Error('Failed to fetch customer info'), { userId, action: 'sync_subscription' })
      return NextResponse.json(
        { error: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    // Determine subscription status and expiration
    const hasActiveSubscription = Object.keys(customerInfo.entitlements).length > 0
    const subscriptionStatus = hasActiveSubscription ? 'active' : 'inactive'
    
    // Get expiration date from first active entitlement
    let expirationDate = null
    const entitlements = customerInfo.entitlements as unknown as Record<string, unknown>
    const entitlementKeys = Object.keys(entitlements)
    if (entitlementKeys.length > 0) {
      const firstEntitlement = entitlements[entitlementKeys[0]] as { expirationDate?: string }
      expirationDate = firstEntitlement.expirationDate || null
    }

    // Update database
    const updatePayload = {
      subscription_tier: tier,
      subscription_status: subscriptionStatus,
      subscription_expires_at: expirationDate,
      updated_at: new Date().toISOString()
    }

    const { error } = await (supabase.from('users') as unknown as {
      update: (data: unknown) => { eq: (column: string, value: string) => Promise<{ error: unknown }> }
    })
      .update(updatePayload)
      .eq('id', userId)

    if (error) {
      const sanitized = sanitizeApiError(error, { userId, action: 'update_subscription_db' })
      return NextResponse.json(
        { error: sanitized.error },
        { status: sanitized.statusCode }
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
    const sanitized = sanitizeApiError(error, { action: 'sync_subscription' })
    return NextResponse.json(
      { error: sanitized.error },
      { status: sanitized.statusCode }
    )
  }
}
