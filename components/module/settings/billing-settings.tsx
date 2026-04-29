"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-gray-700">
        <CardHeader>
          <CardTitle>Open Source Version</CardTitle>
          <CardDescription>
            This is a self-hosted open source version with all features available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-gray-800/50 border rounded-lg" style={{ borderColor: '#232629' }}>
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">Full Access</p>
              <p className="text-sm text-text-tertiary">All features are available in your self-hosted instance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
