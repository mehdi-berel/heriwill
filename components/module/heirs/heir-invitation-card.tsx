"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Heart,
  CheckCircle,
  Clock,
  Mail,
  Phone
} from "lucide-react"

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

interface HeirInvitationCardProps {
  successor: Successor
  ownerName: string
  onAccept: () => void
  onDecline: () => void
  isAccepted?: boolean
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

export function HeirInvitationCard({ 
  successor, 
  ownerName,
  onAccept, 
  onDecline,
  isAccepted = false
}: HeirInvitationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">
                Successor Invitation
              </CardTitle>
              <CardDescription className="text-sm">
                From {ownerName}
              </CardDescription>
            </div>
          </div>
          {isAccepted && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/20 rounded-full">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Accepted</span>
            </div>
          )}
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
          <span>Invited on {formatDate(successor.invited_at)}</span>
        </div>

        {/* Information Box */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">What this means:</strong> {ownerName} has designated you as a successor to manage their digital legacy. You will have access to their vaults and assets according to their wishes after their passing.
          </p>
        </div>

        {/* Action Buttons */}
        {!isAccepted && successor.invitation_status === 'pending' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onDecline}
              className="w-full h-11"
            >
              Decline
            </Button>
            <Button
              onClick={onAccept}
              className="w-full h-11"
            >
              Accept Invitation
            </Button>
          </div>
        )}

        {isAccepted && (
          <div className="pt-4">
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <p className="text-sm text-center">
                You have accepted this invitation. You will be notified when access is granted according to {ownerName}'s instructions.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
