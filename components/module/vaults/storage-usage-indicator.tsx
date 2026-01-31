"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HardDrive, TrendingUp } from "lucide-react"
import { checkStorageLimit } from "@/lib/subscription-limits"

interface StorageUsageIndicatorProps {
  userId: string
}

export function StorageUsageIndicator({ userId }: StorageUsageIndicatorProps) {
  const [storageData, setStorageData] = useState<{
    currentUsageGB: number
    limitGB: number
    remainingGB: number
    tier: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const data = await checkStorageLimit(userId)
        setStorageData(data)
      } catch (error) {
        console.error('Error loading storage data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStorageData()
  }, [userId])

  if (loading || !storageData) {
    return null
  }

  const usagePercentage = (storageData.currentUsageGB / storageData.limitGB) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = usagePercentage >= 95

  return (
    <Card className={`border-2 ${
      isAtLimit 
        ? 'border-red-500/30 bg-red-50/50 dark:bg-red-950/10' 
        : isNearLimit 
        ? 'border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/10'
        : 'border-gray-200 dark:border-gray-800'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            isAtLimit 
              ? 'bg-red-500/20' 
              : isNearLimit 
              ? 'bg-orange-500/20'
              : 'bg-blue-500/20'
          }`}>
            <HardDrive className={`h-5 w-5 ${
              isAtLimit 
                ? 'text-red-600 dark:text-red-400' 
                : isNearLimit 
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text-primary">
                Storage Usage
              </h3>
              <span className="text-xs font-medium text-text-tertiary uppercase">
                {storageData.tier}
              </span>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={usagePercentage} 
                className={`h-2 ${
                  isAtLimit 
                    ? '[&>div]:bg-red-500' 
                    : isNearLimit 
                    ? '[&>div]:bg-orange-500'
                    : '[&>div]:bg-blue-500'
                }`}
              />
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  {storageData.currentUsageGB.toFixed(2)} GB used of {storageData.limitGB} GB
                </span>
                <span className={`font-semibold ${
                  isAtLimit 
                    ? 'text-red-600 dark:text-red-400' 
                    : isNearLimit 
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {storageData.remainingGB.toFixed(2)} GB remaining
                </span>
              </div>

              {isAtLimit && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-800 dark:text-red-200 flex items-start gap-2">
                    <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>Storage limit reached. Upgrade your plan to add more files.</span>
                  </p>
                </div>
              )}

              {isNearLimit && !isAtLimit && (
                <div className="mt-3 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md border border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-orange-800 dark:text-orange-200 flex items-start gap-2">
                    <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>You're running low on storage. Consider upgrading soon.</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
