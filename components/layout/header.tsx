"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedbackButton } from "@/components/module/feedback/feedback-button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background-primary/80 backdrop-blur-xl" style={{ borderColor: '#232629' }}>
      <div className="flex h-14 items-center justify-end px-6">
        {/* Right side - Feedback, Help, and Inheritance links */}
        <div className="flex items-center gap-2">
          {/* Feedback Button */}
          <FeedbackButton />

          {/* Help Link */}
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
            asChild
          >
            <Link href="/help">
              <span>Help</span>
            </Link>
          </Button>

          {/* Inheritance Link */}
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
            asChild
          >
            <Link href="/inheritance">
              <span>Inheritance</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
