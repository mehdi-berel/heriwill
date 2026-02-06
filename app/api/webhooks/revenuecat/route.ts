import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'
import { REVENUECAT_PRODUCTS } from '@/lib/revenuecat-config'
import type { Database } from '@/lib/database.types'

function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body)
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// RevenueCat webhook handler
// Handles subscription events from RevenueCat
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for webhooks
    const rateLimitResult = await rateLimit(RateLimitPresets.webhook)(request)
    
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Verify webhook signature
    const signature = request.headers.get('x-revenuecat-signature')
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET
    const rawBody = await request.text()

    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
      }
      try {
        const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret)
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }
      } catch {
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      logger.error('REVENUECAT_WEBHOOK_SECRET is not set in production')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const event = JSON.parse(rawBody)
    
    logger.info('RevenueCat webhook received', { eventType: event.type })

    // Extract event data
    const eventType = event.type
    const appUserId = event.event?.app_user_id
    const productId = event.event?.product_id
    // const entitlementIds = event.event?.entitlement_ids || [] // Unused
    const expirationDate = event.event?.expiration_at_ms
    const isTrialConversion = event.event?.is_trial_conversion || false

    // Map product IDs to subscription tiers
    // Note: RevenueCat sends the actual product ID, not the package identifier
    const tierMapping: Record<string, 'free' | 'premium' | 'pro'> = {
      // Premium products
      [REVENUECAT_PRODUCTS.PREMIUM_MONTHLY]: 'premium',
      [REVENUECAT_PRODUCTS.PREMIUM_YEARLY]: 'premium',
      // Pro products
      [REVENUECAT_PRODUCTS.PRO_MONTHLY]: 'pro',
      [REVENUECAT_PRODUCTS.PRO_YEARLY]: 'pro',
      // Legacy package identifiers (for backwards compatibility)
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
            subscription_status: 'inactive',
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
    const supabase = createServiceRoleClient()
    const { error } = await supabase
      .from('users')
      .update(updates as never)
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
