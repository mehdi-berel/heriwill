"use client"

import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationList } from './notification-list'
import { getUnreadCount } from '@/lib/services/notificationService'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'

export function NotificationsBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Initial load on mount
  useEffect(() => {
    getUnreadCount().then(setUnreadCount).catch((error) => {
      logger.error('Error loading unread count', error)
    })
  }, [])

  // Load unread count - memoized to prevent recreating on every render
  const loadUnreadCount = useCallback(async () => {
    const count = await getUnreadCount()
    setUnreadCount(count)
  }, [])

  useEffect(() => {
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          void loadUnreadCount()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          void loadUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadUnreadCount])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <NotificationList onNotificationRead={loadUnreadCount} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
