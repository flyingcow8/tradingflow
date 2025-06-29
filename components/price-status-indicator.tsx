"use client"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"

interface PriceStatusIndicatorProps {
  hasRealTimePrice: boolean
  lastPrice?: number
  averageCost: number
  currency: string
}

export function PriceStatusIndicator({ 
  hasRealTimePrice, 
  lastPrice, 
  averageCost, 
  currency 
}: PriceStatusIndicatorProps) {
  const { t } = useLanguage()
  
  if (!hasRealTimePrice) {
    return (
      <Badge variant="secondary" className="text-xs font-chinese">
        {t("costPrice")}
      </Badge>
    )
  }

  const changePercent = lastPrice && averageCost ? 
    ((lastPrice - averageCost) / averageCost * 100) : 0

  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <Badge 
        variant={changePercent >= 0 ? "default" : "destructive"} 
        className="text-xs font-chinese"
      >
        {t("realTime")} {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
      </Badge>
    </div>
  )
} 