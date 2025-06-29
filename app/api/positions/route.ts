import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// 映射前端交易所名称到数据库市场代码
function mapMarketToDbValue(market: string): 'US' | 'HK' {
  const marketMap: { [key: string]: 'US' | 'HK' } = {
    'NASDAQ': 'US',
    'NYSE': 'US', 
    'HKEX': 'HK',
    // 向后兼容
    'US': 'US',
    'HK': 'HK'
  }
  return marketMap[market] || 'US' // 默认返回US
}

// GET /api/positions - 获取持仓列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const market = searchParams.get('market')
    const stockCode = searchParams.get('stockCode')

    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {
      userId: session.user.id,
      quantity: { gt: 0 }, // 只显示有持仓的股票
    }

    if (market) where.market = market
    if (stockCode) where.stockCode = { contains: stockCode, mode: 'insensitive' }

    // 获取总数和分页数据
    const [total, positions] = await Promise.all([
      db.position.count({ where }),
      db.position.findMany({
        where,
        orderBy: [
          { market: 'asc' },
          { stockCode: 'asc' },
        ],
        skip,
        take: pageSize,
      }),
    ])

    // 计算额外的统计信息
    const positionsWithStats = positions.map(position => {
      const currentValue = position.lastPrice 
        ? Number(position.lastPrice) * position.quantity 
        : Number(position.averageCost) * position.quantity
      
      const cost = Number(position.averageCost) * position.quantity
      const profitLoss = currentValue - cost
      const profitLossPercentage = cost > 0 ? (profitLoss / cost) * 100 : 0

      return {
        ...position,
        currentValue,
        profitLoss,
        profitLossPercentage,
      }
    })

    return NextResponse.json({
      success: true,
      data: positionsWithStats,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('获取持仓列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取持仓列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/positions - 手动添加持仓
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()

    // 检查是否是批量更新价格的请求
    if (body.stockUpdates) {
      return handleBatchPriceUpdate(session.user.id, body.stockUpdates)
    }

    // 手动添加持仓的请求
    const { market, stockCode, stockName, quantity, averageCost, currency, currentPrice } = body

    // 基础验证
    if (!market || !stockCode || !stockName || !quantity || !averageCost || !currency) {
      return NextResponse.json(
        { success: false, error: '必填字段不能为空' },
        { status: 400 }
      )
    }

    if (quantity <= 0 || averageCost <= 0) {
      return NextResponse.json(
        { success: false, error: '数量和价格必须大于0' },
        { status: 400 }
      )
    }

    // 检查是否已存在该持仓
    const dbMarket = mapMarketToDbValue(market)
    const existingPosition = await db.position.findUnique({
      where: {
        userId_stockCode_market: {
          userId: session.user.id,
          stockCode: stockCode.toUpperCase(),
          market: dbMarket,
        },
      },
    })

    if (existingPosition) {
      // 如果已存在，则更新持仓
      const newQuantity = existingPosition.quantity + quantity
      const newAverageCost = 
        (Number(existingPosition.averageCost) * existingPosition.quantity + averageCost * quantity) / newQuantity

      const updatedPosition = await db.position.update({
        where: { id: existingPosition.id },
        data: {
          quantity: newQuantity,
          averageCost: newAverageCost,
          lastPrice: currentPrice || existingPosition.lastPrice,
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedPosition,
        message: '持仓已更新',
      })
    } else {
      // 创建新持仓
      const newPosition = await db.position.create({
        data: {
          userId: session.user.id,
          market: dbMarket,
          stockCode: stockCode.toUpperCase(),
          stockName,
          quantity,
          averageCost,
          currency,
          lastPrice: currentPrice,
        },
      })

      return NextResponse.json({
        success: true,
        data: newPosition,
        message: '持仓添加成功',
      })
    }
  } catch (error) {
    console.error('添加持仓失败:', error)
    return NextResponse.json(
      { success: false, error: '添加持仓失败' },
      { status: 500 }
    )
  }
}

// 批量更新股票价格的辅助函数
async function handleBatchPriceUpdate(userId: string, stockUpdates: any[]) {
  try {
    if (!Array.isArray(stockUpdates)) {
      return NextResponse.json(
        { success: false, error: '无效的更新数据格式' },
        { status: 400 }
      )
    }

    // 批量更新股票价格
    const updatePromises = stockUpdates.map(async (update: any) => {
      if (!update.stockCode || !update.market || update.price === undefined) {
        return null
      }

      return db.position.updateMany({
        where: {
          userId,
          stockCode: update.stockCode,
          market: update.market,
        },
        data: {
          lastPrice: update.price,
        },
      })
    })

    await Promise.all(updatePromises.filter(p => p !== null))

    return NextResponse.json({
      success: true,
      message: '股票价格更新成功',
    })
  } catch (error) {
    console.error('更新股票价格失败:', error)
    return NextResponse.json(
      { success: false, error: '更新股票价格失败' },
      { status: 500 }
    )
  }
} 