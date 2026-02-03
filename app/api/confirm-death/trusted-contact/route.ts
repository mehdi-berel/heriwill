import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { confirmTrustedContactDeath } from '@/lib/services/globalTriggerService'
import { logger } from '@/lib/utils/logger'

// Service role client for admin operations
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * API endpoint for trusted contact to confirm death
 * Called when trusted contact clicks "Confirm Death" button
 */
export async function POST(request: NextRequest) {
  try {
    const { heirId, ownerUserId } = await request.json()

    if (!heirId || !ownerUserId) {
      return NextResponse.json(
        { error: 'Heir ID and Owner User ID are required' },
        { status: 400 }
      )
    }

    logger.info(`Trusted contact death confirmation initiated for heir ${heirId}`)

    // Verify the trusted contact relationship
    const result = await confirmTrustedContactDeath(heirId)

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          message: result.message || 'You are not authorized as the trusted contact'
        },
        { status: 403 }
      )
    }

    // If verification passed, trigger the inheritance plan
    if (result.triggered) {
      const supabase = createServiceRoleClient()

      // Call the trigger-inheritance endpoint logic
      const triggerResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.heriwill.com'}/api/trigger-inheritance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: ownerUserId,
          reason: 'Confirmed by trusted contact'
        })
      })

      if (!triggerResponse.ok) {
        logger.error('Failed to trigger inheritance plan')
        return NextResponse.json(
          {
            success: true,
            triggered: false,
            message: 'Confirmation recorded but failed to trigger inheritance plan'
          },
          { status: 500 }
        )
      }

      // Record the confirmation in inheritance_triggers table
      await supabase
        .from('inheritance_triggers')
        .insert({
          user_id: ownerUserId,
          trigger_metadata: {
            type: 'trusted_contact',
            confirmed_by_heir_id: heirId,
            confirmed_at: new Date().toISOString()
          },
          status: 'pending',
          requires_verification: false,
          triggered_at: new Date().toISOString()
        } as never)

      logger.info(`Inheritance plan triggered by trusted contact for user ${ownerUserId}`)

      return NextResponse.json({
        success: true,
        triggered: true,
        message: 'Death confirmed and inheritance plan triggered successfully'
      })
    }

    return NextResponse.json({
      success: true,
      triggered: false,
      message: 'Confirmation recorded'
    })
  } catch (error) {
    logger.error('Error in trusted contact death confirmation', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to process death confirmation'
      },
      { status: 500 }
    )
  }
}
