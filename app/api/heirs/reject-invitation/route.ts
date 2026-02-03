import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { notifyHeirRejected } from '@/lib/services/notificationService'

export async function POST(request: NextRequest) {
  try {
    const { invitationCode } = await request.json()

    if (!invitationCode) {
      return NextResponse.json(
        { success: false, error: 'Invitation code is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    logger.info('Rejecting heir invitation', { invitationCode, userId: user.id })

    // First, verify the invitation exists and is pending
    const { data: existingHeir, error: fetchError } = await supabase
      .from('heirs')
      .select('*')
      .eq('invitation_code', invitationCode)
      .eq('invitation_status', 'pending')
      .single()

    if (fetchError || !existingHeir) {
      logger.error('Invitation not found or already processed', fetchError)
      return NextResponse.json(
        { success: false, error: 'Invitation not found or already processed' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (existingHeir.invitation_expires_at && new Date(existingHeir.invitation_expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('heirs')
        .update({ invitation_status: 'expired' })
        .eq('id', existingHeir.id)

      return NextResponse.json(
        { success: false, error: 'This invitation has expired' },
        { status: 400 }
      )
    }

    // Update the invitation status to rejected
    // Use the service role or admin update to bypass RLS
    const { data: updatedHeir, error: updateError } = await supabase
      .from('heirs')
      .update({
        invitation_status: 'rejected',
        rejected_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', existingHeir.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Error updating heir invitation status', updateError, {
        heirId: existingHeir.id,
        errorCode: updateError.code,
        errorMessage: updateError.message
      })
      return NextResponse.json(
        { success: false, error: 'Failed to reject invitation: ' + updateError.message },
        { status: 500 }
      )
    }

    logger.info('Heir invitation rejected successfully', { heirId: updatedHeir.id })

    // Notify the owner that heir rejected
    try {
      const heirName = user.user_metadata?.full_name || user.email || 'An heir'
      await notifyHeirRejected(existingHeir.user_id, heirName)
    } catch (notificationError) {
      logger.error('Error creating heir rejected notification', notificationError)
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation rejected successfully',
      heir: updatedHeir
    })

  } catch (error) {
    logger.error('Unexpected error in reject-invitation API', error, {
      errorName: (error as Error).name,
      errorMessage: (error as Error).message
    })
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
