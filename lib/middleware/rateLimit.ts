/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse by limiting the number of requests
 * from a single IP address within a time window.
 * 
 * Uses in-memory storage for simplicity. For production with multiple
 * instances, consider using Redis or a similar distributed cache.
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  keyGenerator?: (request: NextRequest) => Promise<string> | string // Custom key generator for user-based limiting
  tierLimits?: {
    free?: number // Max requests for free tier users
    premium?: number // Max requests for premium tier users
    pro?: number // Max requests for pro tier users
  }
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// For production with multiple instances, use Redis
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 10 * 60 * 1000)

/**
 * Get client identifier from request
 * Uses IP address, falling back to a default if not available
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'
  
  // Include pathname to allow different limits per endpoint
  const pathname = new URL(request.url).pathname
  
  return `${ip}:${pathname}`
}

/**
 * Get max requests based on user tier
 */
function getMaxRequestsForTier(
  tier: string | undefined,
  config: RateLimitConfig
): number {
  if (!config.tierLimits || !tier) {
    return config.maxRequests
  }

  switch (tier.toLowerCase()) {
    case 'free':
      return config.tierLimits.free ?? config.maxRequests
    case 'premium':
      return config.tierLimits.premium ?? config.maxRequests
    case 'pro':
      return config.tierLimits.pro ?? config.maxRequests
    default:
      return config.maxRequests
  }
}

/**
 * Check if request should be rate limited
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userTier?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number; maxRequests: number }> {
  // Use custom key generator if provided, otherwise use IP-based
  const clientId = config.keyGenerator 
    ? await config.keyGenerator(request)
    : getClientId(request)
  
  const now = Date.now()
  const maxRequests = getMaxRequestsForTier(userTier, config)
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(clientId)
  
  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    }
    rateLimitStore.set(clientId, entry)
  }
  
  // Increment count
  entry.count++
  
  // Check if limit exceeded
  const allowed = entry.count <= maxRequests
  const remaining = Math.max(0, maxRequests - entry.count)
  
  if (!allowed) {
    logger.warn('Rate limit exceeded', {
      clientId,
      count: entry.count,
      maxRequests,
      userTier: userTier || 'anonymous',
      pathname: new URL(request.url).pathname
    })
  }
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    maxRequests
  }
}

/**
 * Rate limit middleware wrapper
 * Returns a function that can be used in API routes
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest, userTier?: string): Promise<NextResponse | null> => {
    const result = await checkRateLimit(request, config, userTier)
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
      
      return NextResponse.json(
        {
          error: config.message || 'Too many requests, please try again later.',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': result.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
          }
        }
      )
    }
    
    // Request allowed, return null to continue
    return null
  }
}

/**
 * Helper to get user tier from authenticated request
 */
export async function getUserTierFromRequest(request: NextRequest): Promise<string | undefined> {
  try {
    // Get auth token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) return undefined
    
    // Import supabase here to avoid circular dependencies
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return undefined
    
    // Get user's subscription tier from users table
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    
    return userData?.subscription_tier
  } catch (error) {
    logger.error('Failed to get user tier', error)
    return undefined
  }
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Very strict - for sensitive operations
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many requests. Please try again in 15 minutes.'
  },
  
  // Standard - for most API endpoints
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests. Please try again later.'
  },
  
  // Relaxed - for public endpoints
  relaxed: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300,
    message: 'Too many requests. Please try again later.'
  },
  
  // Webhooks - for external services
  webhook: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 1 per second average
    message: 'Webhook rate limit exceeded.'
  },
  
  // Authentication - for login/signup
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  
  // User-based API limits with tier support
  userApi: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // Default for anonymous/free
    tierLimits: {
      free: 50,
      premium: 200,
      pro: 500
    },
    message: 'API rate limit exceeded. Upgrade your plan for higher limits.'
  },
  
  // User-based data operations
  userOperations: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // Default for anonymous/free
    tierLimits: {
      free: 100,
      premium: 500,
      pro: 2000
    },
    message: 'Operation rate limit exceeded. Upgrade your plan for higher limits.'
  }
}

/**
 * Helper to add rate limit headers to successful responses
 */
export async function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest,
  config: RateLimitConfig,
  userTier?: string
): Promise<NextResponse> {
  const result = await checkRateLimit(request, config, userTier)
  
  response.headers.set('X-RateLimit-Limit', result.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
  
  return response
}
