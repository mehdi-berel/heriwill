"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectItem } from "@/components/ui/select"
import { Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getGlobalTriggerSettings, updateGlobalTrigger } from "@/app/actions/users"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

interface SignOffSettingsProps {
  method: string
  userId: string
  onSave: () => void
  onCancel: () => void
}

export function SignOffSettings({ method, userId, onSave, onCancel }: SignOffSettingsProps) {
  const [loading, setLoading] = useState(false)
  interface Heir {
    id: string
    full_name_encrypted?: string
    email_encrypted?: string
  }
  
  interface Notary {
    id: string
    name: string
    email: string
  }
  
  interface TrustedContact {
    id: string
    name: string
    type: 'heir' | 'notary'
  }
  
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([])
  
  // Inactivity settings
  const [inactivityDays, setInactivityDays] = useState('90')
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderDays, setReminderDays] = useState('7')
  
  // Trusted contact settings
  const [trustedContactHeirId, setTrustedContactHeirId] = useState<string>('')
  
  // Scheduled date settings
  const [scheduledDate, setScheduledDate] = useState<Date>()
  
  // Heir notification settings
  const [heirNotificationFrequency, setHeirNotificationFrequency] = useState('30')
  const [heirVerificationThreshold, setHeirVerificationThreshold] = useState('75')

  const loadSettings = useCallback(async () => {
    try {
      const globalTrigger = await getGlobalTriggerSettings(userId)

      if (globalTrigger) {
        const { trusted_contact_heir_id, global_scheduled_date } = globalTrigger
        const settings = globalTrigger.global_trigger_settings as Record<string, unknown> | null
        
        if (settings?.inactivity_days) {
          setInactivityDays(String(settings.inactivity_days))
        }
        if (settings?.reminder_enabled !== undefined) {
          setReminderEnabled(settings.reminder_enabled as boolean)
        }
        if (settings?.reminder_days_before) {
          setReminderDays(String(settings.reminder_days_before))
        }
        if (trusted_contact_heir_id) {
          setTrustedContactHeirId(trusted_contact_heir_id)
        }
        if (global_scheduled_date) {
          setScheduledDate(new Date(global_scheduled_date))
        }
        if (settings?.heir_notification_frequency) {
          setHeirNotificationFrequency(String(settings.heir_notification_frequency))
        }
        if (settings?.heir_verification_threshold) {
          setHeirVerificationThreshold(String(settings.heir_verification_threshold))
        }
      }
    } catch (error) {
      logger.error('Error loading settings', error, { userId })
    }
  }, [userId])

  const loadHeirs = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('heirs')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      setHeirs((data || []) as Heir[])
    } catch (error) {
      logger.error('Error loading heirs', error, { userId })
    }
  }, [userId])

  const loadNotaries = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('notaries')
        .select('*')
        .eq('user_id', userId)

      setNotaries(data || [])
    } catch (error) {
      logger.error('Error loading notaries', error, { userId })
    }
  }, [userId])

  const combineTrustedContacts = useCallback(() => {
    const contacts: TrustedContact[] = []
    
    heirs.forEach(heir => {
      contacts.push({
        id: heir.id,
        name: heir.full_name_encrypted || heir.email_encrypted || 'Unknown Heir',
        type: 'heir'
      })
    })
    
    notaries.forEach(notary => {
      contacts.push({
        id: notary.id,
        name: notary.name || notary.email || 'Unknown Notary',
        type: 'notary'
      })
    })
    
    setTrustedContacts(contacts)
  }, [heirs, notaries])

  useEffect(() => {
    loadSettings()
    if (method === 'trusted_contact') {
      loadHeirs()
      loadNotaries()
    }
  }, [method, loadSettings, loadHeirs, loadNotaries])

  useEffect(() => {
    combineTrustedContacts()
  }, [heirs, notaries, combineTrustedContacts])

  const handleSave = async () => {
    try {
      setLoading(true)

      let methodToSave = method
      if (method === 'scheduled_date') {
        methodToSave = 'scheduled'
      }

      const settingsToSave: {
        global_trigger_method: string
        global_trigger_settings?: Record<string, unknown>
        trusted_contact_heir_id?: string | null
        global_scheduled_date?: string | null
      } = {
        global_trigger_method: methodToSave,
      }

      if (method === 'inactivity') {
        settingsToSave.global_trigger_settings = {
          inactivity_days: parseInt(inactivityDays),
          reminder_enabled: reminderEnabled,
          reminder_days_before: reminderEnabled ? parseInt(reminderDays) : undefined,
        }
      } else if (method === 'trusted_contact') {
        settingsToSave.trusted_contact_heir_id = trustedContactHeirId
        settingsToSave.global_trigger_settings = {}
      } else if (method === 'scheduled_date') {
        settingsToSave.global_scheduled_date = scheduledDate?.toISOString()
        settingsToSave.global_trigger_settings = {}
      } else if (method === 'heir_notification') {
        settingsToSave.global_trigger_settings = {
          heir_notification_frequency: parseInt(heirNotificationFrequency),
          heir_verification_threshold: parseInt(heirVerificationThreshold),
        }
      } else {
        settingsToSave.global_trigger_settings = {}
      }

      await updateGlobalTrigger(userId, {
        method: settingsToSave.global_trigger_method,
        settings: settingsToSave.global_trigger_settings,
        scheduledDate: settingsToSave.global_scheduled_date ?? undefined,
        trustedContactHeirId: settingsToSave.trusted_contact_heir_id ?? undefined,
      })

      onSave()
    } catch (error) {
      logger.error('Error saving settings', error)
      toast.error('Failed to save settings', 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Detection Method</CardTitle>
        <CardDescription>
          Set up the parameters for your chosen detection method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {method === 'inactivity' && (
          <div className="space-y-4">
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
          </div>
        )}

        {method === 'trusted_contact' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trusted-contact">Select Trusted Contact</Label>
              <Select value={trustedContactHeirId} onValueChange={setTrustedContactHeirId}>
                <SelectItem value="">Choose a trusted contact</SelectItem>
                {trustedContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name} ({contact.type === 'heir' ? 'Heir' : 'Notary'})
                  </SelectItem>
                ))}
              </Select>
              <p className="text-xs text-text-tertiary">
                This person will be able to confirm your passing. You can choose from your heirs or notaries.
              </p>
            </div>
          </div>
        )}

        {method === 'scheduled_date' && (
          <div className="space-y-4">
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
          </div>
        )}

        {method === 'heir_notification' && (
          <div className="space-y-4">
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
          </div>
        )}

        {method === 'manual_trigger' && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              With manual trigger, you will need to explicitly activate your inheritance plan when you&apos;re ready. 
              This gives you complete control over when the process begins.
            </p>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Make sure someone knows how to access your account to trigger the plan if needed.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
