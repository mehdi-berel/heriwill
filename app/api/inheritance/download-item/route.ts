import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
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
      const sanitized = sanitizeApiError(authError || new Error('Not authenticated'), { action: 'download_item' })
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

    // Get item details
    const { data: itemData, error: itemError } = await supabase
      .from('vault_items')
      .select('*, vaults!inner(user_id)')
      .eq('id', itemId)
      .single()

    if (itemError || !itemData) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      )
    }

    const vaultOwnerId = (itemData.vaults as { user_id: string }).user_id

    // Verify user is an heir with access
    const { data: heirData } = await supabase
      .from('heirs')
      .select('user_id')
      .eq('heir_user_id', user.id)
      .eq('user_id', vaultOwnerId)
      .eq('is_active', true)

    if (!heirData || heirData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      )
    }

    // Check for completed inheritance trigger
    const { data: triggerData } = await supabase
      .from('inheritance_triggers')
      .select('user_id')
      .eq('user_id', vaultOwnerId)
      .eq('status', 'completed')
      .single()

    if (!triggerData) {
      return NextResponse.json(
        { success: false, message: 'No inheritance access' },
        { status: 403 }
      )
    }

    // Prepare item data for download
    const downloadData = {
      title: itemData.title_encrypted,
      type: itemData.item_type,
      metadata: itemData.metadata,
      tags: itemData.tags,
      is_favorite: itemData.is_favorite,
      created_at: itemData.created_at,
      updated_at: itemData.updated_at,
      downloaded_at: new Date().toISOString()
    }

    const jsonString = JSON.stringify(downloadData, null, 2)
    const fileName = `${itemData.item_type}_${itemData.title_encrypted?.replace(/[^a-z0-9]/gi, '_') || 'item'}.json`

    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
  } catch (error) {
    const sanitized = sanitizeApiError(error, { action: 'download_item' })
    return NextResponse.json(
      { 
        success: false, 
        message: sanitized.error 
      },
      { status: sanitized.statusCode }
    )
  }
}
