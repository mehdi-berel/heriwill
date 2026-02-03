"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Smartphone, CheckCircle } from "lucide-react"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

export function NotificationSettings() {
  const [formData, setFormData] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      security: true,
      updates: true
    }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const onNestedChange = (category: string, field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const onSave = async () => {
    setIsSaving(true)
    setSaveStatus('saving')
    try {
      // TODO: Implement notification preferences storage
      // Currently the users table doesn't have notification preference columns
      // These preferences could be stored in localStorage or a separate preferences table
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      logger.error('Save error', error)
      setSaveStatus('error')
      toast.error('Failed to save settings', 'Please try again')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }
  const notificationTypes = [
    {
      id: 'email',
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive notifications via email'
    },
    {
      id: 'push',
      icon: Bell,
      title: 'Push Notifications',
      description: 'Receive push notifications in your browser'
    },
    {
      id: 'sms',
      icon: Smartphone,
      title: 'SMS Notifications',
      description: 'Receive text messages for important updates'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card className="border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-400" />
            <CardTitle>Notification Channels</CardTitle>
          </div>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => {
            const Icon = type.icon
            return (
              <div key={type.id} className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium">{type.title}</p>
                    <p className="text-sm text-text-tertiary">{type.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => onNestedChange('notifications', type.id, !formData.notifications[type.id as keyof typeof formData.notifications])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.notifications[type.id as keyof typeof formData.notifications] ? 'bg-primary-500' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.notifications[type.id as keyof typeof formData.notifications] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )
          })}
          <div className="flex justify-end pt-4">
            <Button
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                'Saving...'
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
