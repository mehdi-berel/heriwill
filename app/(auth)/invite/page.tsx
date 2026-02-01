"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2, UserPlus, Gavel } from "lucide-react"
import { logger } from "@/lib/utils/logger"
import { validateEmail, validatePassword, validateFullName, sanitizeText } from "@/lib/utils/validation"

type InviteType = 'heir' | 'notary'

interface InviteData {
  type: InviteType
  inviterName: string
  inviterEmail: string
  inviterUserId?: string
  heirId?: string
  notaryId?: string
  email?: string
  fullName?: string
  expired: boolean
}

function InvitePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const loadInviteData = useCallback(async (code: string, type: InviteType) => {
    try {
      if (type === 'heir') {
        // Load heir invitation
        const result = await supabase
          .from('heirs')
          .select(`
            id,
            invitation_code,
            invitation_status,
            invitation_expires_at,
            email_encrypted,
            full_name_encrypted,
            user_id,
            users!heirs_user_id_fkey (
              full_name,
              email
            )
          `)
          .eq('invitation_code', code)
          .single()
        
        const heir = result.data as unknown as {
          id: string
          invitation_code: string
          invitation_status: string
          invitation_expires_at: string | null
          email_encrypted: string
          full_name_encrypted: string
          user_id: string
          users: { full_name: string; email: string } | null
        }
        const heirError = result.error

        if (heirError) throw heirError
        if (!heir) throw new Error('Invitation not found')

        // Check if expired
        const expired = heir.invitation_expires_at 
          ? new Date(heir.invitation_expires_at) < new Date()
          : false

        // Check if already accepted
        if (heir.invitation_status === 'accepted') {
          setError('This invitation has already been accepted')
          setLoading(false)
          return
        }

        if (heir.invitation_status === 'rejected') {
          setError('This invitation has been rejected')
          setLoading(false)
          return
        }

        setInviteData({
          type: 'heir',
          inviterName: heir.users?.full_name || 'Unknown',
          inviterEmail: heir.users?.email || '',
          heirId: heir.id,
          email: heir.email_encrypted || '',
          fullName: heir.full_name_encrypted || '',
          expired
        })

        // Pre-fill form if data exists
        setFormData(prev => ({
          ...prev,
          email: heir.email_encrypted || '',
          fullName: heir.full_name_encrypted || ''
        }))

      } else {
        // For notary invitations, redirect directly to notary registration page
        // No database tracking needed - just use the code as a reference
        router.push('/register-notary')
        return
      }

      setLoading(false)
    } catch (error) {
      logger.error('Failed to load invite data', error)
      setError('Failed to load invitation data')
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const code = searchParams.get('code')
    const type = searchParams.get('type') as InviteType

    if (!code || !type || (type !== 'heir' && type !== 'notary')) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    loadInviteData(code, type)
  }, [searchParams, loadInviteData])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    const nameValidation = validateFullName(formData.fullName)
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.error!
    }

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error!
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAcceptInvite = async () => {
    if (!validateForm()) return
    if (!inviteData) return

    setProcessing(true)
    setError(null)

    try {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: sanitizeText(formData.fullName.trim())
          },
          emailRedirectTo: 'https://app.heriwill.com'
        }
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Failed to create account')

      // Create user profile in public.users
      const { error: profileError } = await (supabase
        .from('users') as unknown as {
          insert: (data: unknown) => Promise<{ error: unknown }>
        })
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: sanitizeText(formData.fullName.trim()),
          email_verified: false
        })

      if (profileError) throw profileError

      if (inviteData.type === 'heir') {
        // Update heir record with user_id and mark as accepted
        const { error: heirUpdateError } = await (supabase
          .from('heirs') as unknown as {
            update: (data: unknown) => { eq: (column: string, value: string) => Promise<{ error: unknown }> }
          })
          .update({
            heir_user_id: authData.user.id,
            invitation_status: 'accepted',
            accepted_at: new Date().toISOString(),
            has_accepted: true
          })
          .eq('id', inviteData.heirId!)

        if (heirUpdateError) throw heirUpdateError

        logger.info('Heir invitation accepted', { 
          heirId: inviteData.heirId, 
          userId: authData.user.id 
        })

        // Redirect to heir dashboard or login
        setTimeout(() => {
          router.push('/login?message=Account created successfully. Please check your email to verify your account.')
        }, 2000)

      }
      // Note: Notary invitations redirect directly to /register-notary page
      // No handling needed here as they never reach this point

      setProcessing(false)

    } catch (error) {
      logger.error('Failed to accept invitation', error)
      setError('Failed to create account. Please try again.')
      setProcessing(false)
    }
  }

  const handleRejectInvite = async () => {
    if (!inviteData) return

    setProcessing(true)
    try {
      if (inviteData.type === 'heir') {
        const { error } = await (supabase
          .from('heirs') as unknown as {
            update: (data: unknown) => { eq: (column: string, value: string) => Promise<{ error: unknown }> }
          })
          .update({
            invitation_status: 'rejected',
            rejected_at: new Date().toISOString()
          })
          .eq('id', inviteData.heirId!)

        if (error) throw error

        logger.info('Heir invitation rejected', { heirId: inviteData.heirId })
      }

      router.push('/')
    } catch (error) {
      logger.error('Failed to reject invitation', error)
      setError('Failed to reject invitation')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#09090B' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#C084FC' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#09090B' }}>
        <Card className="w-full max-w-md border" style={{ borderColor: '#232629', backgroundColor: '#0C0C0E' }}>
          <CardHeader>
            <div className="flex items-center gap-2 text-status-error">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary mb-4">{error}</p>
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!inviteData) {
    return null
  }

  const InviteIcon = inviteData.type === 'heir' ? UserPlus : Gavel
  const inviteTitle = inviteData.type === 'heir' 
    ? 'Heir Invitation' 
    : 'Notary Invitation'
  const inviteDescription = inviteData.type === 'heir'
    ? `${inviteData.inviterName} has invited you to be their heir`
    : `${inviteData.inviterName} has invited you to be their notary`

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#09090B' }}>
      <Card className="w-full max-w-md border" style={{ borderColor: '#232629', backgroundColor: '#0C0C0E' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <InviteIcon className="h-6 w-6 text-primary-400" />
            <CardTitle>{inviteTitle}</CardTitle>
          </div>
          <CardDescription>{inviteDescription}</CardDescription>
          {inviteData.expired && (
            <div className="flex items-center gap-2 text-status-warning mt-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">This invitation has expired</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="John Doe"
              className={validationErrors.fullName ? 'border-status-error' : ''}
              disabled={inviteData.expired}
            />
            {validationErrors.fullName && (
              <div className="flex items-center gap-1 text-xs text-status-error">
                <AlertCircle className="h-3 w-3" />
                <span>{validationErrors.fullName}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
              className={validationErrors.email ? 'border-status-error' : ''}
              disabled={inviteData.expired}
            />
            {validationErrors.email && (
              <div className="flex items-center gap-1 text-xs text-status-error">
                <AlertCircle className="h-3 w-3" />
                <span>{validationErrors.email}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              className={validationErrors.password ? 'border-status-error' : ''}
              disabled={inviteData.expired}
            />
            {validationErrors.password && (
              <div className="flex items-center gap-1 text-xs text-status-error">
                <AlertCircle className="h-3 w-3" />
                <span>{validationErrors.password}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="••••••••"
              className={validationErrors.confirmPassword ? 'border-status-error' : ''}
              disabled={inviteData.expired}
            />
            {validationErrors.confirmPassword && (
              <div className="flex items-center gap-1 text-xs text-status-error">
                <AlertCircle className="h-3 w-3" />
                <span>{validationErrors.confirmPassword}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleRejectInvite}
              disabled={processing || inviteData.expired}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              onClick={handleAcceptInvite}
              disabled={processing || inviteData.expired}
              className="flex-1"
              style={{ backgroundColor: '#8B5CF6' }}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept & Create Account
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#09090B' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#C084FC' }} />
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  )
}
