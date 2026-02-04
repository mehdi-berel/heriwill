import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'
import { sanitizeApiError } from '@/lib/utils/error-handler'
import { validateConfirmationCode } from '@/lib/utils/validation'

export async function DELETE(request: NextRequest) {
  try {
    // Apply strict rate limiting for account deletion
    const rateLimitResult = await rateLimit(RateLimitPresets.strict)(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      const sanitized = sanitizeApiError(authError || new Error('Not authenticated'), { action: 'delete_account' })
      return NextResponse.json(
        { error: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    // Get confirmation code from request body
    const body = await request.json().catch(() => ({}))
    const { confirmationCode } = body

    // Validate confirmation code
    const validation = validateConfirmationCode(confirmationCode, 'DELETE')
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const userId = user.id
    logger.info('Starting account deletion process', { userId, confirmed: true })

    // Execute all deletions in a transaction to ensure atomicity
    const { error: transactionError } = await (supabase.rpc as unknown as (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)(
      'delete_user_account',
      { target_user_id: userId }
    )

    if (transactionError) {
      logger.error('Transaction error during account deletion', transactionError, { userId })
      const sanitized = sanitizeApiError(transactionError, { userId, action: 'delete_account_transaction' })
      return NextResponse.json(
        { error: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    // 11. Finally, delete the auth user (this will cascade delete related auth data)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteAuthError) {
      const sanitized = sanitizeApiError(deleteAuthError, { userId, action: 'delete_auth_user' })
      return NextResponse.json(
        { error: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    logger.info('Account deleted successfully', { userId })

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    const sanitized = sanitizeApiError(error, { action: 'delete_account' })
    return NextResponse.json(
      { error: sanitized.error },
      { status: sanitized.statusCode }
    )
  }
}
