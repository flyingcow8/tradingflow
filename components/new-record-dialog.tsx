"use client"

import type React from "react"

import { useState } from "react"
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

interface NewTransactionData {
  market: string
  stockCode: string
  stockName: string
  transactionType: "BUY" | "SELL"
  quantity: number
  price: number
  currency: string
  transactionDate: string
  commission: number
  notes?: string
}

interface NewRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (record: NewTransactionData) => void
}

const currencies = [
  { value: "USD", label: "USD" },
  { value: "HKD", label: "HKD" },
]

export function NewRecordDialog({ open, onOpenChange, onSubmit }: NewRecordDialogProps) {
  const { t } = useLanguage()
  
  const markets = [
    { value: "NASDAQ", label: t("nasdaq") },
    { value: "NYSE", label: t("nyse") },
    { value: "HKEX", label: t("hkex") },
  ]
  const [formData, setFormData] = useState({
    market: "NASDAQ",
    stockCode: "",
    stockName: "",
    transactionType: "BUY" as "BUY" | "SELL",
    quantity: "",
    price: "",
    currency: "USD",
    transactionDate: new Date().toISOString().split("T")[0],
    commission: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const quantity = Number.parseInt(formData.quantity)
    const price = Number.parseFloat(formData.price)
    const commission = Number.parseFloat(formData.commission) || 0

    const record: NewTransactionData = {
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

    onSubmit(record)

    // 重置表单
    setFormData({
      market: "NASDAQ",
      stockCode: "",
      stockName: "",
      transactionType: "BUY",
      quantity: "",
      price: "",
      currency: "USD",
      transactionDate: new Date().toISOString().split("T")[0],
      commission: "",
      notes: "",
    })
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
          <DialogTitle className="font-chinese">{t("newRecord")}</DialogTitle>
          <DialogDescription className="font-chinese">{t("fillDetails")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="market" className="font-chinese">
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
              <Label htmlFor="currency" className="font-chinese">
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
            <Label htmlFor="transactionDate" className="font-chinese">
              {t("tradingDate")}
            </Label>
            <Input
              id="transactionDate"
              type="date"
              value={formData.transactionDate}
              onChange={(e) => handleInputChange("transactionDate", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockCode" className="font-chinese">
                {t("stockSymbol")}
              </Label>
              <Input
                id="stockCode"
                placeholder="AAPL"
                value={formData.stockCode}
                onChange={(e) => handleInputChange("stockCode", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockName" className="font-chinese">
                {t("stockName")}
              </Label>
              <Input
                id="stockName"
                placeholder="Apple Inc."
                value={formData.stockName}
                onChange={(e) => handleInputChange("stockName", e.target.value)}
                required
                className="font-chinese"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionType" className="font-chinese">
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
              <Label htmlFor="quantity" className="font-chinese">
                {t("quantity")}
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="font-chinese">
                {t("price")}
              </Label>
              <Input
                id="price"
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
            <Label htmlFor="commission" className="font-chinese">
              Commission
            </Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              min="0"
              placeholder="5.00"
              value={formData.commission}
              onChange={(e) => handleInputChange("commission", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="font-chinese">
              Notes (Optional)
            </Label>
            <Input
              id="notes"
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
