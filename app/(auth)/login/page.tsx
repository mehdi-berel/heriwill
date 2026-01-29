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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4 py-8">
      <Card className="w-full max-w-md shadow-2xl border-border-default/50">
        <CardHeader className="text-center space-y-6 pt-8 pb-6">
          {/* Logo Section */}
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
              <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-base text-text-secondary">
                Sign in to continue planning your digital legacy
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
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
