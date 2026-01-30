import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'

// RevenueCat webhook handler
// Handles subscription events from RevenueCat
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for webhooks
    const rateLimitResult = await rateLimit(RateLimitPresets.webhook)(request)
    
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Verify webhook signature (recommended for production)
    const signature = request.headers.get('x-revenuecat-signature')
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET
    
    if (webhookSecret && signature) {
      // TODO: Implement signature verification
      // const body = await request.text()
      // const isValid = verifyWebhookSignature(body, signature, webhookSecret)
      // if (!isValid) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      // }
    }

    const event = await request.json()
    
    logger.info('RevenueCat webhook received', { eventType: event.type })

    // Extract event data
    const eventType = event.type
    const appUserId = event.event?.app_user_id
    const productId = event.event?.product_id
    const entitlementIds = event.event?.entitlement_ids || []
    const expirationDate = event.event?.expiration_at_ms
    const isTrialConversion = event.event?.is_trial_conversion || false

    // Map product IDs to subscription tiers
    const tierMapping: Record<string, 'free' | 'premium' | 'pro'> = {
      'premium_monthly': 'premium',
      'premium_yearly': 'premium',
      'legacy_monthly': 'premium',
      'legacy_yearly': 'premium',
      'pro_monthly': 'pro',
      'pro_yearly': 'pro',
    }

    const subscriptionTier = productId ? tierMapping[productId] || 'free' : 'free'

    // Handle different event types
    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
        // Update user subscription in database
        if (appUserId) {
          await updateUserSubscription(appUserId, {
            subscription_tier: subscriptionTier,
            subscription_status: 'active',
            subscription_expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
            subscription_product_id: productId,
            is_trial: isTrialConversion,
          })
        }
        break

      case 'CANCELLATION':
        // Mark subscription as cancelled but keep active until expiration
        if (appUserId) {
          await updateUserSubscription(appUserId, {
            subscription_status: 'cancelled',
          })
        }
        break

      case 'EXPIRATION':
      case 'BILLING_ISSUE':
        // Downgrade to free tier
        if (appUserId) {
          await updateUserSubscription(appUserId, {
            subscription_tier: 'free',
            subscription_status: 'expired',
            subscription_expires_at: null,
          })
        }
        break

      case 'UNCANCELLATION':
        // User reactivated subscription
        if (appUserId) {
          await updateUserSubscription(appUserId, {
            subscription_status: 'active',
          })
        }
        break

      default:
        logger.warn('Unhandled RevenueCat event type', { eventType })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Error processing RevenueCat webhook', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Helper function to update user subscription in Supabase
async function updateUserSubscription(
  userId: string,
  updates: {
    subscription_tier?: 'free' | 'premium' | 'pro'
    subscription_status?: string
    subscription_expires_at?: string | null
    subscription_product_id?: string
    is_trial?: boolean
  }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase
      .from('users') as any)
      .update(updates)
      .eq('id', userId)

    if (error) {
      logger.error('Error updating user subscription', error, { userId })
      throw error
    }

    logger.info('Updated subscription for user', { userId, updates })
  } catch (error) {
    logger.error('Failed to update user subscription', error)
    throw error
  }
}
