"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

export function FeedbackButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState("")
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      const response = await fetch("https://formsubmit.co/heriwill@pledgeandgrow.com", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setIsExpanded(false)
          setSubmitted(false)
          setMessage("")
        }, 2000)
      } else {
        const errorText = await response.text()
        logger.error('FormSubmit error', { errorText })
        toast.error('Failed to send feedback', 'Please try again')
      }
    } catch (error) {
      logger.error('Error submitting feedback', error)
      toast.error('Failed to send feedback', 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={formRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-9 w-9 md:w-auto p-0 md:px-3 flex items-center justify-center md:justify-start gap-0 md:gap-2 text-text-secondary hover:text-text-primary"
        onMouseEnter={() => setIsExpanded(true)}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Feedback"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="hidden md:inline">Feedback</span>
      </Button>

      {isExpanded && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 bg-black border rounded-lg shadow-lg p-4 z-50"
          style={{ borderColor: '#232629' }}
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-text-primary">Thank you!</p>
              <p className="text-xs text-text-secondary mt-1">We appreciate your feedback.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                name="message"
                placeholder="Share your thoughts, report a bug, or suggest a feature..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="resize-none border text-sm"
                style={{ borderColor: '#232629', backgroundColor: '#232629' }}
              />
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-tertiary">
                  Need help?{' '}
                  <a href="/help" className="text-primary-400 hover:text-primary-300 underline">
                    Contact us
                  </a>
                  {' '}or{' '}
                  <a href="/help" className="text-primary-400 hover:text-primary-300 underline">
                    see docs
                  </a>
                  .
                </p>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !message.trim()}
                  style={{ backgroundColor: '#232629' }}
                  className="border"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      <span>Send</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
