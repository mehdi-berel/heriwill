import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
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
    const { itemId, title_encrypted, item_type, tags, metadata } = body

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, unknown> = {}
    if (title_encrypted) updatePayload.title_encrypted = title_encrypted
    if (item_type) updatePayload.item_type = item_type
    if (tags) updatePayload.tags = tags
    if (metadata) updatePayload.metadata = metadata

    const { data, error } = await supabase
      .from('vault_items')
      .update(updatePayload)
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating vault item', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Error in update vault item API', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update vault item' 
      },
      { status: 500 }
    )
  }
}
