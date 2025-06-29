"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface EditRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: TradingRecord
  onSubmit: (record: TradingRecord) => void
}

const currencies = [
  { value: "USD", label: "USD" },
  { value: "HKD", label: "HKD" },
]

export function EditRecordDialog({ open, onOpenChange, record, onSubmit }: EditRecordDialogProps) {
  const { t } = useLanguage()
  
  const markets = [
    { value: "NASDAQ", label: t("nasdaq") },
    { value: "NYSE", label: t("nyse") },
    { value: "HKEX", label: t("hkex") },
  ]
  const [formData, setFormData] = useState({
    market: "",
    stockCode: "",
    stockName: "",
    transactionType: "BUY" as "BUY" | "SELL",
    quantity: "",
    price: "",
    currency: "",
    transactionDate: "",
    commission: "",
    notes: "",
  })

  useEffect(() => {
    if (record) {
      setFormData({
        market: record.market,
        stockCode: record.stockCode,
        stockName: record.stockName,
        transactionType: record.transactionType,
        quantity: record.quantity.toString(),
        price: record.price.toString(),
        currency: record.currency,
        transactionDate: record.transactionDate.split('T')[0], // 只取日期部分
        commission: record.commission.toString(),
        notes: record.notes || "",
      })
    }
  }, [record])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const quantity = Number.parseInt(formData.quantity)
    const price = Number.parseFloat(formData.price)
    const commission = Number.parseFloat(formData.commission) || 0

    const updatedRecord: TradingRecord = {
      ...record,
      market: formData.market,
      stockCode: formData.stockCode.toUpperCase(),
      stockName: formData.stockName,
      transactionType: formData.transactionType,
      quantity,
      price,
      currency: formData.currency,
      transactionDate: formData.transactionDate,
      commission,
      notes: formData.notes || undefined,
    }

    onSubmit(updatedRecord)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      
      // 根据交易所自动设置货币
      if (field === "market") {
        if (value === "NASDAQ" || value === "NYSE") {
          newData.currency = "USD"
        } else if (value === "HKEX") {
          newData.currency = "HKD"
        }
      }
      
      return newData
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-chinese">{t("editRecord")}</DialogTitle>
          <DialogDescription className="font-chinese">{t("modifyDetails")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-market" className="font-chinese">
                Market
              </Label>
              <Select value={formData.market} onValueChange={(value) => handleInputChange("market", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((market) => (
                    <SelectItem key={market.value} value={market.value}>
                      {market.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-currency" className="font-chinese">
                Currency
              </Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-transactionDate" className="font-chinese">
              {t("tradingDate")}
            </Label>
            <Input
              id="edit-transactionDate"
              type="date"
              value={formData.transactionDate}
              onChange={(e) => handleInputChange("transactionDate", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stockCode" className="font-chinese">
                {t("stockSymbol")}
              </Label>
              <Input
                id="edit-stockCode"
                placeholder="AAPL"
                value={formData.stockCode}
                onChange={(e) => handleInputChange("stockCode", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stockName" className="font-chinese">
                {t("stockName")}
              </Label>
              <Input
                id="edit-stockName"
                placeholder="Apple Inc."
                value={formData.stockName}
                onChange={(e) => handleInputChange("stockName", e.target.value)}
                required
                className="font-chinese"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-transactionType" className="font-chinese">
              {t("tradingType")}
            </Label>
            <Select value={formData.transactionType} onValueChange={(value) => handleInputChange("transactionType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY" className="font-chinese">
                  {t("buy")}
                </SelectItem>
                <SelectItem value="SELL" className="font-chinese">
                  {t("sell")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity" className="font-chinese">
                {t("quantity")}
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                min="1"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price" className="font-chinese">
                {t("price")}
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="150.00"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-commission" className="font-chinese">
              Commission
            </Label>
            <Input
              id="edit-commission"
              type="number"
              step="0.01"
              min="0"
              placeholder="5.00"
              value={formData.commission}
              onChange={(e) => handleInputChange("commission", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="font-chinese">
              Notes (Optional)
            </Label>
            <Input
              id="edit-notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-chinese">
              {t("cancel")}
            </Button>
            <Button type="submit" className="font-chinese">
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
