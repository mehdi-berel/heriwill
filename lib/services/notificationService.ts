import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import type { Json } from '@/lib/database.types'

export type NotificationType = 
  | 'heir_invitation'
  | 'inheritance_triggered'
  | 'vault_shared'
  | 'false_alarm'
  | 'heir_accepted'
  | 'heir_rejected'
  | 'subscription_update'
  | 'system_alert'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  action_url?: string
  action_label?: string
  is_read: boolean
  is_archived: boolean
  priority: NotificationPriority
  metadata?: Record<string, unknown>
  created_at: string
  read_at?: string
  archived_at?: string
  expires_at?: string
}

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  priority?: NotificationPriority
  metadata?: Record<string, unknown>
  expiresAt?: string
}

/**
 * Create an in-app notification for a user
 */
export async function createNotification(params: CreateNotificationParams): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('create_notification', {
      p_user_id: params.userId,
      p_type: params.type,
      p_title: params.title,
      p_message: params.message,
      p_action_url: params.actionUrl || undefined,
      p_action_label: params.actionLabel || undefined,
      p_priority: params.priority || 'normal',
      p_metadata: (params.metadata || {}) as Json
    })

    if (error) {
      logger.error('Error creating notification', error, { userId: params.userId, type: params.type })
      return null
    }

    logger.info('Notification created', { notificationId: data, userId: params.userId, type: params.type })
    return data as string
  } catch (error) {
    logger.error('Error creating notification', error, { userId: params.userId })
    return null
  }
}

/**
 * Get all notifications for current user
 */
export async function getUserNotifications(includeRead = false, includeArchived = false): Promise<Notification[]> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeRead) {
      query = query.eq('is_read', false)
    }

    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching notifications', error)
      return []
    }

    return (data || []) as Notification[]
  } catch (error) {
    logger.error('Error fetching notifications', error)
    return []
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('is_archived', false)

    if (error) {
      logger.error('Error getting unread count', error)
      return 0
    }

    return count || 0
  } catch (error) {
    logger.error('Error getting unread count', error)
    return 0
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId
    })

    if (error) {
      logger.error('Error marking notification as read', error, { notificationId })
      return false
    }

    return true
  } catch (error) {
    logger.error('Error marking notification as read', error, { notificationId })
    return false
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false)

    if (error) {
      logger.error('Error marking all notifications as read', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error marking all notifications as read', error)
    return false
  }
}

/**
 * Archive notification
 */
export async function archiveNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('archive_notification', {
      p_notification_id: notificationId
    })

    if (error) {
      logger.error('Error archiving notification', error, { notificationId })
      return false
    }

    return true
  } catch (error) {
    logger.error('Error archiving notification', error, { notificationId })
    return false
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      logger.error('Error deleting notification', error, { notificationId })
      return false
    }

    return true
  } catch (error) {
    logger.error('Error deleting notification', error, { notificationId })
    return false
  }
}

/**
 * Helper: Create heir invitation notification
 */
export async function notifyHeirInvitation(heirUserId: string, inviterName: string, invitationCode: string): Promise<void> {
  await createNotification({
    userId: heirUserId,
    type: 'heir_invitation',
    title: 'You have been invited as an heir',
    message: `${inviterName} has invited you to be an heir. Please review and accept the invitation.`,
    actionUrl: `/invite?code=${invitationCode}`,
    actionLabel: 'View Invitation',
    priority: 'high'
  })
}

/**
 * Helper: Create inheritance triggered notification
 */
export async function notifyInheritanceTriggered(heirUserId: string, ownerName: string): Promise<void> {
  await createNotification({
    userId: heirUserId,
    type: 'inheritance_triggered',
    title: 'Inheritance Plan Activated',
    message: `${ownerName}'s inheritance plan has been activated. You now have access to shared vaults.`,
    actionUrl: '/vaults',
    actionLabel: 'View Vaults',
    priority: 'urgent'
  })
}

/**
 * Helper: Create vault shared notification
 */
export async function notifyVaultShared(userId: string, vaultName: string, ownerName: string): Promise<void> {
  await createNotification({
    userId: userId,
    type: 'vault_shared',
    title: 'Vault Shared With You',
    message: `${ownerName} has shared the vault "${vaultName}" with you.`,
    actionUrl: '/vaults',
    actionLabel: 'View Vault',
    priority: 'normal'
  })
}

/**
 * Helper: Create false alarm notification
 */
export async function notifyFalseAlarm(heirUserId: string, ownerName: string): Promise<void> {
  await createNotification({
    userId: heirUserId,
    type: 'false_alarm',
    title: 'False Alarm Declared',
    message: `${ownerName} has declared a false alarm. The inheritance trigger has been cancelled.`,
    priority: 'normal'
  })
}

/**
 * Helper: Create heir accepted notification
 */
export async function notifyHeirAccepted(ownerUserId: string, heirName: string): Promise<void> {
  await createNotification({
    userId: ownerUserId,
    type: 'heir_accepted',
    title: 'Heir Invitation Accepted',
    message: `${heirName} has accepted your heir invitation.`,
    actionUrl: '/heirs',
    actionLabel: 'View Heirs',
    priority: 'normal'
  })
}

/**
 * Helper: Create heir rejected notification
 */
export async function notifyHeirRejected(ownerUserId: string, heirName: string): Promise<void> {
  await createNotification({
    userId: ownerUserId,
    type: 'heir_rejected',
    title: 'Heir Invitation Rejected',
    message: `${heirName} has declined your heir invitation.`,
    actionUrl: '/heirs',
    actionLabel: 'View Heirs',
    priority: 'normal'
  })
}
