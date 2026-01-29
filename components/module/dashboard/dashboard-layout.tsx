"use client"

import { ReactNode } from "react"
import { Sidebar } from "../../layout/sidebar"
import { Header } from "../../layout/header"

interface DashboardLayoutProps {
  children: ReactNode
  userName?: string
  onSignOut?: () => void
}

export function DashboardLayout({ children, userName, onSignOut }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar userName={userName} onSignOut={onSignOut} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
