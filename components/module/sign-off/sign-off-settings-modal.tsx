"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getGlobalTrigger, saveGlobalTrigger } from "@/lib/services/globalTriggerService"

interface SignOffSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  method: string | null
  methodTitle: string
  userId: string
  onSave: () => void
}

export function SignOffSettingsModal({ 
  isOpen, 
  onClose, 
  method, 
  methodTitle,
  userId, 
  onSave 
}: SignOffSettingsModalProps) {
  const [loading, setLoading] = useState(false)
  const [heirs, setHeirs] = useState<any[]>([])
  
  const [inactivityDays, setInactivityDays] = useState('90')
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderDays, setReminderDays] = useState('7')
  
  const [trustedContactHeirId, setTrustedContactHeirId] = useState<string>('')
  
  const [scheduledDate, setScheduledDate] = useState<Date>()
  
  const [heirNotificationFrequency, setHeirNotificationFrequency] = useState('30')
  const [heirVerificationThreshold, setHeirVerificationThreshold] = useState('75')

  useEffect(() => {
    if (isOpen && method) {
      loadSettings()
      if (method === 'trusted_contact') {
        loadHeirs()
      }
    }
  }, [isOpen, method, userId])

  const loadSettings = async () => {
    try {
      const globalTrigger = await getGlobalTrigger(userId)

      if (globalTrigger) {
        const { global_trigger_settings, trusted_contact_heir_id, global_scheduled_date } = globalTrigger
        
        if (global_trigger_settings?.inactivity_days) {
          setInactivityDays(global_trigger_settings.inactivity_days.toString())
        }
        if (global_trigger_settings?.reminder_enabled) {
          setReminderEnabled(global_trigger_settings.reminder_enabled)
        }
        if (global_trigger_settings?.reminder_days_before) {
          setReminderDays(global_trigger_settings.reminder_days_before.toString())
        }
        if (trusted_contact_heir_id) {
          setTrustedContactHeirId(trusted_contact_heir_id)
        }
        if (global_scheduled_date) {
          setScheduledDate(new Date(global_scheduled_date))
        }
        if (global_trigger_settings?.heir_notification_frequency) {
          setHeirNotificationFrequency(global_trigger_settings.heir_notification_frequency.toString())
        }
        if (global_trigger_settings?.heir_verification_threshold) {
          setHeirVerificationThreshold(global_trigger_settings.heir_verification_threshold.toString())
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadHeirs = async () => {
    try {
      const { data } = await supabase
        .from('heirs')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      setHeirs(data || [])
    } catch (error) {
      console.error('Error loading heirs:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      let methodToSave: any = method
      if (method === 'scheduled_date') {
        methodToSave = 'scheduled'
      }

      const settingsToSave: any = {
        global_trigger_method: methodToSave,
        global_trigger_settings: {},
      }

      if (method === 'inactivity') {
        settingsToSave.global_trigger_settings = {
          inactivity_days: parseInt(inactivityDays),
          reminder_enabled: reminderEnabled,
          reminder_days_before: reminderEnabled ? parseInt(reminderDays) : undefined,
        }
      } else if (method === 'trusted_contact') {
        settingsToSave.trusted_contact_heir_id = trustedContactHeirId
      } else if (method === 'scheduled_date') {
        settingsToSave.global_scheduled_date = scheduledDate?.toISOString()
      } else if (method === 'heir_notification') {
        settingsToSave.global_trigger_settings = {
          heir_notification_frequency: parseInt(heirNotificationFrequency),
          heir_verification_threshold: parseInt(heirVerificationThreshold),
        }
      }

      await saveGlobalTrigger(userId, settingsToSave)

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!method) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure {methodTitle}</DialogTitle>
          <DialogDescription>
            Set up the parameters for your chosen detection method
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {method === 'inactivity' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="inactivity-days">Inactivity Period (days)</Label>
                <Input
                  id="inactivity-days"
                  type="number"
                  value={inactivityDays}
                  onChange={(e) => setInactivityDays(e.target.value)}
                  min="1"
                  max="365"
                />
                <p className="text-xs text-text-tertiary">
                  Trigger after this many days without account activity
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reminder Notifications</Label>
                  <p className="text-xs text-text-tertiary">
                    Send reminders before triggering
                  </p>
                </div>
                <Switch
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
              </div>

              {reminderEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="reminder-days">Reminder Days Before</Label>
                  <Input
                    id="reminder-days"
                    type="number"
                    value={reminderDays}
                    onChange={(e) => setReminderDays(e.target.value)}
                    min="1"
                    max="30"
                  />
                </div>
              )}
            </>
          )}

          {method === 'trusted_contact' && (
            <div className="space-y-2">
              <Label htmlFor="trusted-contact">Select Trusted Contact</Label>
              <Select value={trustedContactHeirId} onValueChange={setTrustedContactHeirId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an heir as trusted contact" />
                </SelectTrigger>
                <SelectContent>
                  {heirs.map((heir) => (
                    <SelectItem key={heir.id} value={heir.id}>
                      {heir.full_name_encrypted || heir.email_encrypted}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-text-tertiary">
                This person will be able to confirm your passing
              </p>
            </div>
          )}

          {method === 'scheduled_date' && (
            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Select Date and Time</Label>
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={scheduledDate ? scheduledDate.toISOString().slice(0, 16) : ''}
                onChange={(e) => setScheduledDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
              <p className="text-xs text-text-tertiary">
                The inheritance plan will trigger on this date
              </p>
            </div>
          )}

          {method === 'heir_notification' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">Notification Frequency (days)</Label>
                <Input
                  id="notification-frequency"
                  type="number"
                  value={heirNotificationFrequency}
                  onChange={(e) => setHeirNotificationFrequency(e.target.value)}
                  min="1"
                  max="90"
                />
                <p className="text-xs text-text-tertiary">
                  How often to check with heirs
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-threshold">Verification Threshold (%)</Label>
                <Input
                  id="verification-threshold"
                  type="number"
                  value={heirVerificationThreshold}
                  onChange={(e) => setHeirVerificationThreshold(e.target.value)}
                  min="50"
                  max="100"
                />
                <p className="text-xs text-text-tertiary">
                  Percentage of heirs needed to confirm
                </p>
              </div>
            </>
          )}

          {method === 'manual_trigger' && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                With manual trigger, you will need to explicitly activate your inheritance plan when you're ready. 
                This gives you complete control over when the process begins.
              </p>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ Make sure someone knows how to access your account to trigger the plan if needed.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
