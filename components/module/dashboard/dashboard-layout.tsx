"use client"

import { ReactNode } from "react"
import { Sidebar } from "../../layout/sidebar"
import { Header } from "../../layout/header"
import { MobileNav } from "../../layout/mobile-nav"

interface DashboardLayoutProps {
  children: ReactNode
  userName?: string
  onSignOut?: () => void
}

export function DashboardLayout({ children, userName, onSignOut }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar userName={userName} onSignOut={onSignOut} />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}
