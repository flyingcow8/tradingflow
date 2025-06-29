// 基础数据类型
export type Market = 'US' | 'HK'
export type TransactionType = 'BUY' | 'SELL'
export type Currency = 'USD' | 'HKD'

// 交易记录类型
export interface Transaction {
  id: string
  userId: string
  market: Market
  stockCode: string
  stockName: string
  transactionType: TransactionType
  quantity: number
  price: number
  currency: Currency
  transactionDate: Date
  commission?: number | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

// 持仓类型
export interface Position {
  id: string
  userId: string
  market: Market
  stockCode: string
  stockName: string
  quantity: number
  averageCost: number
  currency: Currency
  lastPrice?: number | null
  lastUpdated: Date
  createdAt: Date
  currentValue?: number
  profitLoss?: number
  profitLossPercentage?: number
}

// 表单数据类型
export interface TransactionFormData {
  market: Market
  stockCode: string
  stockName: string
  transactionType: TransactionType
  quantity: number
  price: number
  currency: Currency
  transactionDate: Date
  commission?: number
  notes?: string
}

export interface EditTransactionFormData extends TransactionFormData {
  id: string
}

// 统计数据类型
export interface PortfolioStats {
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  positionCount: number
  marketDistribution: {
    US: { value: number; percentage: number }
    HK: { value: number; percentage: number }
  }
}

export interface TradingStats {
  totalTransactions: number
  totalBuyTransactions: number
  totalSellTransactions: number
  totalCommission: number
  averageTransactionSize: number
  mostTradedStock: {
    stockCode: string
    stockName: string
    transactionCount: number
  } | null
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 搜索和过滤类型
export interface TransactionFilters {
  market?: Market
  stockCode?: string
  transactionType?: TransactionType
  dateFrom?: Date
  dateTo?: Date
  page?: number
  pageSize?: number
}

export interface PositionFilters {
  market?: Market
  stockCode?: string
  page?: number
  pageSize?: number
}

// 用户偏好设置
export interface UserPreferences {
  defaultCurrency: Currency
  defaultMarket: Market
  dateFormat: string
  theme: 'light' | 'dark' | 'system'
}

// 汇率数据
export interface ExchangeRate {
  from: Currency
  to: Currency
  rate: number
  lastUpdated: Date
}

// 股票信息
export interface StockInfo {
  symbol: string
  name: string
  market: Market
  currency: Currency
  currentPrice?: number
  change?: number
  changePercent?: number
  lastUpdated?: Date
} 