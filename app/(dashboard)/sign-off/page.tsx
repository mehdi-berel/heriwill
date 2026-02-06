"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignOffMethodSelector } from "@/components/module/sign-off/sign-off-method-selector"
import { SignOffSettingsModal } from "@/components/module/sign-off/sign-off-settings-modal"
import { ManualTriggerSection } from "@/components/module/sign-off/manual-trigger-section"
import { InactivitySection } from "@/components/module/sign-off/inactivity-section"
import { TrustedContactSection } from "@/components/module/sign-off/trusted-contact-section"
import { HeirNotificationSection } from "@/components/module/sign-off/heir-notification-section"
import { ScheduledDateSection } from "@/components/module/sign-off/scheduled-date-section"
import { FalseAlarmSection } from "@/components/module/sign-off/false-alarm-section"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Users, Bell, Calendar, Hand, AlertCircle, Power } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/utils/toast"
import { logger } from "@/lib/utils/logger"
import { supabase } from "@/lib/supabase"
import { getGlobalTriggerSettings, deleteGlobalTriggerSettings, getInheritanceStatus } from "@/app/actions/users"
import { User } from "@supabase/supabase-js"
import { LucideIcon } from "lucide-react"

interface SignOffMethod {
  id: string
  title: string
  description: string
  icon: LucideIcon
  color: string
}

const DETECTION_METHODS: SignOffMethod[] = [
  {
    id: 'inactivity',
    title: 'Inactivity Detection',
    description: 'Trigger after a period of no account activity',
    icon: Clock,
    color: '#3B82F6',
  },
  {
    id: 'trusted_contact',
    title: 'Trusted Contact',
    description: 'Designated person confirms your passing',
    icon: Users,
    color: '#8B5CF6',
  },
  {
    id: 'heir_notification',
    title: 'Heir Notification',
    description: 'Heirs verify and confirm your passing',
    icon: Bell,
    color: '#EF4444',
  },
  {
    id: 'scheduled_date',
    title: 'Scheduled Date',
    description: 'Trigger on a specific date and time',
    icon: Calendar,
    color: '#F59E0B',
  },
  {
    id: 'manual_trigger',
    title: 'Manual Trigger',
    description: 'You manually activate the inheritance process',
    icon: Hand,
    color: '#EC4899',
  },
]

export default function SignOffPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [activeMethod, setActiveMethod] = useState<string | null>(null)
  const [isActivated, setIsActivated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inheritanceTriggered, setInheritanceTriggered] = useState(false)
  const [triggerSettings, setTriggerSettings] = useState<{
    inactivityDays?: number
    trustedContactHeirId?: string
    notificationFrequency?: number
    verificationThreshold?: number
    scheduledDate?: string
  }>({})
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      // Load sign-off settings
      await loadSignOffSettings(user.id)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login")
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadSignOffSettings = async (userId: string) => {
    try {
      // Check if inheritance has been triggered
      const inheritanceData = await getInheritanceStatus(userId)
      if (inheritanceData) {
        setInheritanceTriggered(inheritanceData.inheritance_triggered || false)
      }

      const globalTrigger = await getGlobalTriggerSettings(userId)

      if (globalTrigger) {
        let method = globalTrigger.global_trigger_method
        if (method === 'scheduled') {
          method = 'scheduled_date' as typeof method
        }
        setSelectedMethod(method)
        setActiveMethod(method)
        setIsActivated(true)
        
        // Store settings for section components
        const settings = globalTrigger.global_trigger_settings as Record<string, unknown> || {}
        setTriggerSettings({
          inactivityDays: settings.inactivityDays as number,
          trustedContactHeirId: globalTrigger.trusted_contact_heir_id as string,
          notificationFrequency: settings.notificationFrequency as number,
          verificationThreshold: settings.verificationThreshold as number,
          scheduledDate: globalTrigger.global_scheduled_date as string
        })
      } else {
        setIsActivated(false)
      }
    } catch (error) {
      logger.error('Error loading sign-off settings', error, { userId })
      toast.error('Failed to load settings', 'Please refresh the page')
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
        {/* Show False Alarm Section if inheritance is triggered */}
        {inheritanceTriggered && user ? (
          <FalseAlarmSection />
        ) : (
          <>
            {/* Activation Toggle Card */}
            <Card className={isActivated ? "bg-green-50 dark:bg-green-950/20 border-green-500/50" : "bg-gray-50 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700"}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <Power className={`h-5 w-5 md:h-6 md:w-6 flex-shrink-0 ${isActivated ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      <Label className="text-base md:text-lg font-semibold">
                        {isActivated ? 'Sign-Off Plan Active' : 'Sign-Off Plan Inactive'}
                      </Label>
                    </div>
                    <p className="text-xs md:text-sm text-text-secondary">
                      {isActivated 
                        ? `Your inheritance plan will trigger using ${DETECTION_METHODS.find(m => m.id === activeMethod)?.title || 'the configured method'}` 
                        : 'Enable your sign-off plan to activate the inheritance trigger'}
                    </p>
                  </div>
                  <Switch
                    checked={isActivated}
                    onCheckedChange={async (checked) => {
                      if (!user) return

                      if (!checked) {
                        // Deactivate - delete the trigger
                        setSaving(true)
                        try {
                          await deleteGlobalTriggerSettings(user.id)
                          setIsActivated(false)
                          setActiveMethod(null)
                        } catch (error) {
                          logger.error('Error deactivating trigger', error, { userId: user.id })
                          toast.error('Failed to deactivate', 'Please try again')
                        } finally {
                          setSaving(false)
                        }
                      } else {
                        // Activate - need to have a configured method
                        if (!activeMethod) {
                          toast.error('Please select and configure a detection method first')
                          return
                        }
                        // Reactivate the existing method
                        setSaving(true)
                        try {
                          await loadSignOffSettings(user.id)
                          setIsActivated(true)
                        } catch (error) {
                          logger.error('Error activating trigger', error, { userId: user.id, method: activeMethod })
                          toast.error('Failed to activate', 'Please try again')
                        } finally {
                          setSaving(false)
                        }
                      }
                    }}
                    disabled={saving || (!isActivated && !activeMethod)}
                    className="flex-shrink-0"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Show detection methods only if inheritance is NOT triggered */}
        {!inheritanceTriggered && (
          <>
            {/* Info Banner */}
            <Card className="bg-blue-600/5 border-blue-600/20">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">
                    Choose a method to detect when your inheritance plan should be activated. You can change this at any time.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Detection Methods */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-text-primary mb-3 md:mb-4">Detection Methods</h2>
              <SignOffMethodSelector
                methods={DETECTION_METHODS}
                selectedMethod={activeMethod}
                onMethodSelect={(methodId) => {
                  setSelectedMethod(methodId)
                  setIsModalOpen(true)
                }}
              />
              
              {/* Active Method Section - Shows configuration details */}
              {isActivated && activeMethod && (
                <div className="mt-4 md:mt-6">
                  {activeMethod === 'manual_trigger' && user && (
                    <ManualTriggerSection userId={user.id} />
                  )}
                  {activeMethod === 'inactivity' && (
                    <InactivitySection inactivityDays={triggerSettings.inactivityDays || 30} />
                  )}
                  {activeMethod === 'trusted_contact' && (
                    <TrustedContactSection trustedContactHeirId={triggerSettings.trustedContactHeirId || ''} />
                  )}
                  {activeMethod === 'heir_notification' && (
                    <HeirNotificationSection 
                      notificationFrequency={triggerSettings.notificationFrequency || 7}
                      verificationThreshold={triggerSettings.verificationThreshold || 2}
                    />
                  )}
                  {activeMethod === 'scheduled_date' && (
                    <ScheduledDateSection scheduledDate={triggerSettings.scheduledDate || ''} />
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Settings Modal - Only show if not triggered */}
        {!inheritanceTriggered && (
          <SignOffSettingsModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedMethod(null)
            }}
            method={selectedMethod}
            methodTitle={DETECTION_METHODS.find(m => m.id === selectedMethod)?.title || ''}
            userId={user?.id || ''}
            onSave={async () => {
              if (!user) return
              setActiveMethod(selectedMethod)
              setIsActivated(true)
              await loadSignOffSettings(user.id)
            }}
          />
        )}
    </div>
  )
}
