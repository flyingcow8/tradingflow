"use client"

import { BarChart3 } from "lucide-react"
import { UserInfo } from "@/components/user-info"

export function TopNavbar() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <span className="ml-3 text-xl font-semibold text-gray-900 font-chinese">TradingFlow</span>
      </div>

      {/* User Info */}
      <UserInfo />
    </header>
  )
} 