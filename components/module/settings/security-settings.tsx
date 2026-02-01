"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key } from "lucide-react"

export function SecuritySettings() {

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card className="border-gray-700">
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
          <p className="text-sm text-text-secondary">
            To change your password, you&apos;ll be redirected to our secure password reset page where you can set a new password.
          </p>
          
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => window.location.href = '/reset-password'}
            >
              <Key className="h-4 w-4 mr-2" />
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
