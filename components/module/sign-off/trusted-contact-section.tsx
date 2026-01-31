"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

interface TrustedContactSectionProps {
  trustedContactHeirId: string
}

export function TrustedContactSection({ trustedContactHeirId }: TrustedContactSectionProps) {
  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xl font-bold text-text-primary">
                Trusted Contact Configured
              </h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              Your trusted contact can trigger your inheritance plan on your behalf.
            </p>
            <div className="bg-gradient-to-br from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-5 border border-purple-200/50 dark:border-purple-800/50">
              <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-2 uppercase tracking-wider">
                Trusted Contact
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                Contact ID: {trustedContactHeirId}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">🤝</span>
                <span>This person can confirm your passing and trigger the inheritance process.</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
