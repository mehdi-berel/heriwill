"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { sanitizeEmail } from "@/lib/utils/sanitize"

// Force dynamic rendering to avoid prerendering issues with Supabase
export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    // Check rate limit (3 attempts per 15 minutes for password reset)
    if (isRateLimited) {
      const now = Date.now()
      if (now < retryAfter) {
        const secondsLeft = Math.ceil((retryAfter - now) / 1000)
        setError(`Too many password reset attempts. Please try again in ${secondsLeft} seconds.`)
        setLoading(false)
        return
      } else {
        // Reset rate limit
        setIsRateLimited(false)
        setAttemptCount(0)
      }
    }

    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(email)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
      })

      if (error) throw error

      // Reset attempt count on success
      setAttemptCount(0)
      setIsRateLimited(false)
      setSuccess(true)
    } catch (error: unknown) {
      // Increment attempt count on failure
      const newAttemptCount = attemptCount + 1
      setAttemptCount(newAttemptCount)

      // Apply rate limit after 3 failed attempts (stricter for password reset)
      if (newAttemptCount >= 3) {
        setIsRateLimited(true)
        setRetryAfter(Date.now() + 15 * 60 * 1000) // 15 minutes
        setError("Too many password reset attempts. Please try again in 15 minutes.")
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to send reset email. Please try again."
        setError(`${errorMessage} (Attempt ${newAttemptCount}/3)`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#09090B' }}>
      <Card className="w-full max-w-md shadow-2xl border" style={{ borderColor: '#232629', backgroundColor: '#0C0C0E' }}>
        <CardHeader className="text-center space-y-6 pt-8 pb-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg border" style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF640', boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.2)' }}>
              <div className="relative w-20 h-20">
                <Image
                  src="/heriwill-transparent.png"
                  alt="Heriwill Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold" style={{ color: '#FAFAFA' }}>Reset Password</CardTitle>
              <CardDescription className="text-base" style={{ color: '#A1A1AA' }}>
                {success 
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive a password reset link"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          {success ? (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-status-success/10 border-l-4 border-status-success">
                <CheckCircle className="h-5 w-5 text-status-success flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-status-success mb-1">Email sent successfully!</p>
                  <p className="text-sm text-text-secondary">
                    We&apos;ve sent a password reset link to <strong>{email}</strong>. 
                    Please check your inbox and follow the instructions.
                  </p>
                </div>
              </div>

              {/* Back to Login Button */}
              <Button 
                onClick={() => router.push("/login")}
                className="w-full h-12 text-base font-semibold"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>

              {/* Resend Link */}
              <div className="text-center">
                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Didn&apos;t receive the email? Try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-status-error/10 border-l-4 border-status-error">
                  <AlertCircle className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-status-error flex-1">{error}</p>
                </div>
              )}
              
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 transition-colors"
                    style={{ backgroundColor: '#141417', borderColor: '#232629' }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold transition-all" 
                style={{ backgroundColor: '#8B5CF6', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}
                disabled={loading || !email.trim()}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              
              {/* Back to Login Link */}
              <div className="text-center">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
          
          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: '#232629' }}>
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Don&apos;t have an account?{" "}
              <Link 
                href="/signup" 
                className="font-semibold transition-colors"
                style={{ color: '#C084FC' }}
              >
                Create account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
