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
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { sanitizeEmail } from "@/lib/utils/sanitize"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Check rate limit (5 attempts per 15 minutes)
    if (isRateLimited) {
      const now = Date.now()
      if (now < retryAfter) {
        const secondsLeft = Math.ceil((retryAfter - now) / 1000)
        setError(`Too many login attempts. Please try again in ${secondsLeft} seconds.`)
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      })

      if (error) throw error

      // Update last_activity and last_login timestamps
      if (data.user) {
        await supabase.from('users').update({
          last_activity: new Date().toISOString(),
          last_login: new Date().toISOString()
        }).eq('id', data.user.id)
      }

      // Reset attempt count on successful login
      setAttemptCount(0)
      setIsRateLimited(false)
      router.push("/")
    } catch (error: unknown) {
      // Increment attempt count on failed login
      const newAttemptCount = attemptCount + 1
      setAttemptCount(newAttemptCount)

      // Apply rate limit after 5 failed attempts
      if (newAttemptCount >= 5) {
        setIsRateLimited(true)
        setRetryAfter(Date.now() + 15 * 60 * 1000) // 15 minutes
        setError("Too many failed login attempts. Please try again in 15 minutes.")
      } else {
        const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again."
        setError(`${errorMessage} (Attempt ${newAttemptCount}/5)`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError("")
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })

      if (error) throw error
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Google sign-in failed. Please try again."
      setError(errorMessage)
    }
  }

  const handleLinkedInLogin = async () => {
    try {
      setError("")
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
      })

      if (error) throw error
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "LinkedIn sign-in failed. Please try again."
      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#09090B' }}>
      <Card className="w-full max-w-md shadow-2xl border" style={{ borderColor: '#232629', backgroundColor: '#0C0C0E' }}>
        <CardHeader className="text-center space-y-6 pt-10 pb-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-5">
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl border" style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF640', boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.3)' }}>
              <div className="relative w-24 h-24">
                <Image
                  src="/heriwill-transparent.png"
                  alt="Heriwill Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-4xl font-bold" style={{ color: '#FAFAFA' }}>
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base" style={{ color: '#A1A1AA' }}>
                Sign in to continue planning your digital legacy
              </CardDescription>
            </div>
            <div className="h-1 w-20 rounded-full" style={{ background: 'linear-gradient(to right, #8B5CF6, #9333EA)' }} />
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-status-error/10 border-l-4 border-status-error">
                <AlertCircle className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-status-error flex-1">{error}</p>
              </div>
            )}
            
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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
            
            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                <Input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 transition-colors"
                  style={{ backgroundColor: '#141417', borderColor: '#232629' }}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {isPasswordVisible ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold transition-all" 
              style={{ backgroundColor: '#8B5CF6', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}
              disabled={loading || !email.trim() || !password}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
            {/* Forgot Password Link */}
            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
          

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#232629' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ backgroundColor: '#0C0C0E', color: '#71717A' }}>Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 text-base font-medium transition-all"
              style={{ borderColor: '#232629' }}
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleLinkedInLogin}
              className="w-full h-12 text-base font-medium transition-all"
              style={{ borderColor: '#232629' }}
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Sign in with LinkedIn
            </Button>
          </div>
          
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
