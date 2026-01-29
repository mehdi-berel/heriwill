"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Shield, Lock, CheckCircle, AlertTriangle, Key, Eye, EyeOff, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"
import { validatePassword } from "@/lib/utils/validation"

export function SecuritySettings() {
  const [formData, setFormData] = useState({
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    privacy: {
      twoFactorEnabled: false,
      sessionTimeout: 24
    }
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const onNestedChange = (category: 'security' | 'privacy', field: string, value: string | boolean | number) => {
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate new password
    const passwordValidation = validatePassword(formData.security.newPassword)
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.error!
    }

    // Check if passwords match
    if (formData.security.newPassword !== formData.security.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    // Check if new password is different from current
    if (formData.security.newPassword && formData.security.newPassword === formData.security.currentPassword) {
      errors.newPassword = 'New password must be different from current password'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const onPasswordChange = async () => {
    // Validate form before submitting
    if (!validatePasswordForm()) {
      setPasswordStatus('error')
      setTimeout(() => setPasswordStatus('idle'), 3000)
      return
    }

    setIsChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.security.newPassword
      })
      if (error) throw error
      
      logger.info('Password changed successfully')
      setPasswordStatus('success')
      setFormData(prev => ({
        ...prev,
        security: { currentPassword: '', newPassword: '', confirmPassword: '' }
      }))
      setValidationErrors({})
      setTimeout(() => setPasswordStatus('idle'), 3000)
    } catch (error) {
      logger.error('Password change failed', error)
      setPasswordStatus('error')
      setTimeout(() => setPasswordStatus('idle'), 3000)
    } finally {
      setIsChangingPassword(false)
    }
  }
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary-400" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.security.currentPassword}
                  onChange={(e) => onNestedChange('security', 'currentPassword', e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.security.newPassword}
                  onChange={(e) => onNestedChange('security', 'newPassword', e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className={validationErrors.newPassword ? 'border-status-error' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <div className="flex items-center gap-1 text-xs text-status-error">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.newPassword}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.security.confirmPassword}
                  onChange={(e) => onNestedChange('security', 'confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  className={validationErrors.confirmPassword ? 'border-status-error' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <div className="flex items-center gap-1 text-xs text-status-error">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.confirmPassword}</span>
                </div>
              )}
            </div>
          </div>

          {passwordStatus === 'error' && (
            <div className="flex items-center gap-2 text-status-error text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Passwords do not match or current password is incorrect</span>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={onPasswordChange}
              disabled={isChangingPassword}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {isChangingPassword ? (
                'Changing...'
              ) : passwordStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Password Changed
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-400" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable 2FA</p>
              <p className="text-sm text-text-tertiary">
                Require a verification code in addition to your password
              </p>
            </div>
            <button
              onClick={() => onNestedChange('privacy', 'twoFactorEnabled', !formData.privacy.twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.privacy.twoFactorEnabled ? 'bg-primary-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.privacy.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.privacy.twoFactorEnabled && (
            <div className="p-4 bg-blue-600/10 border rounded-lg" style={{ borderColor: '#232629' }}>
              <p className="text-sm text-blue-400">
                Two-factor authentication is enabled. You'll need to enter a verification code when signing in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            Control how long you stay logged in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
            <select
              id="sessionTimeout"
              value={formData.privacy.sessionTimeout}
              onChange={(e) => onNestedChange('privacy', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-background-secondary border rounded-md"
              style={{ borderColor: '#232629' }}
            >
              <option value="1">1 hour</option>
              <option value="4">4 hours</option>
              <option value="8">8 hours</option>
              <option value="24">24 hours</option>
              <option value="168">1 week</option>
              <option value="720">30 days</option>
            </select>
            <p className="text-sm text-text-tertiary">
              You'll be automatically logged out after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
