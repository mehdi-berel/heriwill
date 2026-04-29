import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import JSZip from 'jszip'
import { sanitizeApiError } from '@/lib/utils/error-handler'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const sanitized = sanitizeApiError(authError || new Error('Not authenticated'), { action: 'export_vault' })
      return NextResponse.json(
        { success: false, message: sanitized.error },
        { status: sanitized.statusCode }
      )
    }

    const body = await request.json()
    const { vaultId } = body

    if (!vaultId) {
      return NextResponse.json(
        { success: false, message: 'Vault ID is required' },
        { status: 400 }
      )
    }

    // Verify user is an heir with access to this vault
    const { data: heirData } = await supabase
      .from('heirs')
      .select('user_id')
      .eq('heir_user_id', user.id)
      .eq('is_active', true)

    if (!heirData || heirData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      )
    }

    const ownerIds = heirData.map(h => h.user_id)

    // Check for completed inheritance triggers
    const { data: triggersData } = await supabase
      .from('inheritance_triggers')
      .select('user_id')
      .in('user_id', ownerIds)
      .eq('status', 'completed')

    if (!triggersData || triggersData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No inheritance access' },
        { status: 403 }
      )
    }

    const triggeredOwnerIds = triggersData.map(t => t.user_id)

    // Get vault details
    const { data: vaultData, error: vaultError } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .in('user_id', triggeredOwnerIds)
      .single()

    if (vaultError || !vaultData) {
      return NextResponse.json(
        { success: false, message: 'Vault not found or not accessible' },
        { status: 404 }
      )
    }

    // Get all vault items
    const { data: itemsData, error: itemsError } = await supabase
      .from('vault_items')
      .select('*')
      .eq('vault_id', vaultId)

    if (itemsError) {
      logger.error('Error loading vault items for export', itemsError)
      return NextResponse.json(
        { success: false, message: 'Failed to load vault items' },
        { status: 500 }
      )
    }

    // Create ZIP file
    const zip = new JSZip()
    
    // Add vault metadata
    const vaultMetadata = {
      name: vaultData.name,
      description: vaultData.description,
      category: vaultData.category,
      created_at: vaultData.created_at,
      exported_at: new Date().toISOString(),
      total_items: itemsData?.length || 0
    }
    
    zip.file('vault-info.json', JSON.stringify(vaultMetadata, null, 2))

    // Add items to ZIP
    if (itemsData && itemsData.length > 0) {
      const itemsFolder = zip.folder('items')
      
      for (const item of itemsData) {
        const itemData = {
          title: item.title_encrypted,
          type: item.item_type,
          metadata: item.metadata,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
        
        const fileName = `${item.item_type}_${item.id}.json`
        itemsFolder?.file(fileName, JSON.stringify(itemData, null, 2))
      }
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // Return ZIP file
    return new NextResponse(Buffer.from(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${vaultData.name.replace(/[^a-z0-9]/gi, '_')}_export.zip"`
      }
    })
  } catch (error) {
    const sanitized = sanitizeApiError(error, { action: 'export_vault' })
    return NextResponse.json(
      { 
        success: false, 
        message: sanitized.error 
      },
      { status: sanitized.statusCode }
    )
  }
}
