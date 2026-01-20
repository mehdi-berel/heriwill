"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  CreditCard, 
  Smartphone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Key,
  Download,
  Upload,
  Trash2,
  Plus,
  Settings,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Users,
  Heart,
  Archive,
  LogOut
} from "lucide-react"

interface SettingsOverviewProps {
  userId: string
  profile: any
}

export function SettingsOverview({ userId, profile }: SettingsOverviewProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    timezone: profile?.timezone || 'UTC',
    language: profile?.language || 'en',
    currency: profile?.currency || 'USD',
    dateFormat: profile?.date_format || 'MM/DD/YYYY',
    timeFormat: profile?.time_format || '12h',
    notifications: {
      email: profile?.email_notifications ?? true,
      push: profile?.push_notifications ?? true,
      sms: profile?.sms_notifications ?? false,
      marketing: profile?.marketing_notifications ?? false,
      security: profile?.security_notifications ?? true,
      updates: profile?.update_notifications ?? true
    },
    privacy: {
      profileVisible: profile?.profile_visible ?? true,
      showEmail: profile?.show_email ?? false,
      showPhone: profile?.show_phone ?? false,
      twoFactorEnabled: profile?.two_factor_enabled ?? false,
      sessionTimeout: profile?.session_timeout ?? 24
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (category: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleSave = async (section: string) => {
    // In a real app, this would save to the database
    console.log(`Saving ${section}:`, formData)
    // Show success message
  }

  const handlePasswordChange = async () => {
    if (formData.security.newPassword !== formData.security.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    // In a real app, this would update the password
    console.log('Changing password')
    // Reset form
    setFormData(prev => ({
      ...prev,
      security: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }))
  }

  const handleExportData = () => {
    // In a real app, this would export user data
    console.log('Exporting user data')
  }

  const handleDeleteAccount = () => {
    // In a real app, this would delete the account
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    type="email"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('profile')}>
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.security.currentPassword}
                      onChange={(e) => handleNestedChange('security', 'currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.security.newPassword}
                      onChange={(e) => handleNestedChange('security', 'newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={formData.security.confirmPassword}
                    onChange={(e) => handleNestedChange('security', 'confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePasswordChange}>
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Two-Factor Authentication</span>
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.privacy.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <Button variant="outline">
                  {formData.privacy.twoFactorEnabled ? 'Manage' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Button
                    variant={formData.notifications.email ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNestedChange('notifications', 'email', !formData.notifications.email)}
                  >
                    {formData.notifications.email ? 'On' : 'Off'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Button
                    variant={formData.notifications.push ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNestedChange('notifications', 'push', !formData.notifications.push)}
                  >
                    {formData.notifications.push ? 'On' : 'Off'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Button
                    variant={formData.notifications.sms ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNestedChange('notifications', 'sms', !formData.notifications.sms)}
                  >
                    {formData.notifications.sms ? 'On' : 'Off'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                  </div>
                  <Button
                    variant={formData.notifications.marketing ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNestedChange('notifications', 'marketing', !formData.notifications.marketing)}
                  >
                    {formData.notifications.marketing ? 'On' : 'Off'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about security events</p>
                  </div>
                  <Button
                    variant={formData.notifications.security ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNestedChange('notifications', 'security', !formData.notifications.security)}
                  >
                    {formData.notifications.security ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('notifications')}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                  </div>
                  <Button
                    variant={formData.privacy.profileVisible ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNestedChange('privacy', 'profileVisible', !formData.privacy.profileVisible)}
                  >
                    {formData.privacy.profileVisible ? 'Public' : 'Private'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Email</p>
                    <p className="text-sm text-muted-foreground">Display email on your profile</p>
                  </div>
                  <Button
                    variant={formData.privacy.showEmail ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNestedChange('privacy', 'showEmail', !formData.privacy.showEmail)}
                  >
                    {formData.privacy.showEmail ? 'Visible' : 'Hidden'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Phone</p>
                    <p className="text-sm text-muted-foreground">Display phone number on your profile</p>
                  </div>
                  <Button
                    variant={formData.privacy.showPhone ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNestedChange('privacy', 'showPhone', !formData.privacy.showPhone)}
                  >
                    {formData.privacy.showPhone ? 'Visible' : 'Hidden'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Auto-logout after {formData.privacy.sessionTimeout} hours</p>
                  </div>
                  <select
                    value={formData.privacy.sessionTimeout}
                    onChange={(e) => handleNestedChange('privacy', 'sessionTimeout', parseInt(e.target.value))}
                    className="px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value={1}>1 hour</option>
                    <option value={6}>6 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={168}>1 week</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('privacy')}>
                  Save Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Preferences</span>
              </CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="CST">CST</option>
                    <option value="MST">MST</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date Format</label>
                  <select
                    value={formData.dateFormat}
                    onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Time Format</label>
                  <select
                    value={formData.timeFormat}
                    onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="12h">12-hour</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('preferences')}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                  <div>
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
