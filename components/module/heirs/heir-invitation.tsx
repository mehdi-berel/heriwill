"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  Copy, 
  CheckCircle,
  QrCode,
  Share2
} from "lucide-react"
import { useState } from "react"

interface HeirInvitationProps {
  heirName: string
  heirEmail: string
  invitationCode: string
  invitationLink: string
  onClose: () => void
  onSendEmail?: () => void
  onShareLink?: () => void
}

export function HeirInvitation({ 
  heirName, 
  heirEmail, 
  invitationCode, 
  invitationLink,
  onClose,
  onSendEmail,
  onShareLink
}: HeirInvitationProps) {
  const [codeCopied, setCodeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(invitationCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(invitationLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>
        <CardTitle className="text-center text-xl sm:text-2xl">
          Invitation Sent Successfully!
        </CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          {heirName} has been invited to become your heir
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Heir Information */}
        <div className="p-4 bg-background-secondary rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Invitation sent to:</span>
          </div>
          <p className="text-base font-medium">{heirEmail}</p>
        </div>

        {/* Invitation Code */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Invitation Code</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-4 bg-background-secondary rounded-lg">
              <p className="text-2xl font-mono font-bold text-center tracking-wider">
                {invitationCode}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="h-14 w-14"
            >
              {codeCopied ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Invitation Link */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Invitation Link</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-background-secondary rounded-lg">
              <p className="text-sm font-mono truncate">
                {invitationLink}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="h-11 w-11"
            >
              {linkCopied ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {onSendEmail && (
              <Button
                variant="outline"
                onClick={onSendEmail}
                className="w-full h-11"
              >
                <Mail className="h-4 w-4 mr-2" />
                Resend Email
              </Button>
            )}
            {onShareLink && (
              <Button
                variant="outline"
                onClick={onShareLink}
                className="w-full h-11"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
            )}
          </div>
          <Button
            onClick={onClose}
            className="w-full h-11"
          >
            Done
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Next Steps:</strong> {heirName} will receive an email with instructions to accept the invitation. They can also use the invitation code or link above to join.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
