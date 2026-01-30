"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function SyncSubscriptionButton() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setResult({ success: false, message: 'Not authenticated' })
        setSyncing(false)
        return
      }

      // Call sync endpoint
      const response = await fetch('/api/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({ 
          success: true, 
          message: `Synced! Tier: ${data.subscription.tier}` 
        })
        // Reload page to reflect changes
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setResult({ 
          success: false, 
          message: data.error || 'Sync failed' 
        })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: 'Network error' 
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSync}
        disabled={syncing}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {syncing ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Subscription from RevenueCat
          </>
        )}
      </Button>

      {result && (
        <div className={`flex items-center gap-2 text-sm p-2 rounded border border-gray-700 ${
          result.success 
            ? 'bg-green-500/10 text-green-400' 
            : 'bg-red-500/10 text-red-400'
        }`}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
