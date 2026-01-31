"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface ScheduledDateSectionProps {
  scheduledDate: string
}

export function ScheduledDateSection({ scheduledDate }: ScheduledDateSectionProps) {
  return (
    <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30">
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xl font-bold text-text-primary">
                Scheduled Date Configured
              </h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              Your inheritance plan will automatically trigger on the date and time you specified.
            </p>
            <div className="bg-gradient-to-br from-blue-100/80 to-indigo-100/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-5 border border-blue-200/50 dark:border-blue-800/50">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2 uppercase tracking-wider">
                Trigger Date & Time
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                {new Date(scheduledDate).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">🕐</span>
                <span>The system will automatically activate your inheritance plan at this time.</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
