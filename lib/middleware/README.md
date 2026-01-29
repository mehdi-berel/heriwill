# Rate Limiting Middleware

## Overview

This middleware protects API endpoints from abuse by limiting the number of requests from a single IP address within a time window.

## Features

- ✅ IP-based rate limiting
- ✅ Configurable time windows and request limits
- ✅ Standard HTTP 429 responses with Retry-After headers
- ✅ In-memory storage (suitable for single-instance deployments)
- ✅ Automatic cleanup of expired entries
- ✅ Structured logging for monitoring

## Usage

### Basic Usage

```typescript
import { rateLimit } from '@/lib/middleware/rateLimit'

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests'
  })(request)
  
  if (rateLimitResult) {
    return rateLimitResult // Returns 429 response
  }
  
  // Continue with your endpoint logic
  return NextResponse.json({ success: true })
}
```

### Using Presets

```typescript
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'

export async function POST(request: NextRequest) {
  // Use webhook preset (60 requests per minute)
  const rateLimitResult = rateLimit(RateLimitPresets.webhook)(request)
  
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  // Your logic here
}
```

## Available Presets

| Preset | Window | Max Requests | Use Case |
|--------|--------|--------------|----------|
| `strict` | 15 min | 5 | Sensitive operations (password reset, etc.) |
| `standard` | 15 min | 100 | Most API endpoints |
| `relaxed` | 15 min | 300 | Public endpoints |
| `webhook` | 1 min | 60 | External webhooks |
| `auth` | 15 min | 5 | Login/signup endpoints |
| `userApi` | 15 min | 50/200/500* | User API calls (tier-based) |
| `userOperations` | 1 hour | 100/500/2000* | User operations (tier-based) |

*Limits vary by subscription tier (free/premium/pro)

## Configuration Options

```typescript
interface RateLimitConfig {
  windowMs: number              // Time window in milliseconds
  maxRequests: number           // Maximum requests per window (default/anonymous)
  message?: string              // Custom error message
  skipSuccessfulRequests?: boolean  // Don't count successful requests
  skipFailedRequests?: boolean      // Don't count failed requests
  keyGenerator?: (request: NextRequest) => Promise<string> | string  // Custom key generator
  tierLimits?: {                // Tier-based limits
    free?: number               // Max requests for free tier
    premium?: number            // Max requests for premium tier
    pro?: number                // Max requests for pro tier
  }
}
```

## Response Headers

When rate limit is exceeded, the following headers are included:

- `Retry-After`: Seconds until the rate limit resets
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining (0 when limited)
- `X-RateLimit-Reset`: ISO timestamp when limit resets

## Production Considerations

### For Multi-Instance Deployments

The current implementation uses in-memory storage, which works for single-instance deployments. For production with multiple instances, consider using Redis:

```typescript
// Example with Redis (requires ioredis package)
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

async function checkRateLimit(clientId: string, config: RateLimitConfig) {
  const key = `ratelimit:${clientId}`
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, Math.ceil(config.windowMs / 1000))
  }
  
  return {
    allowed: current <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - current)
  }
}
```

### Monitoring

Rate limit events are logged with structured data:

```typescript
logger.warn('Rate limit exceeded', {
  clientId: 'ip:pathname',
  count: 101,
  maxRequests: 100,
  pathname: '/api/endpoint'
})
```

Set up alerts in your logging service (Sentry, LogRocket) to monitor:
- Frequent rate limit hits from same IP
- Unusual patterns indicating DDoS attempts
- Legitimate users hitting limits (may need adjustment)

## Examples

### Authentication Endpoint

```typescript
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'

export async function POST(request: NextRequest) {
  // Strict rate limiting for auth
  const rateLimitResult = rateLimit(RateLimitPresets.auth)(request)
  
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  // Login logic
  const { email, password } = await request.json()
  // ... authenticate user
}
```

### Public API Endpoint

```typescript
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'

export async function GET(request: NextRequest) {
  // Relaxed rate limiting for public data
  const rateLimitResult = rateLimit(RateLimitPresets.relaxed)(request)
  
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  // Return public data
  return NextResponse.json({ data: 'public info' })
}
```

### Custom Configuration

```typescript
import { rateLimit } from '@/lib/middleware/rateLimit'

export async function POST(request: NextRequest) {
  // Custom rate limit: 10 requests per 5 minutes
  const rateLimitResult = await rateLimit({
    windowMs: 5 * 60 * 1000,
    maxRequests: 10,
    message: 'You can only submit 10 forms per 5 minutes'
  })(request)
  
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  // Form submission logic
}
```

### User-Based Rate Limiting

```typescript
import { rateLimit, RateLimitPresets, getUserTierFromRequest } from '@/lib/middleware/rateLimit'

export async function GET(request: NextRequest) {
  // Get user's subscription tier
  const userTier = await getUserTierFromRequest(request)
  
  // Apply tier-based rate limiting
  // Free: 50 req/15min, Premium: 200/15min, Pro: 500/15min
  const rateLimitResult = await rateLimit(RateLimitPresets.userApi)(request, userTier)
  
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  // Your API logic
  return NextResponse.json({ success: true })
}
```

### Custom User-Based Limits

```typescript
import { rateLimit, getUserTierFromRequest } from '@/lib/middleware/rateLimit'

export async function POST(request: NextRequest) {
  const userTier = await getUserTierFromRequest(request)
  
  // Custom tier-based limits
  const rateLimitResult = await rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // Default for anonymous/free
    tierLimits: {
      free: 50,      // Free users: 50/hour
      premium: 200,  // Premium users: 200/hour
      pro: 1000      // Pro users: 1000/hour
    },
    message: 'Rate limit exceeded. Upgrade for higher limits.'
  })(request, userTier)
  
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  // Your logic here
}
```

### User ID-Based Rate Limiting

```typescript
import { rateLimit, getUserTierFromRequest } from '@/lib/middleware/rateLimit'

export async function POST(request: NextRequest) {
  const userTier = await getUserTierFromRequest(request)
  
  // Rate limit by user ID instead of IP
  const rateLimitResult = await rateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 100,
    tierLimits: {
      free: 50,
      premium: 200,
      pro: 1000
    },
    // Custom key generator using user ID
    keyGenerator: async (req) => {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      
      if (!token) {
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        return `anon:${ip}`
      }
      
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
  
  // Your logic here
}
```

## User-Based Rate Limiting

### How It Works

1. **Tier Detection**: The middleware extracts the user's subscription tier from their auth token
2. **Dynamic Limits**: Different limits are applied based on the user's tier
3. **Fallback**: Anonymous users get the default (lowest) limit
4. **Monetization**: Encourages upgrades by showing tier-specific limits

### Benefits

- **Fair Usage**: Premium users get higher limits
- **Monetization**: Incentivizes plan upgrades
- **Flexibility**: Different limits per tier and endpoint
- **User Experience**: Authenticated users aren't penalized by shared IPs

### Implementation Patterns

#### Pattern 1: Simple Tier-Based Limiting
```typescript
const userTier = await getUserTierFromRequest(request)
const rateLimitResult = await rateLimit(RateLimitPresets.userApi)(request, userTier)
```

#### Pattern 2: Custom Tier Limits
```typescript
const rateLimitResult = await rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 50,  // Default for free/anonymous
  tierLimits: {
    free: 50,
    premium: 200,
    pro: 1000
  }
})(request, userTier)
```

#### Pattern 3: User ID-Based (Not IP)
```typescript
const rateLimitResult = await rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 100,
  keyGenerator: async (req) => {
    // Use user ID instead of IP
    const user = await getUserFromRequest(req)
    return user ? `user:${user.id}` : `anon:${getIP(req)}`
  }
})(request, userTier)
```

### Subscription Tier Mapping

The middleware automatically maps subscription tiers:

| Database Value | Tier Used | Typical Limits |
|----------------|-----------|----------------|
| `free` | free | Lowest limits |
| `premium` | premium | Medium limits |
| `pro` | pro | Highest limits |
| `null` or missing | anonymous | Same as free |

### Error Response with Tier Info

When a user hits their limit:

```json
{
  "error": "API rate limit exceeded. Upgrade your plan for higher limits.",
  "retryAfter": 847
}
```

Headers include the tier-specific limit:
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-01-29T18:15:00.000Z
```

## Testing

### Test IP-Based Rate Limiting

```bash
# Make multiple requests quickly
for i in {1..10}; do
  curl http://localhost:3000/api/endpoint
done
```

You should see 429 responses after exceeding the limit.

### Test User-Based Rate Limiting

```bash
# With auth token (premium user)
for i in {1..250}; do
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    http://localhost:3000/api/endpoint
done
```

Premium users should get 200 requests before hitting limit.

## Security Notes

1. **IP Spoofing**: The middleware checks multiple headers (`x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`) to get the real IP. Ensure your reverse proxy/load balancer is configured correctly.

2. **Distributed Attacks**: In-memory storage won't protect against distributed attacks from multiple IPs. Consider additional protections like Cloudflare.

3. **Legitimate Users**: Use user-based rate limiting for authenticated endpoints to avoid penalizing users on shared IPs. Monitor tier-specific limits and adjust as needed.

4. **Bypass Protection**: Always combine rate limiting with other security measures (authentication, CSRF tokens, input validation).

## Troubleshooting

### Rate limits not working

1. Check that middleware is called before your endpoint logic
2. Verify IP detection is working (check logs)
3. Ensure time windows are configured correctly

### Too many false positives

1. Increase `maxRequests` or `windowMs`
2. Use user-based rate limiting for authenticated endpoints (already implemented)
3. Use `keyGenerator` to rate limit by user ID instead of IP
4. Whitelist known good IPs (e.g., monitoring services)

### Memory usage concerns

1. The cleanup interval runs every 10 minutes
2. Each entry is ~50 bytes (IP + pathname + count + timestamp)
3. For 10,000 unique clients: ~500KB memory
4. Consider Redis for larger scale

### User tier not detected

1. Verify auth token is in Authorization header
2. Check token format: `Bearer <token>`
3. Ensure user exists in `users` table with `subscription_tier` field
4. Check logs for "Failed to get user tier" errors
5. Test with `getUserTierFromRequest()` directly
