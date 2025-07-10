"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface Position {
  id: string
  stockCode: string
  stockName: string
  market: string
  quantity: number
  averageCost: number
  currency: string
  lastPrice?: number
}

interface DeletePositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  position: Position
  onConfirm: () => void
}

export function DeletePositionDialog({ open, onOpenChange, position, onConfirm }: DeletePositionDialogProps) {
  const { t } = useLanguage()

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'HKD' ? 'HK$' : '$'
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  const getMarketDisplayName = (market: string) => {
    switch (market) {
      case 'US':
        return 'US Market'
      case 'HK':
        return 'HK Market'
      default:
        return market
    }
  }

  const calculateTotalValue = () => {
    const currentPrice = position.lastPrice || position.averageCost
    return currentPrice * position.quantity
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center font-chinese">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            {t("confirmDelete")}
          </DialogTitle>
          <DialogDescription className="font-chinese">
            {t("deletePositionMessage")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-chinese">{t("symbol")}:</span>
              <span className="text-sm font-medium font-mono">
                {position.stockCode}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-chinese">{t("stockName")}:</span>
              <span className="text-sm font-medium font-chinese">
                {position.stockName}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-chinese">{t("market")}:</span>
              <Badge variant="outline" className="font-mono">
                {getMarketDisplayName(position.market)}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-chinese">{t("shares")}:</span>
              <span className="text-sm font-medium">
                {position.quantity.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-chinese">{t("averageCost")}:</span>
              <span className="text-sm font-medium">
                {formatCurrency(position.averageCost, position.currency)}
              </span>
            </div>

            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm font-medium text-gray-700 font-chinese">{t("totalValue")}:</span>
              <span className="text-sm font-bold">
                {formatCurrency(calculateTotalValue(), position.currency)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-chinese">
              {t("deletePositionWarning")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-chinese">
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="font-chinese">
            {t("confirmDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 