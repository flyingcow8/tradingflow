"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import { Plus, TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react"
import { NewRecordDialog } from "@/components/new-record-dialog"
import { EditRecordDialog } from "@/components/edit-record-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
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

// API函数
const fetchTradingRecords = async () => {
  const response = await fetch('/api/transactions')
  if (!response.ok) {
    throw new Error('Failed to fetch trading records')
  }
  const data = await response.json()
  return data.data || []
}

const deleteTradingRecord = async (id: string) => {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete trading record')
  }
  return response.json()
}

const updateTradingRecord = async (id: string, record: Partial<TradingRecord>) => {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  })
  if (!response.ok) {
    throw new Error('Failed to update trading record')
  }
  return response.json()
}

const createTradingRecord = async (record: Omit<TradingRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // 将具体的交易所名称映射为数据库期望的格式
    const marketMapping: { [key: string]: string } = {
      'NASDAQ': 'US',
      'NYSE': 'US', 
      'HKEX': 'HK',
      // 兼容旧格式
      'US': 'US',
      'HK': 'HK'
    }

    const transformedRecord = {
      market: marketMapping[record.market] || record.market,
      stockCode: record.stockCode,
      stockName: record.stockName,
      transactionType: record.transactionType,
      quantity: record.quantity,
      price: record.price,
      currency: record.currency,
      transactionDate: typeof record.transactionDate === 'string' 
        ? record.transactionDate  // API会处理字符串到Date的转换
        : record.transactionDate,
      commission: record.commission || 0,
      notes: record.notes || null,
    }

    console.log('Sending transaction data:', transformedRecord) // 调试日志

    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedRecord),
    })

    // 获取详细的错误信息
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('API Error Response:', errorData)
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating trading record:', error)
    throw error
  }
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

export function TradingRecordsContent() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [records, setRecords] = useState<TradingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TradingRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<TradingRecord | null>(null)

  // 从API获取交易记录
  useEffect(() => {
    if (session) {
      loadTradingRecords()
    }
  }, [session])

  const loadTradingRecords = async () => {
    try {
      setIsLoading(true)
      const data = await fetchTradingRecords()
      setRecords(data)
    } catch (error) {
      console.error('Failed to load trading records:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRecord = async (newRecord: any) => {
    try {
      console.log('Received new record:', newRecord) // 调试日志
      
      // 确保数据格式正确
      const recordToCreate = {
        market: newRecord.market,
        stockCode: newRecord.stockCode,
        stockName: newRecord.stockName,
        transactionType: newRecord.transactionType,
        quantity: newRecord.quantity,
        price: newRecord.price,
        currency: newRecord.currency,
        transactionDate: newRecord.transactionDate,
        commission: newRecord.commission || 0,
        notes: newRecord.notes,
      }
      
      await createTradingRecord(recordToCreate)
      setIsNewDialogOpen(false)
      await loadTradingRecords() // 重新加载数据
    } catch (error) {
      console.error('Failed to add record:', error)
      // 可以在这里添加用户友好的错误提示
      alert(t("addRecordFailed"))
    }
  }

  const handleEditRecord = (record: TradingRecord) => {
    setEditingRecord(record)
    setIsEditDialogOpen(true)
  }

  const handleUpdateRecord = async (updatedRecord: TradingRecord) => {
    try {
      await updateTradingRecord(updatedRecord.id, updatedRecord)
      setIsEditDialogOpen(false)
      setEditingRecord(null)
      await loadTradingRecords() // 重新加载数据
    } catch (error) {
      console.error('Failed to update record:', error)
    }
  }

  const handleDeleteRecord = (record: TradingRecord) => {
    setDeletingRecord(record)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteRecord = async () => {
    if (deletingRecord) {
      try {
        await deleteTradingRecord(deletingRecord.id)
        setIsDeleteDialogOpen(false)
        setDeletingRecord(null)
        await loadTradingRecords() // 重新加载数据
      } catch (error) {
        console.error('Failed to delete record:', error)
      }
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-CN', { hour12: false })
  }

  const calculateAmount = (quantity: number, price: number) => {
    return quantity * price
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-chinese">{t("tradingRecordsTitle")}</h1>
          <p className="mt-2 text-gray-600 font-chinese">{t("tradingRecordsSubtitle")}</p>
        </div>
        <div className="flex items-center">
          <Button
            onClick={() => setIsNewDialogOpen(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white font-chinese"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("newTrade")}
          </Button>
        </div>
      </div>



      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">{t("totalTrades")}</p>
                <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">{t("totalAmount")}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(records.reduce((sum, record) => sum + calculateAmount(record.quantity, Number(record.price)), 0))}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">{t("totalCommission")}</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(records.reduce((sum, record) => sum + Number(record.commission), 0))}
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-chinese">{t("tradingRecordsList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-chinese">{t("dateTime")}</TableHead>
                <TableHead className="font-chinese">{t("symbol")}</TableHead>
                <TableHead className="font-chinese">{t("name")}</TableHead>
                <TableHead className="font-chinese">{t("exchange")}</TableHead>
                <TableHead className="font-chinese">{t("type")}</TableHead>
                <TableHead className="font-chinese">{t("quantity")}</TableHead>
                <TableHead className="font-chinese">{t("price")}</TableHead>
                <TableHead className="font-chinese">{t("amount")}</TableHead>
                <TableHead className="font-chinese">{t("fee")}</TableHead>
                <TableHead className="font-chinese">{t("profit")}</TableHead>
                <TableHead className="font-chinese">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    {t("loading")}
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    {t("noRecordsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-numbers">
                    <div>
                      <div>{formatDate(record.transactionDate)}</div>
                      <div className="text-sm text-gray-500">{formatTime(record.transactionDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-medium">{record.stockCode}</TableCell>
                  <TableCell className="font-chinese">{record.stockName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                                              {getMarketDisplayName(record.market, t)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={record.transactionType === "BUY" ? "default" : "secondary"}
                      className={
                        record.transactionType === "BUY"
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }
                    >
                      {record.transactionType === "BUY" ? (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      )}
                      {getLocalizedType(record.transactionType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-numbers">{record.quantity}</TableCell>
                  <TableCell className="font-numbers">{formatCurrency(Number(record.price), record.currency)}</TableCell>
                  <TableCell className="font-numbers">{formatCurrency(calculateAmount(record.quantity, Number(record.price)), record.currency)}</TableCell>
                  <TableCell className="font-numbers">{formatCurrency(Number(record.commission), record.currency)}</TableCell>
                  <TableCell className="font-numbers">
                    {record.notes && record.notes.includes('profit:') ? (
                      <span className="text-green-600">
                        +{formatCurrency(parseFloat(record.notes.split('profit:')[1]), record.currency)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRecord(record)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecord(record)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <NewRecordDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} onSubmit={handleAddRecord} />

      {editingRecord && (
        <EditRecordDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          record={editingRecord}
          onSubmit={handleUpdateRecord}
        />
      )}

      {deletingRecord && (
        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          record={deletingRecord}
          onConfirm={confirmDeleteRecord}
        />
      )}
    </div>
  )
}
