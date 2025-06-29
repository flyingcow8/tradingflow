"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { AuthGuard } from "@/components/auth-guard"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen bg-gray-50">
        <TopNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
} 