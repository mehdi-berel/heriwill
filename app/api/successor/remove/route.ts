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
      logger.error('Heir verification failed', heirError, { heirId, userId: user.id })
      return NextResponse.json(
        { success: false, message: 'You are not authorized to remove this successor role' },
        { status: 403 }
      )
    }

    // Delete the heir record
    const { error: deleteError } = await supabase
      .from('heirs')
      .delete()
      .eq('id', heirId)
      .eq('heir_user_id', user.id)

    if (deleteError) {
      logger.error('Error deleting heir record', deleteError, { heirId })
      return NextResponse.json(
        { success: false, message: 'Failed to remove successor role' },
        { status: 500 }
      )
    }

    logger.info('Successor role removed', { heirId, userId: user.id })

    return NextResponse.json({
      success: true,
      message: 'Successor role removed successfully'
    })
  } catch (error) {
    logger.error('Error in remove successor', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to remove successor role' 
      },
      { status: 500 }
    )
  }
}
