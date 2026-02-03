"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Power, AlertCircle, CheckCircle } from "lucide-react"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

interface ManualTriggerSectionProps{
  userId: string
}

export function ManualTriggerSection({ userId }: ManualTriggerSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleTrigger = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/trigger-inheritance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: 'manual_trigger' })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setShowModal(false)
        toast.success('Inheritance plan triggered successfully', 'Your heirs have been notified and granted access to your vaults')
        // Reload the page data without navigation
        window.location.reload()
      } else {
        const errorMsg = data.error || 'Failed to trigger inheritance plan'
        logger.error('API Error triggering inheritance', { data })
        throw new Error(errorMsg)
      }
    } catch (error) {
      logger.error('Error triggering plan', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to trigger inheritance plan. Please try again.'
      toast.error('Failed to trigger inheritance', errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card className="border-2 border-pink-500/30 bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-950/10 dark:to-purple-950/10 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            <div className="flex-shrink-0 self-center md:self-start">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30">
                <Power className="h-7 w-7 md:h-8 md:w-8 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
                <h3 className="text-lg md:text-xl font-bold text-text-primary">
                  Manual Trigger Active
                </h3>
                <span className="px-2.5 py-1 md:px-2 md:py-0.5 text-xs font-semibold bg-pink-500/20 text-pink-700 dark:text-pink-300 rounded-full">
                  Ready
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-4 md:mb-6 leading-relaxed">
                You have configured manual triggering. When you&apos;re ready to activate your inheritance plan, click the button below. This action will notify all your heirs and begin the inheritance process.
              </p>
              <button
                onClick={() => setShowModal(true)}
                disabled={saving}
                className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Power className="h-4 w-4 md:h-5 md:w-5" />
                Trigger Inheritance Plan Now
              </button>
              <div className="mt-3 md:mt-4 p-3 bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/50 dark:border-pink-800/50 rounded-lg">
                <p className="text-xs text-pink-800 dark:text-pink-200 flex items-start gap-2">
                  <span className="text-pink-600 dark:text-pink-400">⚠️</span>
                  <span>This action is permanent and will immediately activate your inheritance plan.</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-5 md:p-6 border border-gray-800 my-8">
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  Confirm Manual Trigger
                </h3>
                <p className="text-sm text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-5 md:mb-6">
              <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">
                Are you sure you want to manually trigger your inheritance plan?
              </p>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 md:p-4">
                <p className="text-sm font-semibold text-red-400 mb-2">
                  This will:
                </p>
                <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Notify all your heirs immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Grant them access to your vaults</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Begin the inheritance process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Mark your account for deletion in 30 days</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-400 mt-2 md:mt-3">
                  You will have 30 days to declare a false alarm if this was triggered by mistake.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 md:py-3 bg-gray-800 hover:bg-gray-700 text-white text-sm md:text-base font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed order-2 md:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleTrigger}
                disabled={saving}
                className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm md:text-base font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 md:order-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Triggering...
                  </>
                ) : (
                  <>
                    <Power className="h-5 w-5" />
                    Confirm Trigger
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
