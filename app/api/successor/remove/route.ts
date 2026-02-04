import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
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
      const sanitized = sanitizeApiError(authError || new Error('Not authenticated'), { action: 'remove_successor' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    const body = await request.json()
    const { heirId } = body

    if (!heirId) {
      return NextResponse.json(
        { success: false, message: 'Heir ID is required' },
        { status: 400 }
      )
    }

    // Verify that the current user is the heir
    const { data: heirData, error: heirError } = await supabase
      .from('heirs')
      .select('*')
      .eq('id', heirId)
      .eq('heir_user_id', user.id)
      .single()

    if (heirError || !heirData) {
      const sanitized = sanitizeApiError(heirError || new Error('Unauthorized'), { heirId, userId: user.id, action: 'verify_successor' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    // Delete the heir record
    const { error: deleteError } = await supabase
      .from('heirs')
      .delete()
      .eq('id', heirId)
      .eq('heir_user_id', user.id)

    if (deleteError) {
      const sanitized = sanitizeApiError(deleteError, { heirId, userId: user.id, action: 'delete_successor' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    logger.info('Successor role removed', { heirId, userId: user.id })

    return NextResponse.json({
      success: true,
      message: 'Successor role removed successfully'
    })
  } catch (error) {
    const sanitized = sanitizeApiError(error, { action: 'remove_successor' })
    return NextResponse.json(
      { 
        success: false, 
        message: sanitized.error 
      },
      { status: sanitized.statusCode }
    )
  }
}
