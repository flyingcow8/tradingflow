import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { 
  getBatchStockQuotes, 
  getMockStockQuote, 
  getStockPriceConfig,
  isCashPosition 
} from '@/lib/stock-price'

// GET /api/prices - 获取股票价格
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const market = searchParams.get('market') as 'US' | 'HK'

    if (symbol && market) {
      // 获取单个股票价格
      const config = getStockPriceConfig()
      let quote
      
      if (config.mockMode || !config.useRealApi) {
        quote = getMockStockQuote(symbol, market)
      } else {
        const quotes = await getBatchStockQuotes([{ symbol, market }])
        quote = quotes[0] || null
      }

      return NextResponse.json({
        success: true,
        data: quote,
      })
    } else {
      // 获取用户所有持仓的价格
      const positions = await db.position.findMany({
        where: {
          userId: session.user.id,
          quantity: { gt: 0 },
        },
        select: {
          stockCode: true,
          market: true,
          stockName: true,
        },
      })

      // 过滤掉现金持仓
      const stockPositions = positions.filter(p => !isCashPosition(p.stockCode))

      const config = getStockPriceConfig()
      let quotes = []

      if (config.mockMode || !config.useRealApi) {
        // 使用模拟数据
        quotes = stockPositions.map(pos => 
          getMockStockQuote(pos.stockCode, pos.market as 'US' | 'HK')
        )
      } else {
        // 获取真实价格
        const stocksToFetch = stockPositions.map(pos => ({
          symbol: pos.stockCode,
          market: pos.market as 'US' | 'HK'
        }))
        
        quotes = await getBatchStockQuotes(stocksToFetch)
      }

      return NextResponse.json({
        success: true,
        data: quotes,
        count: quotes.length,
      })
    }
  } catch (error) {
    console.error('获取股票价格失败:', error)
    return NextResponse.json(
      { success: false, error: '获取股票价格失败' },
      { status: 500 }
    )
  }
}

// POST /api/prices/update - 更新持仓价格
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { updateAll = false, symbols = [] } = body

    let positions
    
    if (updateAll) {
      // 更新所有持仓价格
      positions = await db.position.findMany({
        where: {
          userId: session.user.id,
          quantity: { gt: 0 },
        },
        select: {
          id: true,
          stockCode: true,
          market: true,
          stockName: true,
        },
      })
    } else {
      // 更新指定股票价格
      positions = await db.position.findMany({
        where: {
          userId: session.user.id,
          quantity: { gt: 0 },
          stockCode: { in: symbols },
        },
        select: {
          id: true,
          stockCode: true,
          market: true,
          stockName: true,
        },
      })
    }

    // 过滤掉现金持仓
    const stockPositions = positions.filter(p => !isCashPosition(p.stockCode))

    if (stockPositions.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要更新的股票持仓',
        updatedCount: 0,
      })
    }

    const config = getStockPriceConfig()
    let quotes = []

    if (config.mockMode || !config.useRealApi) {
      // 使用模拟数据
      quotes = stockPositions.map(pos => 
        getMockStockQuote(pos.stockCode, pos.market as 'US' | 'HK')
      )
    } else {
      // 获取真实价格
      const stocksToFetch = stockPositions.map(pos => ({
        symbol: pos.stockCode,
        market: pos.market as 'US' | 'HK'
      }))
      
      quotes = await getBatchStockQuotes(stocksToFetch)
    }

    // 更新数据库中的价格
    let updatedCount = 0
    
    for (const quote of quotes) {
      try {
        const result = await db.position.updateMany({
          where: {
            userId: session.user.id,
            stockCode: quote.symbol,
          },
          data: {
            lastPrice: quote.price,
          },
        })
        
        updatedCount += result.count
      } catch (error) {
        console.error(`Failed to update price for ${quote.symbol}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功更新 ${updatedCount} 个持仓的价格`,
      updatedCount,
      quotes: quotes.slice(0, 10), // 只返回前10个用于调试
    })
  } catch (error) {
    console.error('更新股票价格失败:', error)
    return NextResponse.json(
      { success: false, error: '更新股票价格失败' },
      { status: 500 }
    )
  }
} 