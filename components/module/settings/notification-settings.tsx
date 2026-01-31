"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Smartphone, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('users') as any).update({
        email_notifications: formData.notifications.email,
        push_notifications: formData.notifications.push,
        sms_notifications: formData.notifications.sms,
        marketing_notifications: formData.notifications.marketing,
        security_notifications: formData.notifications.security,
        update_notifications: formData.notifications.updates
      }).eq('id', user.id)

      if (error) throw error
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('error')
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
