"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Loader2, ExternalLink } from "lucide-react"
import { logger } from "@/lib/utils/logger"

interface NotaryInviteModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function NotaryInviteModal({ isOpen, onClose, userId }: NotaryInviteModalProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [invitationLink, setInvitationLink] = useState('')
  const [error, setError] = useState('')

  // Auto-generate link when modal opens
  useEffect(() => {
    if (isOpen && !invitationLink && !loading) {
      generateLink()
    }
  }, [isOpen])

  const generateInvitationCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let code = ''
    for (let i = 0; i < 32; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const generateLink = async () => {
    setLoading(true)
    setError('')
    try {
      const code = generateInvitationCode()
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      const url = `${baseUrl}/invite?code=${code}&type=notary`
      setInvitationLink(url)

      logger.info('Notary invitation link generated', { userId, code })
    } catch (error) {
      logger.error('Failed to generate notary invitation link', error)
      setError('Failed to generate invitation link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      logger.error('Failed to copy link', error)
    }
  }

  const handleClose = () => {
    setInvitationLink('')
    setCopied(false)
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notary Invitation Link</DialogTitle>
          <DialogDescription>
            Share this link with a notary to invite them to your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
              <p className="text-sm text-text-secondary">Generating invitation link...</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <p className="text-sm text-status-error">{error}</p>
              <Button
                onClick={generateLink}
                className="w-full bg-primary-500 hover:bg-primary-600"
              >
                Try Again
              </Button>
            </div>
          ) : invitationLink ? (
            <>
              <div className="space-y-2">
                <Label>Invitation Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={invitationLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-text-tertiary">
                  Share this link with the notary you want to invite
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(invitationLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Done
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
