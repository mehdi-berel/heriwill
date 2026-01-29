"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Invalid or expired reset link. Please request a new one.")
      }
    })
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4 py-8">
      <Card className="w-full max-w-md shadow-2xl border-border-default/50">
        <CardHeader className="text-center space-y-6 pt-8 pb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-28 h-28 rounded-full bg-gradient-purple/10 flex items-center justify-center shadow-lg shadow-primary-600/20">
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
              <CardTitle className="text-3xl font-bold">Set New Password</CardTitle>
              <CardDescription className="text-base text-text-secondary">
                {success 
                  ? "Password updated successfully!"
                  : "Enter your new password below"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          {success ? (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-status-success/10 border-l-4 border-status-success">
                <CheckCircle className="h-5 w-5 text-status-success flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-status-success mb-1">Password updated!</p>
                  <p className="text-sm text-text-secondary">
                    Your password has been successfully reset. Redirecting to login...
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => router.push("/login")}
                className="w-full h-12 text-base font-semibold"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-status-error/10 border-l-4 border-status-error">
                  <AlertCircle className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-status-error flex-1">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="Enter new password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-background-secondary border-border-default focus:border-primary-500 transition-colors"
                    required
                    minLength={6}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                  <Input
                    id="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-background-secondary border-border-default focus:border-primary-500 transition-colors"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                    tabIndex={-1}
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 transition-all" 
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          )}
          
          <div className="mt-6 pt-6 border-t border-border-default text-center">
            <p className="text-sm text-text-secondary">
              Remember your password?{" "}
              <Link 
                href="/login" 
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
