/**
 * Rate Limiting for Authentication Endpoints
 * Prevents brute force attacks on login/signup
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (use Redis in production)
const rateLimitStore: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  message?: string
}

/**
 * Rate limit middleware for authentication endpoints
 */
export async function rateLimitAuth(
  request: NextRequest,
  config: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many attempts. Please try again later.'
  }
): Promise<NextResponse | null> {
  // Get identifier (IP address + endpoint)
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  const endpoint = request.nextUrl.pathname
  const key = `${ip}:${endpoint}`
  
  const now = Date.now()
  const record = rateLimitStore[key]
  
  // Initialize or reset if window expired
  if (!record || record.resetTime < now) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + config.windowMs
    }
    return null // Allow request
  }
  
  // Increment count
  record.count++
  
  // Check if limit exceeded
  if (record.count > config.maxAttempts) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    
    return NextResponse.json(
      { 
        error: config.message,
        retryAfter: retryAfter
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxAttempts.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': record.resetTime.toString()
        }
      }
    )
  }
  
  return null // Allow request with headers
}

/**
 * Get rate limit status for an identifier
 */
export function getRateLimitStatus(ip: string, endpoint: string): {
  remaining: number
  resetTime: number
} {
  const key = `${ip}:${endpoint}`
  const record = rateLimitStore[key]
  
  if (!record || record.resetTime < Date.now()) {
    return {
      remaining: 5,
      resetTime: Date.now() + 15 * 60 * 1000
    }
  }
  
  return {
    remaining: Math.max(0, 5 - record.count),
    resetTime: record.resetTime
  }
}

/**
 * Clear rate limit for an identifier (e.g., after successful login)
 */
export function clearRateLimit(ip: string, endpoint: string): void {
  const key = `${ip}:${endpoint}`
  delete rateLimitStore[key]
}
