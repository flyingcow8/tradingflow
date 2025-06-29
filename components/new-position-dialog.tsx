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

interface NewPositionData {
  market: string
  stockCode: string
  stockName: string
  quantity: number
  averageCost: number
  currency: string
  currentPrice?: number
  positionType?: 'STOCK' | 'CASH'
}

interface NewPositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (position: NewPositionData) => void
}

const getMarkets = (t: (key: string) => string) => [
  { value: "NASDAQ", label: t("nasdaq") },
  { value: "NYSE", label: t("nyse") },
  { value: "HKEX", label: t("hkex") },
]

const currencies = [
  { value: "USD", label: "USD" },
  { value: "HKD", label: "HKD" },
]

const getPositionTypes = (t: (key: string) => string) => [
  { value: "STOCK", label: t("stockPosition") },
  { value: "CASH", label: t("cashPosition") },
]

export function NewPositionDialog({ open, onOpenChange, onSubmit }: NewPositionDialogProps) {
  const { t } = useLanguage()
  const markets = getMarkets(t)
  const positionTypes = getPositionTypes(t)
  const [formData, setFormData] = useState({
    positionType: "STOCK",
    market: "NASDAQ",
    stockCode: "",
    stockName: "",
    quantity: "",
    averageCost: "",
    currency: "USD",
    currentPrice: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const quantity = parseInt(formData.quantity)
    const averageCost = parseFloat(formData.averageCost)
    const currentPrice = formData.currentPrice ? parseFloat(formData.currentPrice) : undefined

    let stockCode = formData.stockCode
    let stockName = formData.stockName
    let market = formData.market

    // 如果是现金持仓，使用特殊的股票代码
    if (formData.positionType === "CASH") {
      stockCode = `CASH_${formData.currency}`
      stockName = formData.currency === 'USD' ? t("usdCashFull") : t("hkdCashFull")
      market = formData.currency === 'USD' ? 'NASDAQ' : 'HKEX' // 为现金设置对应的市场
    }

    const position: NewPositionData = {
      market,
      stockCode: stockCode.toUpperCase(),
      stockName,
      quantity,
      averageCost,
      currency: formData.currency,
      currentPrice,
      positionType: formData.positionType as 'STOCK' | 'CASH',
    }

    onSubmit(position)

    // 重置表单
    setFormData({
      positionType: "STOCK",
      market: "NASDAQ",
      stockCode: "",
      stockName: "",
      quantity: "",
      averageCost: "",
      currency: "USD",
      currentPrice: "",
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

      // 根据持仓类型自动设置货币
      if (field === "positionType") {
        if (value === "CASH") {
          // 现金持仓时清空股票相关字段
          newData.stockCode = ""
          newData.stockName = ""
        }
      }
      
      return newData
    })
  }

  const isCashPosition = formData.positionType === "CASH"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-chinese">{t("addPositionManually")}</DialogTitle>
          <DialogDescription className="font-chinese">
            {t("fillStockOrCashInfo")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="positionType" className="font-chinese">
              {t("positionType")}
            </Label>
            <Select value={formData.positionType} onValueChange={(value) => handleInputChange("positionType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="font-chinese">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!isCashPosition && (
              <div className="space-y-2">
                <Label htmlFor="market" className="font-chinese">
                  {t("market")}
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
            )}
            <div className={`space-y-2 ${isCashPosition ? 'col-span-2' : ''}`}>
              <Label htmlFor="currency" className="font-chinese">
                {t("currency")}
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

          {!isCashPosition && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockCode" className="font-chinese">
                    {t("symbol")}
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
                    {t("name")}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="font-chinese">
                    {t("shares")}
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
                  <Label htmlFor="averageCost" className="font-chinese">
                    {t("averageCost")}
                  </Label>
                  <Input
                    id="averageCost"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="150.00"
                    value={formData.averageCost}
                    onChange={(e) => handleInputChange("averageCost", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPrice" className="font-chinese">
                  {t("currentPriceOptional")}
                </Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="155.00"
                  value={formData.currentPrice}
                  onChange={(e) => handleInputChange("currentPrice", e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  {t("priceNote")}
                </p>
              </div>
            </>
          )}

          {isCashPosition && (
            <div className="space-y-2">
              <Label htmlFor="cashAmount" className="font-chinese">
                {t("cashAmount")}
              </Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="10000.00"
                value={formData.averageCost}
                onChange={(e) => {
                  handleInputChange("averageCost", e.target.value)
                  handleInputChange("quantity", "1") // 现金数量固定为1
                }}
                required
              />
              <p className="text-sm text-gray-500 font-chinese">
                {t("enterCashBalance")}{formData.currency === 'USD' ? t("usd") : t("hkd")}{t("cashBalance2")}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-chinese">
              {t("cancel")}
            </Button>
            <Button type="submit" className="font-chinese">
              {t("addPosition")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 