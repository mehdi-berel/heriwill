"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"
import { validateEmail, validateFullName, sanitizeText } from "@/lib/utils/validation"
import { Database } from "@/lib/database.types"

export function ProfileSettings() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
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
          const p = profile as Database['public']['Tables']['users']['Row']
          setFormData({
            fullName: p.full_name || '',
            email: p.email || ''
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
        updated_at: new Date().toISOString()
      }

      // Update auth.users metadata (display name)
      const authUpdateData: { data?: { full_name: string }, email?: string } = {
        data: {
          full_name: sanitizeText(formData.fullName.trim())
        }
      }

      // Only update email if it has changed
      if (formData.email !== user.email) {
        authUpdateData.email = formData.email
      }

      const { error: authUpdateError } = await supabase.auth.updateUser(authUpdateData)
      if (authUpdateError) throw authUpdateError

      // Update public.users table
      const { error } = await supabase
        .from('users')
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
      <Card className="border-gray-700">
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
          </div>
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
                'Save Changes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
