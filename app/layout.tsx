import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/contexts/language-context"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: "TradingFlow - 投资报表网站",
  description: "现代化的股票交易仪表板",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans`}>
        <Providers>
        <LanguageProvider>{children}</LanguageProvider>
        </Providers>
      </body>
    </html>
  )
}
