"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ProfileSettings() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = profile as any
        setFormData({
          fullName: p.full_name || '',
          email: p.email || '',
          phone: p.phone || '',
          address: p.address || '',
          timezone: p.timezone || 'UTC',
          language: p.language || 'en',
          currency: p.currency || 'USD',
          dateFormat: p.date_format || 'MM/DD/YYYY',
          timeFormat: p.time_format || '12h'
        })
      }
    }
    loadProfile()
  }, [])

  const onInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const onSave = async () => {
    setIsSaving(true)
    setSaveStatus('saving')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('users') as any).update({
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        timezone: formData.timezone,
        language: formData.language,
        currency: formData.currency,
        date_format: formData.dateFormat,
        time_format: formData.timeFormat
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
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-400" />
            <CardTitle>Personal Information</CardTitle>
          </div>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => onInputChange('fullName', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => onInputChange('address', e.target.value)}
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your experience with language, timezone, and format settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => onInputChange('timezone', e.target.value)}
                className="w-full px-3 py-2 bg-background-secondary border border-border-default rounded-md"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => onInputChange('language', e.target.value)}
                className="w-full px-3 py-2 bg-background-secondary border border-border-default rounded-md"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => onInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 bg-background-secondary border border-border-default rounded-md"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <select
                id="dateFormat"
                value={formData.dateFormat}
                onChange={(e) => onInputChange('dateFormat', e.target.value)}
                className="w-full px-3 py-2 bg-background-secondary border border-border-default rounded-md"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {isSaving ? (
                'Saving...'
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
