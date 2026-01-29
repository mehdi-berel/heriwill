"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"
import { validateEmail, validatePhone, validateFullName, validateTextField, sanitizeText } from "@/lib/utils/validation"

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        if (!user) return

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

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
      } catch (error) {
        logger.error('Failed to load profile', error)
      }
    }
    loadProfile()
  }, [])

  const onInputChange = (field: string, value: string) => {
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate full name
    const nameValidation = validateFullName(formData.fullName)
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.error!
    }

    // Validate email
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!
    }

    // Validate phone (optional)
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone)
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error!
      }
    }

    // Validate address (optional but with length limit)
    const addressValidation = validateTextField(formData.address, 'Address', { maxLength: 500 })
    if (!addressValidation.isValid) {
      errors.address = addressValidation.error!
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const onSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }

    setIsSaving(true)
    setSaveStatus('saving')
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')

      // Sanitize text inputs
      const sanitizedData = {
        full_name: sanitizeText(formData.fullName.trim()),
        phone: formData.phone ? sanitizeText(formData.phone.trim()) : null,
        address: formData.address ? sanitizeText(formData.address.trim()) : null,
        timezone: formData.timezone,
        language: formData.language,
        currency: formData.currency,
        date_format: formData.dateFormat,
        time_format: formData.timeFormat,
        updated_at: new Date().toISOString()
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('users') as any)
        .update(sanitizedData)
        .eq('id', user.id)

      if (error) throw error
      
      logger.info('Profile updated successfully', { userId: user.id })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      logger.error('Failed to save profile', error)
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
                className={validationErrors.fullName ? 'border-status-error' : ''}
              />
              {validationErrors.fullName && (
                <div className="flex items-center gap-1 text-xs text-status-error">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.fullName}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="john@example.com"
                className={validationErrors.email ? 'border-status-error' : ''}
              />
              {validationErrors.email && (
                <div className="flex items-center gap-1 text-xs text-status-error">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.email}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={validationErrors.phone ? 'border-status-error' : ''}
              />
              {validationErrors.phone && (
                <div className="flex items-center gap-1 text-xs text-status-error">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.phone}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => onInputChange('address', e.target.value)}
                placeholder="123 Main St, City, State"
                className={validationErrors.address ? 'border-status-error' : ''}
              />
              {validationErrors.address && (
                <div className="flex items-center gap-1 text-xs text-status-error">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.address}</span>
                </div>
              )}
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
                className="w-full px-3 py-2 bg-background-secondary border rounded-md"
                style={{ borderColor: '#232629' }}
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
                className="w-full px-3 py-2 bg-background-secondary border rounded-md"
                style={{ borderColor: '#232629' }}
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
                className="w-full px-3 py-2 bg-background-secondary border rounded-md"
                style={{ borderColor: '#232629' }}
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
                className="w-full px-3 py-2 bg-background-secondary border rounded-md"
                style={{ borderColor: '#232629' }}
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
