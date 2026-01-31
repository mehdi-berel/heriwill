"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Bell } from "lucide-react"

interface HeirNotificationSectionProps {
  notificationFrequency: number
  verificationThreshold: number
}

export function HeirNotificationSection({ 
  notificationFrequency, 
  verificationThreshold 
}: HeirNotificationSectionProps) {
  return (
    <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/10 dark:to-emerald-950/10 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
              <Bell className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xl font-bold text-text-primary">
                Heir Notification Detection Configured
              </h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-green-500/20 text-green-700 dark:text-green-300 rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              Your heirs will be periodically asked to confirm your status. If enough heirs confirm you're deceased, the inheritance plan will trigger.
            </p>
            <div className="bg-gradient-to-br from-green-100/80 to-emerald-100/80 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-5 border border-green-200/50 dark:border-green-800/50 space-y-4">
              <div>
                <p className="text-xs font-semibold text-green-900 dark:text-green-200 mb-2 uppercase tracking-wider">
                  Notification Frequency
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Every {notificationFrequency} {notificationFrequency === 1 ? 'day' : 'days'}
                </p>
              </div>
              <div className="border-t border-green-200/50 dark:border-green-800/50 pt-4">
                <p className="text-xs font-semibold text-green-900 dark:text-green-200 mb-2 uppercase tracking-wider">
                  Verification Threshold
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {verificationThreshold} {verificationThreshold === 1 ? 'heir' : 'heirs'} must confirm
                </p>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 flex items-start gap-2 pt-2">
                <span className="text-green-600 dark:text-green-400">🔔</span>
                <span>Your heirs will receive regular check-in notifications to verify your status.</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
