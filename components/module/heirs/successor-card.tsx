"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  User, 
  Heart,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  AlertTriangle,
  Shield
} from "lucide-react"
import { toast } from "@/lib/utils/toast"

interface Successor {
  id: string
  full_name: string
  email?: string
  phone?: string
  relationship?: string
  heir_type: 'family' | 'friend' | 'professional' | 'organization'
  invitation_status: 'pending' | 'accepted' | 'rejected' | 'expired'
  invited_at: string
}

interface SuccessorCardProps {
  successor: Successor
  ownerName: string
  ownerUserId: string
  isTrustedContact?: boolean
}

const heirTypeLabels = {
  family: 'Family',
  friend: 'Friend',
  professional: 'Professional',
  organization: 'Organization'
}

const heirTypeColors = {
  family: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  friend: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  professional: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  organization: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
}

export function SuccessorCard({ 
  successor, 
  ownerName,
  ownerUserId,
  isTrustedContact = false
}: SuccessorCardProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleConfirmDeath = async () => {
    setConfirming(true)
    try {
      const response = await fetch('/api/confirm-death/trusted-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          heirId: successor.id,
          ownerUserId 
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Death confirmation submitted successfully')
        setShowConfirmModal(false)
        if (data.triggered) {
          toast.info('Inheritance plan has been triggered')
        }
      } else {
        toast.error(data.message || 'Failed to confirm death')
      }
    } catch (error) {
      console.error('Error confirming death:', error)
      toast.error('Failed to submit confirmation')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Successor Role
                </CardTitle>
                <CardDescription className="text-sm">
                  For {ownerName}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/20 rounded-full">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Successor Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Your Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{successor.full_name}</p>
                </div>
              </div>
              
              {successor.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{successor.email}</p>
                  </div>
                </div>
              )}
              
              {successor.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{successor.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Heir Type & Relationship */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Relationship</h3>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${heirTypeColors[successor.heir_type]}`}>
                {heirTypeLabels[successor.heir_type]}
              </span>
              {successor.relationship && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{successor.relationship}</span>
                </>
              )}
            </div>
          </div>

          {/* Invitation Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Accepted on {formatDate(successor.invited_at)}</span>
          </div>

          {/* Status Information */}
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm text-center">
              You are a successor for {ownerName}. You will be notified when access is granted according to their instructions.
            </p>
          </div>

          {/* Trusted Contact Section */}
          {isTrustedContact && (
            <div className="space-y-3 pt-2">
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      You are the Trusted Contact
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      {ownerName} has designated you as their trusted contact. You can confirm their passing to trigger the inheritance plan.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowConfirmModal(true)}
                variant="outline"
                className="w-full h-11 border-amber-500/50 hover:bg-amber-500/10"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Confirm Death
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Death Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Death
            </DialogTitle>
            <DialogDescription>
              This is a serious action that will trigger the inheritance plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                ⚠️ Important Notice
              </p>
              <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                By confirming, you are declaring that <strong>{ownerName}</strong> has passed away. This will:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-red-800 dark:text-red-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>Trigger the inheritance plan immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>Notify all designated heirs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>Grant access to vaults and assets</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Are you absolutely certain that {ownerName} has passed away?
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={confirming}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDeath}
              disabled={confirming}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {confirming ? 'Confirming...' : 'Yes, Confirm Death'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
