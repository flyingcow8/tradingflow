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
import { AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface TradingRecord {
  id: string
  transactionDate: string
  market: string
  stockCode: string
  stockName: string
  transactionType: "BUY" | "SELL"
  quantity: number
  price: number
  currency: string
  commission: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: TradingRecord
  onConfirm: () => void
}

export function DeleteConfirmDialog({ open, onOpenChange, record, onConfirm }: DeleteConfirmDialogProps) {
  const { t } = useLanguage()

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'HKD' ? 'HK$' : '$'
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  const getLocalizedType = (type: "BUY" | "SELL") => {
    return type === "BUY" ? t("buy") : t("sell")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  const calculateAmount = (quantity: number, price: number) => {
    return quantity * price
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center font-chinese">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            {t("confirmDelete")}
          </DialogTitle>
          <DialogDescription className="font-chinese">{t("deleteMessage")}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 font-chinese">{t("symbol")}:</span>
              <span className="text-sm font-medium font-chinese">
                {record.stockCode} - {record.stockName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 font-chinese">Market:</span>
              <span className="text-sm font-medium">{record.market}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 font-chinese">{t("type")}:</span>
              <span className="text-sm font-medium font-chinese">{getLocalizedType(record.transactionType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 font-chinese">{t("tradingDate")}:</span>
              <span className="text-sm font-medium">
                {formatDate(record.transactionDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 font-chinese">{t("amount")}:</span>
              <span className="text-sm font-medium">{formatCurrency(calculateAmount(record.quantity, Number(record.price)), record.currency)}</span>
            </div>
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
