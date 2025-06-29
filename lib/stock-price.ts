// 股票价格服务
// 使用Alpha Vantage API获取实时股价

interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  lastUpdated: string
  currency: string
}

interface AlphaVantageResponse {
  'Global Quote': {
    '01. symbol': string
    '05. price': string
    '09. change': string
    '10. change percent': string
    '07. latest trading day': string
  }
}

interface YahooFinanceQuote {
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  symbol: string
}

// Alpha Vantage API配置（免费版每分钟5次请求，每天500次）
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

// Yahoo Finance API（非官方但免费）
const YAHOO_FINANCE_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'

// 获取单个股票的实时价格（Alpha Vantage）
export async function getStockQuoteAlpha(symbol: string, market: 'US' | 'HK'): Promise<StockQuote | null> {
  try {
    // 转换股票代码格式
    const formattedSymbol = formatSymbolForAlpha(symbol, market)
    
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${formattedSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    
    const response = await fetch(url, {
      next: { revalidate: 60 } // 缓存1分钟
    })
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`)
    }
    
    const data: AlphaVantageResponse = await response.json()
    
    if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
      console.warn(`No price data for ${symbol}`)
      return null
    }
    
    const quote = data['Global Quote']
    
    return {
      symbol: symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      lastUpdated: quote['07. latest trading day'],
      currency: market === 'US' ? 'USD' : 'HKD'
    }
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return null
  }
}

// 获取单个股票的实时价格（Yahoo Finance - 备用方案）
export async function getStockQuoteYahoo(symbol: string, market: 'US' | 'HK'): Promise<StockQuote | null> {
  try {
    // 转换股票代码格式
    const formattedSymbol = formatSymbolForYahoo(symbol, market)
    
    const url = `${YAHOO_FINANCE_BASE_URL}/${formattedSymbol}?metrics=high?&interval=1d&range=1d`
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // 缓存1分钟
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.chart?.result?.[0]?.meta) {
      console.warn(`No price data for ${symbol}`)
      return null
    }
    
    const meta = data.chart.result[0].meta
    
    return {
      symbol: symbol,
      price: meta.regularMarketPrice || 0,
      change: meta.regularMarketChange || 0,
      changePercent: (meta.regularMarketChangePercent || 0) * 100,
      lastUpdated: new Date().toISOString(),
      currency: market === 'US' ? 'USD' : 'HKD'
    }
  } catch (error) {
    console.error(`Error fetching Yahoo quote for ${symbol}:`, error)
    return null
  }
}

// 批量获取股票价格
export async function getBatchStockQuotes(
  stocks: Array<{ symbol: string; market: 'US' | 'HK' }>
): Promise<StockQuote[]> {
  const quotes: StockQuote[] = []
  
  // 为了避免API限制，添加延迟
  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i]
    
    // 先尝试Yahoo Finance（更可靠）
    let quote = await getStockQuoteYahoo(stock.symbol, stock.market)
    
    // 如果Yahoo失败，尝试Alpha Vantage
    if (!quote) {
      quote = await getStockQuoteAlpha(stock.symbol, stock.market)
    }
    
    if (quote) {
      quotes.push(quote)
    }
    
    // 添加延迟避免API限制
    if (i < stocks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  return quotes
}

// 格式化股票代码（Alpha Vantage）
function formatSymbolForAlpha(symbol: string, market: 'US' | 'HK'): string {
  if (market === 'HK') {
    // 港股代码需要加上.HK后缀
    const paddedSymbol = symbol.padStart(4, '0')
    return `${paddedSymbol}.HK`
  }
  return symbol
}

// 格式化股票代码（Yahoo Finance）
function formatSymbolForYahoo(symbol: string, market: 'US' | 'HK'): string {
  if (market === 'HK') {
    // 港股代码需要加上.HK后缀
    const paddedSymbol = symbol.padStart(4, '0')
    return `${paddedSymbol}.HK`
  }
  return symbol
}

// 模拟价格数据（用于开发和测试）
export function getMockStockQuote(symbol: string, market: 'US' | 'HK'): StockQuote {
  const basePrice = Math.random() * 200 + 50 // 50-250的随机价格
  const change = (Math.random() - 0.5) * 10 // -5到+5的变化
  const changePercent = (change / basePrice) * 100
  
  return {
    symbol,
    price: Math.round(basePrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    lastUpdated: new Date().toISOString(),
    currency: market === 'US' ? 'USD' : 'HKD'
  }
}

// 检查是否为现金持仓
export function isCashPosition(stockCode: string): boolean {
  return stockCode.startsWith('CASH_')
}

// 获取环境配置
export function getStockPriceConfig() {
  return {
    useRealApi: process.env.USE_REAL_STOCK_API === 'true',
    alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY,
    mockMode: process.env.NODE_ENV === 'development' && !process.env.USE_REAL_STOCK_API
  }
} 