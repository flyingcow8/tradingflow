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
import { Badge } from "@/components/ui/badge"
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

interface EditPositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  position: Position | null
  onSubmit: (positionId: string, data: { stockName: string; quantity: number; averageCost: number }) => void
}

export function EditPositionDialog({ open, onOpenChange, position, onSubmit }: EditPositionDialogProps) {
  const { t } = useLanguage()
  
  const [formData, setFormData] = useState({
    stockName: "",
    quantity: "",
    averageCost: "",
  })

  useEffect(() => {
    if (position) {
      setFormData({
        stockName: position.stockName,
        quantity: position.quantity.toString(),
        averageCost: position.averageCost.toString(),
      })
    }
  }, [position])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!position) return

    const quantity = Number.parseInt(formData.quantity)
    const averageCost = Number.parseFloat(formData.averageCost)

    if (quantity <= 0 || averageCost <= 0) {
      alert(t("quantityAndPriceMustBePositive"))
      return
    }

    onSubmit(position.id, {
      stockName: formData.stockName,
      quantity,
      averageCost,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  if (!position) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-chinese">{t("editPosition")}</DialogTitle>
          <DialogDescription className="font-chinese">
            {t("modifyPositionDetails")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 只读信息 */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600 font-chinese">{t("symbol")}:</Label>
                <div className="font-mono font-medium text-lg">{position.stockCode}</div>
              </div>
              <div>
                <Label className="text-gray-600 font-chinese">{t("market")}:</Label>
                <Badge variant="outline" className="font-mono ml-2">
                  {getMarketDisplayName(position.market)}
                </Badge>
              </div>
              <div>
                <Label className="text-gray-600 font-chinese">{t("currency")}:</Label>
                <Badge variant="secondary" className="font-mono ml-2">
                  {position.currency}
                </Badge>
              </div>
              {position.lastPrice && (
                <div>
                  <Label className="text-gray-600 font-chinese">{t("currentPrice")}:</Label>
                  <div className="font-mono font-medium">
                    {position.currency === 'USD' ? '$' : 'HK$'}{position.lastPrice.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 可编辑字段 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stockName" className="font-chinese">
                {t("stockName")} *
              </Label>
              <Input
                id="edit-stockName"
                value={formData.stockName}
                onChange={(e) => handleInputChange("stockName", e.target.value)}
                required
                className="font-chinese"
                placeholder="Apple Inc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity" className="font-chinese">
                  {t("shares")} *
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  required
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-averageCost" className="font-chinese">
                  {t("averageCost")} *
                </Label>
                <Input
                  id="edit-averageCost"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.averageCost}
                  onChange={(e) => handleInputChange("averageCost", e.target.value)}
                  required
                  placeholder="150.00"
                />
              </div>
            </div>

            {/* 计算显示 */}
            {formData.quantity && formData.averageCost && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-chinese">
                  {t("totalCost")}: {position.currency === 'USD' ? '$' : 'HK$'}
                  {(Number.parseFloat(formData.quantity) * Number.parseFloat(formData.averageCost)).toFixed(2)}
                </div>
              </div>
            )}
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