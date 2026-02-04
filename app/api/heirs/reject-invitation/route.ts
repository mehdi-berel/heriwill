import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { notifyHeirRejected } from '@/lib/services/notificationService'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'
import { sanitizeApiError } from '@/lib/utils/error-handler'

export async function POST(request: NextRequest) {
  try {
    // Apply standard rate limiting
    const rateLimitResult = await rateLimit(RateLimitPresets.standard)(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const { invitationCode } = await request.json()

    if (!invitationCode) {
      return NextResponse.json(
        { success: false, error: 'Invitation code is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const sanitized = sanitizeApiError(authError || new Error('Not authenticated'), { action: 'reject_invitation' })
      return NextResponse.json(
        { success: false, error: sanitized.error },
        { status: sanitized.statusCode }
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
      const sanitized = sanitizeApiError(fetchError || new Error('Invitation not found'), { invitationCode, userId: user.id, action: 'fetch_invitation' })
      return NextResponse.json(
        { success: false, error: sanitized.error },
        { status: sanitized.statusCode }
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
      const sanitized = sanitizeApiError(updateError, { heirId: existingHeir.id, userId: user.id, action: 'reject_invitation' })
      return NextResponse.json(
        { success: false, error: sanitized.error },
        { status: sanitized.statusCode }
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
    const sanitized = sanitizeApiError(error, { action: 'reject_invitation' })
    return NextResponse.json(
      { success: false, error: sanitized.error },
      { status: sanitized.statusCode }
    )
  }
}
