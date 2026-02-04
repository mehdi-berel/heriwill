import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { recordHeirDeathConfirmation } from '@/lib/services/globalTriggerService'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'
import { sanitizeApiError } from '@/lib/utils/error-handler'

export async function POST(request: NextRequest) {
  try {
    // Apply standard rate limiting
    const rateLimitResult = await rateLimit(RateLimitPresets.standard)(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const sanitized = sanitizeApiError(authError || new Error('Not authenticated'), { action: 'confirm_death_heir' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    const body = await request.json()
    const { heirId, ownerUserId, confirmed } = body

    if (!heirId || !ownerUserId || typeof confirmed !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify that the current user is the heir
    const { data: heirData, error: heirError } = await supabase
      .from('heirs')
      .select('*')
      .eq('id', heirId)
      .eq('heir_user_id', user.id)
      .eq('user_id', ownerUserId)
      .single()

    if (heirError || !heirData) {
      const sanitized = sanitizeApiError(heirError || new Error('Unauthorized'), { heirId, userId: user.id, action: 'verify_heir' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    if (confirmed) {
      // Record the confirmation
      const result = await recordHeirDeathConfirmation(ownerUserId, heirId)

      // If triggered, call the inheritance trigger API
      if (result.triggered) {
        try {
          const triggerResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/trigger-inheritance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: ownerUserId })
          })

          if (!triggerResponse.ok) {
            logger.error('Failed to trigger inheritance', null, { ownerUserId })
          }
        } catch (triggerError) {
          logger.error('Error triggering inheritance', triggerError, { ownerUserId })
        }
      }

      return NextResponse.json({
        success: true,
        triggered: result.triggered,
        confirmationProgress: result.confirmationProgress,
        message: result.triggered 
          ? 'Death confirmed. Inheritance plan has been triggered.' 
          : 'Death confirmation recorded. Waiting for other heirs to confirm.'
      })
    } else {
      // Heir denied the death - just log it for now
      logger.info('Heir denied death notification', { heirId, ownerUserId, userId: user.id })
      
      return NextResponse.json({
        success: true,
        triggered: false,
        message: 'Thank you for your response. The notification has been dismissed.'
      })
    }
  } catch (error) {
    const sanitized = sanitizeApiError(error, { action: 'confirm_death_heir' })
    return NextResponse.json(
      { success: false, message: sanitized.error },
      { status: sanitized.statusCode }
    )
  }
}
