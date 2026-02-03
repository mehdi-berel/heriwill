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
    const { user_id, vault_id, title_encrypted, item_type, tags, metadata } = body

    if (!vault_id || !title_encrypted || !item_type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique storage path
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const storagePath = `${user_id}/${vault_id}/${timestamp}-${randomId}`

    const { data, error } = await supabase
      .from('vault_items')
      .insert({
        user_id,
        vault_id,
        title_encrypted,
        item_type,
        file_size: null,
        storage_path: storagePath,
        storage_bucket: 'vault-items',
        tags: tags || [],
        metadata: metadata || {},
        is_favorite: false
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating vault item', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Error in create vault item API', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create vault item' 
      },
      { status: 500 }
    )
  }
}
