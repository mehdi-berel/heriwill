/**
 * Example: User-Based Rate Limiting
 * 
 * This example demonstrates how to implement user-based rate limiting
 * with different limits for different subscription tiers.
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RateLimitPresets, getUserTierFromRequest } from '@/lib/middleware/rateLimit'
import { logger } from '@/lib/utils/logger'

/**
 * Example 1: Simple user-based rate limiting
 * Uses the userApi preset which has tier-based limits
 */
export async function GET(request: NextRequest) {
  try {
    // Get user's subscription tier
    const userTier = await getUserTierFromRequest(request)
    
    // Apply rate limiting with tier-based limits
    // Free: 50 requests/15min, Premium: 200/15min, Pro: 500/15min
    const rateLimitResult = await rateLimit(RateLimitPresets.userApi)(request, userTier)
    
    if (rateLimitResult) {
      return rateLimitResult // Returns 429 if limit exceeded
    }
    
    // Your API logic here
    logger.info('API request processed', { userTier: userTier || 'anonymous' })
    
    return NextResponse.json({
      success: true,
      data: 'Your data here',
      tier: userTier || 'anonymous'
    })
  } catch (error) {
    logger.error('API request failed', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Example 2: Custom user-based rate limiting
 * Uses custom key generator to rate limit by user ID instead of IP
 */
export async function POST(request: NextRequest) {
  try {
    // Get user's subscription tier
    const userTier = await getUserTierFromRequest(request)
    
    // Custom rate limit with user ID as key
    const rateLimitResult = await rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 100, // Default
      tierLimits: {
        free: 50,      // Free users: 50 operations/hour
        premium: 200,  // Premium users: 200 operations/hour
        pro: 1000      // Pro users: 1000 operations/hour
      },
      message: 'Operation limit exceeded. Upgrade your plan for higher limits.',
      // Custom key generator: use user ID instead of IP
      keyGenerator: async (req) => {
        const authHeader = req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')
        
        if (!token) {
          // Fall back to IP for anonymous users
          const ip = req.headers.get('x-forwarded-for') || 'unknown'
          return `anon:${ip}`
        }
        
        // Use user ID for authenticated users
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { data: { user } } = await supabase.auth.getUser(token)
        return user ? `user:${user.id}` : `anon:unknown`
      }
    })(request, userTier)
    
    if (rateLimitResult) {
      return rateLimitResult
    }
    
    // Your operation logic here
    // const body = await request.json()
    logger.info('Operation processed', { userTier: userTier || 'anonymous' })
    
    return NextResponse.json({
      success: true,
      message: 'Operation completed',
      tier: userTier || 'anonymous'
    })
  } catch (error) {
    logger.error('Operation failed', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Example 3: Different limits for different endpoints
 * Shows how to apply different rate limits based on operation type
 */
export async function PUT(request: NextRequest) {
  try {
    const userTier = await getUserTierFromRequest(request)
    const { operationType } = await request.json()
    
    // Choose rate limit config based on operation type
    let rateLimitConfig
    
    switch (operationType) {
      case 'bulk_upload':
        // Stricter limits for bulk operations
        rateLimitConfig = {
          windowMs: 60 * 60 * 1000, // 1 hour
          maxRequests: 5, // Default
          tierLimits: {
            free: 2,      // Free: 2 bulk uploads/hour
            premium: 10,  // Premium: 10 bulk uploads/hour
            pro: 50       // Pro: 50 bulk uploads/hour
          },
          message: 'Bulk upload limit exceeded. Upgrade for more uploads.'
        }
        break
        
      case 'export':
        // Moderate limits for exports
        rateLimitConfig = {
          windowMs: 60 * 60 * 1000, // 1 hour
          maxRequests: 10, // Default
          tierLimits: {
            free: 5,      // Free: 5 exports/hour
            premium: 20,  // Premium: 20 exports/hour
            pro: 100      // Pro: 100 exports/hour
          },
          message: 'Export limit exceeded. Upgrade for more exports.'
        }
        break
        
      default:
        // Standard limits for regular operations
        rateLimitConfig = RateLimitPresets.userOperations
    }
    
    const rateLimitResult = await rateLimit(rateLimitConfig)(request, userTier)
    
    if (rateLimitResult) {
      return rateLimitResult
    }
    
    // Process the operation
    logger.info('Operation processed', { 
      operationType, 
      userTier: userTier || 'anonymous' 
    })
    
    return NextResponse.json({
      success: true,
      operationType,
      tier: userTier || 'anonymous'
    })
  } catch (error) {
    logger.error('Operation failed', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
