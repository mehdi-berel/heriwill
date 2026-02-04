import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'
import { sanitizeApiError } from '@/lib/utils/error-handler'

export async function POST(request: NextRequest) {
  try {
    // Apply standard rate limiting
    const rateLimitResult = await rateLimit(RateLimitPresets.userOperations)(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const sanitized = sanitizeApiError(authError || new Error('Not authenticated'), { action: 'delete_vault_item' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    const body = await request.json()
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership before delete
    const { data: existingItem, error: fetchError } = await supabase
      .from('vault_items')
      .select('user_id')
      .eq('id', itemId)
      .single()

    if (fetchError || !existingItem) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      )
    }

    if (existingItem.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You do not own this item' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('vault_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (error) {
      const sanitized = sanitizeApiError(error, { itemId, userId: user.id, action: 'delete_vault_item' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const sanitized = sanitizeApiError(error, { action: 'delete_vault_item' })
    return NextResponse.json(
      { 
        success: false, 
        message: sanitized.error 
      },
      { status: sanitized.statusCode }
    )
  }
}
