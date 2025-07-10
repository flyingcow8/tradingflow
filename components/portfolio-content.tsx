"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, PieChartIcon, Wallet, Plus, RefreshCw, Edit, Trash2 } from "lucide-react"
import { NewPositionDialog } from "@/components/new-position-dialog"
import { EditPositionDialog } from "@/components/edit-position-dialog"
import { DeletePositionDialog } from "@/components/delete-position-dialog"
import { useLanguage } from "@/contexts/language-context"
import { convertToUSD, formatCurrencyInUSD, formatCurrencyOriginal } from "@/lib/currency"
import { PriceStatusIndicator } from "@/components/price-status-indicator"

interface PortfolioItem {
  id: string
  stockCode: string
  stockName: string
  market: string
  quantity: number
  averageCost: number
  currency: string
  lastPrice?: number
  currentValue: number
  profitLoss: number
  profitLossPercentage: number
  isCash?: boolean
  currentValueUSD?: number
  profitLossUSD?: number
}

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

// API 函数
const fetchPositions = async () => {
  const response = await fetch('/api/positions')
  if (!response.ok) {
    throw new Error('Failed to fetch positions')
  }
  const data = await response.json()
  return data.data || []
}

const createPosition = async (position: NewPositionData) => {
  const response = await fetch('/api/positions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(position),
  })
  if (!response.ok) {
    throw new Error('Failed to create position')
  }
  return response.json()
}

function getColorForSymbol(symbol: string): string {
  const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getMarketDisplayName(market: string, t: (key: string) => string): string {
  const marketMap: { [key: string]: string } = {
    'US': t("usStock"),
    'HK': t("hkStock"),
    'NASDAQ': t("nasdaqExchange"),
    'NYSE': t("nyseExchange"),
    'HKEX': t("hkExchangeFull")
  }
  return marketMap[market] || market
}

function isCashPosition(stockCode: string): boolean {
  return stockCode.startsWith('CASH_')
}

function getCashDisplayName(stockCode: string, t: (key: string) => string): string {
  if (stockCode === 'CASH_USD') return t('usdCash')
  if (stockCode === 'CASH_HKD') return t('hkdCash')
  return stockCode
}

export function PortfolioContent() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [positions, setPositions] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isNewPositionDialogOpen, setIsNewPositionDialogOpen] = useState(false)
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false)
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)
  
  // 编辑持仓相关状态
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<PortfolioItem | null>(null)
  
  // 删除持仓相关状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingPosition, setDeletingPosition] = useState<PortfolioItem | null>(null)

  // 从API获取持仓数据
  useEffect(() => {
    if (session) {
      loadPositions()
    }
  }, [session])

  const loadPositions = async () => {
    try {
      setIsLoading(true)
      
      // 1. 先获取持仓数据
      const response = await fetch('/api/positions')
      if (!response.ok) {
        throw new Error('Failed to fetch positions')
      }
      
      const result = await response.json()
      if (result.success) {
        setPositions(result.data.map((item: any) => ({
          ...item,
          isCash: item.stockCode.startsWith('CASH_')
        })))
        
        // 2. 自动刷新实时价格（如果有股票持仓）
        const hasStockPositions = result.data.some((item: any) => !item.stockCode.startsWith('CASH_'))
        if (hasStockPositions) {
          await refreshPricesInBackground()
        }
      }
    } catch (error) {
      console.error('Failed to load positions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 后台刷新价格（不显示加载状态）
  const refreshPricesInBackground = async () => {
    try {
      console.log('🔄 Background refreshing stock prices...')
      
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateAll: true
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Price update successful:', result.updatedCount, 'positions')
        setLastPriceUpdate(new Date())
        
        // 重新获取更新后的持仓数据
        const positionsResponse = await fetch('/api/positions')
        if (positionsResponse.ok) {
          const positionsResult = await positionsResponse.json()
          if (positionsResult.success) {
            setPositions(positionsResult.data.map((item: any) => ({
              ...item,
              isCash: item.stockCode.startsWith('CASH_')
            })))
          }
        }
      } else {
        console.warn('⚠️ Price update failed, using existing prices')
      }
    } catch (error) {
      console.warn('⚠️ Background price update failed:', error instanceof Error ? error.message : String(error))
    }
  }

  const handleAddPosition = async (positionData: NewPositionData) => {
    try {
      await createPosition(positionData)
      loadPositions() // 重新加载持仓列表
      setIsNewPositionDialogOpen(false)
    } catch (error) {
      console.error('Failed to add position:', error)
    }
  }

  // 编辑持仓
  const handleEditPosition = (position: PortfolioItem) => {
    setEditingPosition(position)
    setIsEditDialogOpen(true)
  }

  const handleUpdatePosition = async (positionId: string, data: { stockName: string; quantity: number; averageCost: number }) => {
    try {
      const response = await fetch(`/api/positions/${positionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update position')
      }

      setIsEditDialogOpen(false)
      setEditingPosition(null)
      await loadPositions() // 重新加载持仓数据
    } catch (error) {
      console.error('Failed to update position:', error)
      alert(t("updatePositionFailed"))
    }
  }

  // 删除持仓
  const handleDeletePosition = (position: PortfolioItem) => {
    setDeletingPosition(position)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePosition = async () => {
    if (deletingPosition) {
      try {
        const response = await fetch(`/api/positions/${deletingPosition.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete position')
        }

        setIsDeleteDialogOpen(false)
        setDeletingPosition(null)
        await loadPositions() // 重新加载持仓数据
      } catch (error) {
        console.error('Failed to delete position:', error)
        alert(t("deletePositionFailed"))
      }
    }
  }

  // 刷新股票价格
  const handleRefreshPrices = async () => {
    try {
      setIsUpdatingPrices(true)
      
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateAll: true
        }),
      })

      if (!response.ok) {
        throw new Error(t("refreshPricesFailed"))
      }

      const result = await response.json()
      console.log('Price update result:', result)
      setLastPriceUpdate(new Date())

      // 重新加载持仓数据
      await loadPositions()
      
      // 这里可以添加成功提示
      console.log(`Successfully updated prices for ${result.updatedCount} positions`)
    } catch (error) {
      console.error('Failed to refresh prices:', error)
      // 这里可以添加错误提示
    } finally {
      setIsUpdatingPrices(false)
    }
  }

  // 计算总资产价值和分配（统一转换为美元）
  const positionsWithAllocation = positions.map((item) => {
    // 使用实时价格（如果有）计算当前价值，否则使用平均成本
    const currentPrice = item.lastPrice && Number(item.lastPrice) > 0
      ? Number(item.lastPrice) 
      : Number(item.averageCost)
    
    // 原货币计算
    const currentValue = currentPrice * item.quantity
    const cost = Number(item.averageCost) * item.quantity
    const profitLoss = currentValue - cost
    const profitLossPercentage = cost > 0 ? (profitLoss / cost) * 100 : 0

    // 转换为美元
    const currentValueUSD = convertToUSD(currentValue, item.currency)
    const costUSD = convertToUSD(cost, item.currency)
    const profitLossUSD = currentValueUSD - costUSD
    
    return {
      ...item,
      currentValue,
      profitLoss,
      profitLossPercentage,
      currentValueUSD,
      profitLossUSD,
      hasRealTimePrice: item.lastPrice && Number(item.lastPrice) > 0 && Number(item.lastPrice) !== Number(item.averageCost),
    }
  })

  // 分离股票和现金持仓
  const stockPositions = positionsWithAllocation.filter(pos => !pos.isCash)
  const cashPositions = positionsWithAllocation.filter(pos => pos.isCash)

  // 计算总统计数据（统一使用美元）
  const totalMarketValueUSD = positionsWithAllocation.reduce((sum, item) => sum + (item.currentValueUSD || 0), 0)
  const totalCostBasisUSD = positionsWithAllocation.reduce((sum, item) => {
    const cost = Number(item.averageCost) * item.quantity
    return sum + convertToUSD(cost, item.currency)
  }, 0)
  const totalUnrealizedPLUSD = totalMarketValueUSD - totalCostBasisUSD

  // 为饼图准备数据 - 包含现金（使用美元价值）
  const pieChartData = positionsWithAllocation.map((item) => ({
    name: item.isCash ? getCashDisplayName(item.stockCode, t) : `${item.stockCode}`,
    value: item.currentValueUSD || 0,
    color: getColorForSymbol(item.stockCode),
    allocation: totalMarketValueUSD > 0 ? ((item.currentValueUSD || 0) / totalMarketValueUSD) * 100 : 0,
  }))

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = currency === 'HKD' ? 'HK$' : '$'
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium font-chinese">{data.name}</p>
          <p className="text-sm text-gray-600">
            {t("marketValue")}: {formatCurrencyInUSD(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            {t("allocation")}: {data.allocation.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* 左边：标题和描述 */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight font-chinese">{t("portfolioTitle")}</h1>
          <p className="text-muted-foreground font-chinese">
            {t("manageHoldings")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("unifiedUsdDisplay")} • {t("realTimeData")} • {t("realTimePrices")}
            {lastPriceUpdate && (
              <span className="ml-2">
                • {t("lastUpdated")}: {lastPriceUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        {/* 右边：按钮组 */}
        <div className="flex space-x-2">
          <Button 
            onClick={handleRefreshPrices} 
            disabled={isUpdatingPrices}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
            {isUpdatingPrices ? t("updating") : t("refreshPrices")}
          </Button>
          <Button onClick={() => setIsNewPositionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("newPosition")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">{t("totalMarketValue")}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyInUSD(totalMarketValueUSD)}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Wallet className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">{t("totalCost")}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyInUSD(totalCostBasisUSD)}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">{t("unrealizedPL")}</p>
                <p className={`text-2xl font-bold ${totalUnrealizedPLUSD >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalUnrealizedPLUSD >= 0 ? "+" : ""}
                  {formatCurrencyInUSD(totalUnrealizedPLUSD)}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                {totalUnrealizedPLUSD >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">{t("totalReturnRate")}</p>
                <p className={`text-2xl font-bold ${totalUnrealizedPLUSD >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalCostBasisUSD > 0 ? formatPercent((totalUnrealizedPLUSD / totalCostBasisUSD) * 100) : '0.00%'}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <PieChartIcon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {positions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-chinese">{t("noHoldingsData")}</h3>
              <p className="text-gray-500 mb-6 font-chinese">{t("noHoldingsDescription")}</p>
              <Button
                onClick={() => setIsNewPositionDialogOpen(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-chinese"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("newPosition")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Portfolio Allocation Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-chinese">{t("assetAllocation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-chinese">{t("positionRatio")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pieChartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium font-chinese">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Progress value={item.allocation} className="w-20" />
                        <span className="text-sm font-medium w-12 text-right">{item.allocation.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Holdings Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-chinese flex items-center justify-between">
                {t("holdingsDetail")}
                                  <div className="text-sm text-gray-500 font-normal">
                    {stockPositions.some(p => p.hasRealTimePrice) && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {t("withRealTimeData")}
                      </span>
                    )}
                  </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 股票持仓 */}
              {stockPositions.length > 0 && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 font-chinese">{t("stockHoldings")}</h3>
                  </div>
                  <Table className="mb-6">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-chinese">{t("symbol")}</TableHead>
                        <TableHead className="font-chinese">{t("name")}</TableHead>
                        <TableHead className="font-chinese">{t("market")}</TableHead>
                        <TableHead className="font-chinese">{t("shares")}</TableHead>
                        <TableHead className="font-chinese">{t("avgPrice")}</TableHead>
                        <TableHead className="font-chinese">{t("currentPrice")}</TableHead>
                        <TableHead className="font-chinese">{t("marketValue")}</TableHead>
                        <TableHead className="font-chinese">{t("cost")}</TableHead>
                        <TableHead className="font-chinese">{t("profit")}</TableHead>
                        <TableHead className="font-chinese">{t("returnRate")}</TableHead>
                        <TableHead className="font-chinese">{t("allocation")}</TableHead>
                        <TableHead className="font-chinese text-center">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockPositions.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono font-medium">{item.stockCode}</TableCell>
                          <TableCell className="font-chinese">{item.stockName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {getMarketDisplayName(item.market, t)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-numbers">{item.quantity}</TableCell>
                          <TableCell className="font-numbers">
                            <div>
                              <div>{formatCurrencyInUSD(Number(item.averageCost), item.currency)}</div>
                              <div className="text-xs text-gray-500">{formatCurrencyOriginal(Number(item.averageCost), item.currency)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-numbers">
                            <div className="space-y-1">
                              <div>
                                {item.lastPrice && item.lastPrice !== item.averageCost
                                  ? formatCurrencyInUSD(Number(item.lastPrice), item.currency)
                                  : formatCurrencyInUSD(Number(item.averageCost), item.currency)
                                }
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.lastPrice && item.lastPrice !== item.averageCost
                                  ? formatCurrencyOriginal(Number(item.lastPrice), item.currency)
                                  : formatCurrencyOriginal(Number(item.averageCost), item.currency)
                                }
                              </div>
                              <PriceStatusIndicator
                                hasRealTimePrice={item.hasRealTimePrice || false}
                                lastPrice={item.lastPrice ? Number(item.lastPrice) : undefined}
                                averageCost={Number(item.averageCost)}
                                currency={item.currency}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-numbers font-medium">
                            <div>
                              <div>{formatCurrencyInUSD(item.currentValueUSD || 0)}</div>
                              <div className="text-xs text-gray-500">{formatCurrencyOriginal(item.currentValue, item.currency)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-numbers">
                            <div>
                              <div>{formatCurrencyInUSD(convertToUSD(Number(item.averageCost) * item.quantity, item.currency))}</div>
                              <div className="text-xs text-gray-500">{formatCurrencyOriginal(Number(item.averageCost) * item.quantity, item.currency)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-numbers">
                            <div>
                              <span className={item.profitLossUSD && item.profitLossUSD >= 0 ? "text-green-600" : "text-red-600"}>
                                {item.profitLossUSD && item.profitLossUSD >= 0 ? "+" : ""}
                                {formatCurrencyInUSD(item.profitLossUSD || 0)}
                              </span>
                              <div className="text-xs text-gray-500">
                                {item.profitLoss >= 0 ? "+" : ""}
                                {formatCurrencyOriginal(item.profitLoss, item.currency)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-numbers">
                            <span className={item.profitLossPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                              {formatPercent(item.profitLossPercentage)}
                            </span>
                          </TableCell>
                          <TableCell className="font-numbers">{(totalMarketValueUSD > 0 ? ((item.currentValueUSD || 0) / totalMarketValueUSD) * 100 : 0).toFixed(1)}%</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPosition(item)}
                                className="h-8 w-8 p-0"
                                title={t("editPosition")}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePosition(item)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title={t("deletePosition")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {/* 现金持仓 */}
              {cashPositions.length > 0 && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 font-chinese">{t("cashHoldings")}</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-chinese">{t("currency")}</TableHead>
                        <TableHead className="font-chinese">{t("cashBalance")}</TableHead>
                        <TableHead className="font-chinese">{t("allocation")}</TableHead>
                        <TableHead className="font-chinese text-center">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashPositions.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-chinese">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="font-mono">
                                {item.currency}
                              </Badge>
                              <span>{getCashDisplayName(item.stockCode, t)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-numbers font-medium">
                            <div>
                              <div>{formatCurrencyInUSD(item.currentValueUSD || 0)}</div>
                              <div className="text-xs text-gray-500">{formatCurrencyOriginal(item.currentValue, item.currency)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-numbers">
                            {(totalMarketValueUSD > 0 ? ((item.currentValueUSD || 0) / totalMarketValueUSD) * 100 : 0).toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPosition(item)}
                                className="h-8 w-8 p-0"
                                title={t("editPosition")}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePosition(item)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title={t("deletePosition")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {/* 如果没有任何持仓 */}
              {stockPositions.length === 0 && cashPositions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {t("noHoldings")}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* New Position Dialog */}
      <NewPositionDialog
        open={isNewPositionDialogOpen}
        onOpenChange={setIsNewPositionDialogOpen}
        onSubmit={handleAddPosition}
      />

      {/* Edit Position Dialog */}
      <EditPositionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        position={editingPosition}
        onSubmit={handleUpdatePosition}
      />

      {/* Delete Position Dialog */}
      {deletingPosition && (
        <DeletePositionDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          position={deletingPosition}
          onConfirm={confirmDeletePosition}
        />
      )}
    </div>
  )
}
