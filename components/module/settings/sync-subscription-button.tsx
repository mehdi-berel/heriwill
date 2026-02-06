"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { userActions } from "@/app/actions/users"

export function SyncSubscriptionButton() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)

    try {
      const data = await userActions.syncSubscription()
      setResult({ 
        success: true, 
        message: `Synced! Tier: ${data.subscription.tier}` 
      })
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Sync failed' 
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
