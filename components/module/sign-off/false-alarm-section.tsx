"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCcw, CheckCircle } from "lucide-react"

interface FalseAlarmSectionProps {
  userId: string
}

export function FalseAlarmSection({ userId }: FalseAlarmSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleFalseAlarm = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/false-alarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setShowModal(false)
        alert('False alarm declared successfully. Your account has been restored.')
        router.refresh()
      } else {
        const errorMsg = data.error || 'Failed to declare false alarm'
        console.error('API Error:', data)
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('Error declaring false alarm:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to declare false alarm. Please try again.'
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/10 dark:to-red-950/10 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            <div className="flex-shrink-0 self-center md:self-start">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30">
                <AlertTriangle className="h-7 w-7 md:h-8 md:w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
                <h3 className="text-lg md:text-xl font-bold text-text-primary">
                  Inheritance Plan Triggered
                </h3>
                <span className="px-2.5 py-1 md:px-2 md:py-0.5 text-xs font-semibold bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-4 md:mb-6 leading-relaxed">
                Your inheritance plan has been activated. All heirs have been notified and granted access to your vaults. If this was triggered by mistake, you can declare a false alarm to restore your account.
              </p>
              <button
                onClick={() => setShowModal(true)}
                disabled={saving}
                className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCcw className="h-4 w-4 md:h-5 md:w-5" />
                Declare False Alarm
              </button>
              <div className="mt-3 md:mt-4 p-3 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/50 rounded-lg">
                <p className="text-xs text-orange-800 dark:text-orange-200 flex items-start gap-2">
                  <span className="text-orange-600 dark:text-orange-400">ℹ️</span>
                  <span>Declaring a false alarm will revoke heir access to your vaults and restore your account to normal operation.</span>
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
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  Declare False Alarm
                </h3>
                <p className="text-sm text-gray-400">
                  Restore your account to normal
                </p>
              </div>
            </div>

            <div className="mb-5 md:mb-6">
              <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">
                Are you sure you want to declare a false alarm?
              </p>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 md:p-4">
                <p className="text-sm font-semibold text-orange-400 mb-2">
                  This will:
                </p>
                <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Revoke heir access to your vaults</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Cancel the inheritance trigger</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Notify all heirs about the false alarm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Restore your account to normal operation</span>
                  </li>
                </ul>
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
                onClick={handleFalseAlarm}
                disabled={saving}
                className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-sm md:text-base font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 md:order-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-5 w-5" />
                    Confirm False Alarm
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
