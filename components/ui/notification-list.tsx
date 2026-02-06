"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { 
  Bell, 
  Users, 
  Vault, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  CreditCard,
  Info,
  Trash2,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  type Notification,
  type NotificationType
} from '@/lib/services/notificationService'
import { logger } from '@/lib/utils/logger'

const notificationIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  heir_invitation: Users,
  inheritance_triggered: AlertTriangle,
  vault_shared: Vault,
  false_alarm: CheckCircle,
  heir_accepted: CheckCircle,
  heir_rejected: XCircle,
  subscription_update: CreditCard,
  system_alert: Info,
}

const notificationColors: Record<NotificationType, string> = {
  heir_invitation: 'text-blue-500',
  inheritance_triggered: 'text-red-500',
  vault_shared: 'text-green-500',
  false_alarm: 'text-yellow-500',
  heir_accepted: 'text-green-500',
  heir_rejected: 'text-gray-500',
  subscription_update: 'text-purple-500',
  system_alert: 'text-blue-500',
}

interface NotificationListProps {
  onNotificationRead?: () => void
}

export function NotificationList({ onNotificationRead }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadNotifications = async () => {
    try {
      const result = await getUserNotifications(false, false)
      setNotifications(result.data)
    } catch (error) {
      logger.error('Error loading notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id)
      onNotificationRead?.()
      loadNotifications()
    }

    // Navigate if action URL exists
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    onNotificationRead?.()
    loadNotifications()
  }

  const handleArchive = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await archiveNotification(notificationId)
    loadNotifications()
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading notifications...
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No new notifications</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {notifications.some(n => !n.is_read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <ScrollArea className="max-h-96">
        <div className="divide-y">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type]
            const iconColor = notificationColors[notification.type]
            const isPriority = notification.priority === 'high' || notification.priority === 'urgent'

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  p-4 cursor-pointer transition-colors hover:bg-accent
                  ${!notification.is_read ? 'bg-accent/50' : ''}
                  ${isPriority ? 'border-l-4 border-l-red-500' : ''}
                `}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">
                        {notification.title}
                        {!notification.is_read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => handleArchive(notification.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      {notification.action_label && (
                        <span className="text-xs text-primary font-medium">
                          {notification.action_label} →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
