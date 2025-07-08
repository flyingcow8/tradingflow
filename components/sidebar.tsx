"use client"

import { FileText, PieChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  const mainNavigation = [
    { name: t("portfolio"), icon: PieChart, href: "/" },
    { name: t("tradingRecords"), icon: FileText, href: "/trading-records" },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Navigation */}
      <nav className="flex-1 flex flex-col px-4 pt-8 pb-6">
        {/* Main Navigation */}
        <div className="space-y-2">
          {mainNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors font-chinese",
                  isActive
                    ? "bg-gray-100 text-gray-900 border border-gray-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-gray-900" : "text-gray-400")} />
                {item.name}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
