import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { convertToUSD, formatCurrencyInUSD } from '@/lib/currency'

// GET /api/stats - 获取统计数据
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'portfolio' | 'trading' | 'all' | 'dashboard'

    const userId = session.user.id

    let portfolioStats = null
    let tradingStats = null
    let dashboardStats = null

    if (type === 'dashboard') {
      dashboardStats = await getDashboardStats(userId)
      return NextResponse.json({
        success: true,
        data: dashboardStats,
      })
    }

    if (type === 'portfolio' || type === 'all' || !type) {
      portfolioStats = await getPortfolioStats(userId)
    }

    if (type === 'trading' || type === 'all' || !type) {
      tradingStats = await getTradingStats(userId)
    }

    return NextResponse.json({
      success: true,
      data: {
        portfolio: portfolioStats,
        trading: tradingStats,
      },
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    )
  }
}

// 获取仪表板统计数据
async function getDashboardStats(userId: string) {
  // 获取所有持仓
  const positions = await db.position.findMany({
    where: {
      userId,
      quantity: { gt: 0 },
    },
  })

  // 获取今日交易记录
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayTransactions = await db.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  })

  // 计算总资产（统一转换为美元）
  let totalAssetsUSD = 0
  let totalCostBasisUSD = 0
  let cashPositionsUSD = 0

  positions.forEach(position => {
    const cost = Number(position.averageCost) * position.quantity
    const currentValue = position.lastPrice 
      ? Number(position.lastPrice) * position.quantity 
      : cost

    // 转换为美元
    const costUSD = convertToUSD(cost, position.currency)
    const currentValueUSD = convertToUSD(currentValue, position.currency)

    totalCostBasisUSD += costUSD
    totalAssetsUSD += currentValueUSD

    // 检查是否为现金持仓
    if (position.stockCode.startsWith('CASH_')) {
      cashPositionsUSD += currentValueUSD
    }
  })

  // 计算总收益（美元）
  const totalReturnUSD = totalAssetsUSD - totalCostBasisUSD
  const totalReturnPercentage = totalCostBasisUSD > 0 ? (totalReturnUSD / totalCostBasisUSD) * 100 : 0

  // 计算今日损益（基于股价变动，转换为美元）
  // 注意：这需要昨日收盘价数据，目前使用简化计算
  let todayPLUSD = 0
  
  // 方法1：基于今日交易的简化损益（暂时使用）
  // 实际的今日损益需要：(今日价格 - 昨日价格) × 持仓数量
  // 由于缺少历史价格数据，暂时计算今日交易的净影响
  
  const hasRealPriceData = positions.some(p => p.lastPrice && !p.stockCode.startsWith('CASH_'))
  
  if (hasRealPriceData) {
    // 如果有实时价格数据，计算基于价格变动的简化损益
    // 这里使用当前价格vs平均成本的一个小比例作为今日变动的估算
    positions.forEach(position => {
      if (!position.stockCode.startsWith('CASH_') && position.lastPrice) {
        const currentPrice = Number(position.lastPrice)
        const averagePrice = Number(position.averageCost)
        
        // 简化计算：假设今日价格变动为总变动的5%（模拟日内波动）
        const estimatedDailyChange = (currentPrice - averagePrice) * 0.05
        const dailyPLInOriginalCurrency = estimatedDailyChange * position.quantity
        
        // 转换为美元
        todayPLUSD += convertToUSD(dailyPLInOriginalCurrency, position.currency)
      }
    })
  } else {
    // 如果没有实时价格数据，使用交易流水计算
    todayTransactions.forEach(transaction => {
      const transactionValue = Number(transaction.price) * transaction.quantity
      const commission = Number(transaction.commission || 0)
      
      // 转换为美元
      const transactionValueUSD = convertToUSD(transactionValue, transaction.currency)
      const commissionUSD = convertToUSD(commission, transaction.currency)
      
      if (transaction.transactionType === 'BUY') {
        // 买入：现金减少（负收益）
        todayPLUSD -= commissionUSD // 只计算手续费损失
      } else {
        // 卖出：获得现金减去手续费
        todayPLUSD -= commissionUSD // 只计算手续费损失
      }
    })
  }

  // 持仓数量（不包括现金）
  const stockPositions = positions.filter(p => !p.stockCode.startsWith('CASH_'))
  const positionCount = stockPositions.length

  return {
    totalAssets: totalAssetsUSD,
    totalAssetsFormatted: formatCurrencyInUSD(totalAssetsUSD),
    todayPL: todayPLUSD,
    todayPLFormatted: formatCurrencyInUSD(Math.abs(todayPLUSD)),
    todayPLTrend: todayPLUSD >= 0 ? 'up' : 'down',
    todayPLSign: todayPLUSD >= 0 ? '+' : '-',
    totalReturn: totalReturnUSD,
    totalReturnFormatted: formatCurrencyInUSD(Math.abs(totalReturnUSD)),
    totalReturnTrend: totalReturnUSD >= 0 ? 'up' : 'down',
    totalReturnSign: totalReturnUSD >= 0 ? '+' : '-',
    totalReturnPercentage,
    positionCount,
    cashAmount: cashPositionsUSD,
    todayTransactionCount: todayTransactions.length,
  }
}

// 格式化货币的辅助函数（保持原有的人民币格式，用于兼容）
function formatCurrency(amount: number): string {
  return formatCurrencyInUSD(amount)
}

// 获取组合统计数据
async function getPortfolioStats(userId: string) {
  const positions = await db.position.findMany({
    where: {
      userId,
      quantity: { gt: 0 },
    },
  })

  let totalValueUSD = 0
  let totalCostUSD = 0
  let usPositions = 0
  let hkPositions = 0
  let usValueUSD = 0
  let hkValueUSD = 0

  positions.forEach(position => {
    const cost = Number(position.averageCost) * position.quantity
    const currentValue = position.lastPrice 
      ? Number(position.lastPrice) * position.quantity 
      : cost

    // 转换为美元
    const costUSD = convertToUSD(cost, position.currency)
    const currentValueUSD = convertToUSD(currentValue, position.currency)

    totalCostUSD += costUSD
    totalValueUSD += currentValueUSD

    if (position.market === 'US') {
      usPositions++
      usValueUSD += currentValueUSD
    } else {
      hkPositions++
      hkValueUSD += currentValueUSD
    }
  })

  const totalProfitLossUSD = totalValueUSD - totalCostUSD
  const totalProfitLossPercentage = totalCostUSD > 0 ? (totalProfitLossUSD / totalCostUSD) * 100 : 0

  return {
    totalValue: totalValueUSD,
    totalCost: totalCostUSD,
    totalProfitLoss: totalProfitLossUSD,
    totalProfitLossPercentage,
    positionCount: positions.length,
    marketDistribution: {
      US: { 
        value: usValueUSD, 
        percentage: totalValueUSD > 0 ? (usValueUSD / totalValueUSD) * 100 : 0,
        count: usPositions
      },
      HK: { 
        value: hkValueUSD, 
        percentage: totalValueUSD > 0 ? (hkValueUSD / totalValueUSD) * 100 : 0,
        count: hkPositions
      }
    }
  }
}

// 获取交易统计数据
async function getTradingStats(userId: string) {
  const [
    totalTransactions,
    buyTransactions,
    sellTransactions,
    totalCommission,
    mostTradedStock
  ] = await Promise.all([
    // 总交易次数
    db.transaction.count({
      where: { userId }
    }),
    // 买入交易次数
    db.transaction.count({
      where: { userId, transactionType: 'BUY' }
    }),
    // 卖出交易次数
    db.transaction.count({
      where: { userId, transactionType: 'SELL' }
    }),
    // 总手续费
    db.transaction.aggregate({
      where: { userId },
      _sum: { commission: true }
    }),
    // 最常交易的股票
    db.transaction.groupBy({
      by: ['stockCode', 'stockName'],
      where: { userId },
      _count: {
        stockCode: true
      },
      orderBy: { 
        _count: { 
          stockCode: 'desc' 
        } 
      },
      take: 1
    })
  ])

  // 计算平均交易规模
  const transactions = await db.transaction.findMany({
    where: { userId },
    select: { price: true, quantity: true }
  })

  const totalTransactionValue = transactions.reduce((sum, t) => 
    sum + (Number(t.price) * t.quantity), 0
  )
  const averageTransactionSize = totalTransactions > 0 
    ? totalTransactionValue / totalTransactions 
    : 0

  return {
    totalTransactions,
    totalBuyTransactions: buyTransactions,
    totalSellTransactions: sellTransactions,
    totalCommission: Number(totalCommission._sum.commission) || 0,
    averageTransactionSize,
    mostTradedStock: mostTradedStock.length > 0 ? {
      stockCode: mostTradedStock[0].stockCode,
      stockName: mostTradedStock[0].stockName,
      transactionCount: mostTradedStock[0]._count.stockCode
    } : null
  }
} 