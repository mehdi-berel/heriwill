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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Update last_activity and last_login timestamps
      if (data.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('users') as any).update({
          last_activity: new Date().toISOString(),
          last_login: new Date().toISOString()
        }).eq('id', data.user.id)
      }

      router.push("/")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again."
      setError(errorMessage)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-gray-700">
        <CardHeader className="text-center space-y-6 pt-10 pb-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-5">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center shadow-xl shadow-primary-600/30 border border-primary-500/30">
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
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base text-text-secondary">
                Sign in to continue planning your digital legacy
              </CardDescription>
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" />
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
                  className="pl-12 h-12 bg-background-secondary border-border-default focus:border-primary-500 transition-colors"
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
                  className="pl-12 pr-12 h-12 bg-background-secondary border-border-default focus:border-primary-500 transition-colors"
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
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 transition-all" 
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
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background-primary text-text-tertiary">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-medium border-border-default hover:bg-background-secondary transition-all"
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
          
          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-border-default text-center">
            <p className="text-sm text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link 
                href="/signup" 
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
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
