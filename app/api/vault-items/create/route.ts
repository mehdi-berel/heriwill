import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { rateLimit, RateLimitPresets } from '@/lib/middleware/rateLimit'
import { sanitizeApiError } from '@/lib/utils/error-handler'
import { validateFile, checkStorageQuota } from '@/lib/utils/fileValidation'

export async function POST(request: NextRequest) {
  try {
    // Apply user operations rate limiting
    const rateLimitResult = await rateLimit(RateLimitPresets.userOperations)(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const sanitized = sanitizeApiError(authError || new Error('Not authenticated'), { action: 'create_vault_item' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    const body = await request.json()
    const { vault_id, title_encrypted, item_type, tags, metadata, file } = body

    if (!vault_id || !title_encrypted || !item_type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user owns the vault before creating item
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .select('user_id')
      .eq('id', vault_id)
      .single()

    if (vaultError || !vault) {
      return NextResponse.json(
        { success: false, message: 'Vault not found' },
        { status: 404 }
      )
    }

    if (vault.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You do not own this vault' },
        { status: 403 }
      )
    }

    // Validate file if provided
    let fileSize: number | null = null
    if (file) {
      const validation = validateFile(
        { name: file.name, size: file.size, type: file.type },
        item_type
      )

      if (!validation.valid) {
        return NextResponse.json(
          { success: false, message: validation.error },
          { status: 400 }
        )
      }

      fileSize = validation.fileSize || null

      // Check storage quota
      if (fileSize) {
        const quotaCheck = await checkStorageQuota(supabase, user.id, fileSize)
        if (!quotaCheck.allowed) {
          return NextResponse.json(
            { success: false, message: quotaCheck.error },
            { status: 413 } // 413 Payload Too Large
          )
        }
      }
    }

    // Generate unique storage path using crypto
    const { randomUUID } = await import('crypto')
    const storagePath = `${user.id}/${vault_id}/${randomUUID()}`

    const { data, error } = await supabase
      .from('vault_items')
      .insert({
        user_id: user.id,
        vault_id,
        title_encrypted,
        item_type,
        file_size: fileSize,
        storage_path: storagePath,
        storage_bucket: 'vault-files',
        tags: tags || [],
        metadata: metadata || {},
        is_favorite: false
      })
      .select()
      .single()

    if (error) {
      const sanitized = sanitizeApiError(error, { vault_id, userId: user.id, action: 'create_vault_item' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const sanitized = sanitizeApiError(error, { action: 'create_vault_item' })
    return NextResponse.json(
      { success: false, message: sanitized.error },
      { status: sanitized.statusCode }
    )
  }
}
