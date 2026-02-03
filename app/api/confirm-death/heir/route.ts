import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { recordHeirDeathConfirmation } from '@/lib/services/globalTriggerService'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
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
      logger.error('Heir verification failed', heirError, { heirId, userId: user.id })
      return NextResponse.json(
        { success: false, message: 'You are not authorized to confirm this' },
        { status: 403 }
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
    logger.error('Error in heir death confirmation', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to process confirmation' 
      },
      { status: 500 }
    )
  }
}
