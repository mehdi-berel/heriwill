"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface InactivitySectionProps {
  inactivityDays: number
}

export function InactivitySection({ inactivityDays }: InactivitySectionProps) {
  return (
    <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/10 dark:to-amber-950/10 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
          <div className="flex-shrink-0 self-center md:self-start">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/30">
              <Clock className="h-7 w-7 md:h-8 md:w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
              <h3 className="text-lg md:text-xl font-bold text-text-primary">
                Inactivity Detection Configured
              </h3>
              <span className="px-2.5 py-1 md:px-2 md:py-0.5 text-xs font-semibold bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-full">
                Monitoring
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-4 md:mb-6 leading-relaxed">
              Your inheritance plan will trigger if you don&apos;t log in for the specified period.
            </p>
            <div className="bg-gradient-to-br from-orange-100/80 to-amber-100/80 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl p-4 md:p-5 border border-orange-200/50 dark:border-orange-800/50">
              <p className="text-xs font-semibold text-orange-900 dark:text-orange-200 mb-2 uppercase tracking-wider">
                Inactivity Period
              </p>
              <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2 md:mb-3">
                {inactivityDays} {inactivityDays === 1 ? 'day' : 'days'}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400">💡</span>
                <span>Make sure to log in regularly to prevent automatic triggering.</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
