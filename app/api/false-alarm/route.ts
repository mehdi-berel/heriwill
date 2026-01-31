import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { sendFalseAlarmEmail } from '@/lib/services/emailService'

/**
 * API endpoint to declare false alarm and restore account
 * Called when user realizes inheritance was triggered by mistake
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    logger.info(`False alarm declared for user ${userId}`)

    // 1. Verify user has inheritance triggered
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData, error: userError } = await (supabase
      .from('users')
      .select('inheritance_triggered, inheritance_triggered_at, full_name, email')
      .eq('id', userId)
      .single() as any)

    if (userError || !userData) {
      logger.error('User not found', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!userData.inheritance_triggered) {
      return NextResponse.json(
        { error: 'Inheritance has not been triggered for this user' },
        { status: 400 }
      )
    }

    // 2. Update user status - restore to normal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateUserError } = await (supabase
      .from('users')
      .update({
        inheritance_triggered: false,
        inheritance_triggered_at: null,
      })
      .eq('id', userId) as any)

    if (updateUserError) {
      logger.error('Error updating user status', updateUserError)
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
    }

    // 3. Get all user's vaults
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: vaults, error: vaultsError } = await (supabase
      .from('vaults')
      .select('id, name')
      .eq('user_id', userId) as any)

    if (vaultsError) {
      logger.error('Error fetching vaults', vaultsError)
    }

    // 4. Vaults remain as-is - no status to restore
    // Access control is managed via heir_vault_access table
    logger.info(`${vaults?.length || 0} vaults remain accessible to owner`)

    // 5. Cancel/update inheritance trigger records
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: triggerUpdateError } = await (supabase
      .from('inheritance_triggers')
      .update({ 
        status: 'cancelled',
        trigger_metadata: {
          cancelled_reason: 'false_alarm',
          cancelled_at: new Date().toISOString()
        }
      })
      .eq('user_id', userId)
      .eq('status', 'triggered') as any)

    if (triggerUpdateError) {
      logger.error('Error cancelling triggers', triggerUpdateError)
    }

    // 6. Get all heirs to notify them
    const { data: heirs, error: heirsError } = await (supabase
      .from('heirs')
      .select('id, email_encrypted, full_name_encrypted')
      .eq('user_id', userId)
      .eq('is_active', true))

    if (heirsError) {
      logger.error('Error fetching heirs', heirsError)
    }

    // 7. Send notification emails to heirs about false alarm
    if (heirs && heirs.length > 0) {
      for (const heir of heirs) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const heirData = heir as any
          // Note: email_encrypted needs to be decrypted before use
          logger.info(`Sending false alarm notification to heir`)
          
          await sendFalseAlarmEmail({
            heirEmail: heirData.email_encrypted, // TODO: Decrypt this
            heirName: heirData.full_name_encrypted || 'Heir', // TODO: Decrypt this
            ownerName: userData.full_name || 'Account Owner'
          })
        } catch (emailError) {
          logger.error(`Failed to send email to heir`, emailError)
        }
      }
    }

    logger.info(`False alarm successfully processed for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'False alarm declared successfully. Account restored.',
      vaultsRestored: vaults?.length || 0,
    })
  } catch (error) {
    logger.error('Error in false-alarm endpoint', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
