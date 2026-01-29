import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkGlobalTriggerConditions } from '@/lib/services/globalTriggerService'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'

/**
 * Vercel Cron Job - Check Sign-Off Trigger Conditions
 * 
 * This endpoint is called hourly by Vercel Cron to check if any users
 * have met their death detection trigger conditions.
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-triggers",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (strict for cron jobs)
    const rateLimitResult = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 2, // Max 2 requests per minute
      message: 'Cron endpoint rate limit exceeded'
    })(request)
    
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // IMPORTANT: Require cron secret in production
    if (!cronSecret) {
      logger.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron access attempt', { 
        ip: request.headers.get('x-forwarded-for') || 'unknown' 
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Starting trigger check', { timestamp: new Date().toISOString() })

    // Get all users with active global triggers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: users, error: usersError } = await (supabase
      .from('users') as any)
      .select('id, email, full_name, global_trigger_method, global_trigger_settings, last_activity, global_scheduled_date')
      .not('global_trigger_method', 'is', null)
      .eq('is_active', true)

    if (usersError) {
      logger.error('Error fetching users for trigger check', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      )
    }

    const results = {
      checked: 0,
      triggered: 0,
      failed: 0,
      users: [] as Array<{ userId: string; triggered: boolean; method: string }>
    }

    // Check each user's trigger conditions
    for (const user of users || []) {
      try {
        results.checked++
        
        const shouldTrigger = await checkGlobalTriggerConditions(user.id)
        
        if (shouldTrigger) {
          logger.info('Trigger condition met for user', { userId: user.id, email: user.email })
          
          // Execute inheritance plan
          const { executeInheritancePlan } = await import('@/lib/services/inheritancePlanService')
          await executeInheritancePlan(user.id)
          
          results.triggered++
          results.users.push({
            userId: user.id,
            triggered: true,
            method: user.global_trigger_method
          })
        } else {
          results.users.push({
            userId: user.id,
            triggered: false,
            method: user.global_trigger_method
          })
        }
      } catch (error) {
        logger.error('Error checking user trigger', error, { userId: user.id })
        results.failed++
      }
    }

    logger.info('Trigger check complete', results)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })
  } catch (error) {
    logger.error('Fatal error in cron job', error)
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request)
}
