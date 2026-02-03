import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      logger.error('Authentication error in delete account', authError)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = user.id
    logger.info('Starting account deletion process', { userId })

    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete vault items first (they reference vaults)
    const { error: itemsError } = await supabase
      .from('vault_items')
      .delete()
      .eq('user_id', userId)
    
    if (itemsError) {
      logger.error('Error deleting vault items', itemsError, { userId })
    }

    // 2. Delete vaults
    const { error: vaultsError } = await supabase
      .from('vaults')
      .delete()
      .eq('user_id', userId)
    
    if (vaultsError) {
      logger.error('Error deleting vaults', vaultsError, { userId })
    }

    // 3. Delete heirs (both as owner and as heir)
    const { error: heirsError } = await supabase
      .from('heirs')
      .delete()
      .eq('user_id', userId)
    
    if (heirsError) {
      logger.error('Error deleting heirs as owner', heirsError, { userId })
    }

    const { error: heirUserError } = await supabase
      .from('heirs')
      .delete()
      .eq('heir_user_id', userId)
    
    if (heirUserError) {
      logger.error('Error deleting heir relationships', heirUserError, { userId })
    }

    // 4. Delete notaries
    const { error: notariesError } = await supabase
      .from('notaries')
      .delete()
      .eq('user_id', userId)
    
    if (notariesError) {
      logger.error('Error deleting notaries', notariesError, { userId })
    }

    // 5. Delete legal documents
    const { error: legalError } = await supabase
      .from('legal')
      .delete()
      .eq('created_by', userId)
    
    if (legalError) {
      logger.error('Error deleting legal documents', legalError, { userId })
    }

    // 6. Delete assets
    const { error: assetsError } = await supabase
      .from('assets')
      .delete()
      .eq('user_id', userId)
    
    if (assetsError) {
      logger.error('Error deleting assets', assetsError, { userId })
    }

    // 7. Delete notifications
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
    
    if (notificationsError) {
      logger.error('Error deleting notifications', notificationsError, { userId })
    }

    // 8. Delete audit logs
    const { error: auditError } = await supabase
      .from('audit_logs')
      .delete()
      .eq('user_id', userId)
    
    if (auditError) {
      logger.error('Error deleting audit logs', auditError, { userId })
    }

    // 9. Delete inheritance triggers
    const { error: triggersError } = await supabase
      .from('inheritance_triggers')
      .delete()
      .eq('user_id', userId)
    
    if (triggersError) {
      logger.error('Error deleting inheritance triggers', triggersError, { userId })
    }

    // 10. Delete user record from users table
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
    
    if (userError) {
      logger.error('Error deleting user record', userError, { userId })
    }

    // 11. Finally, delete the auth user (this will cascade delete related auth data)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteAuthError) {
      logger.error('Error deleting auth user', deleteAuthError, { userId })
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      )
    }

    logger.info('Account deleted successfully', { userId })

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Unexpected error in delete account', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
