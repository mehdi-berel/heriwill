import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkGlobalTriggerConditions } from '@/lib/services/globalTriggerService'

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
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[CRON] Starting trigger check at', new Date().toISOString())

    // Get all users with active global triggers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: users, error: usersError } = await (supabase
      .from('users') as any)
      .select('id, email, full_name, global_trigger_method, global_trigger_settings, last_activity, global_scheduled_date')
      .not('global_trigger_method', 'is', null)
      .eq('is_active', true)

    if (usersError) {
      console.error('[CRON] Error fetching users:', usersError)
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
          console.log(`[CRON] Trigger condition met for user ${user.id} (${user.email})`)
          
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
        console.error(`[CRON] Error checking user ${user.id}:`, error)
        results.failed++
      }
    }

    console.log('[CRON] Check complete:', results)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })
  } catch (error) {
    console.error('[CRON] Fatal error:', error)
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
