import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TransactionFormData } from '@/types'

// GET /api/transactions - 获取交易记录列表
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
    const transactionType = searchParams.get('transactionType')

    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {
      userId: session.user.id,
    }

    if (market) where.market = market
    if (stockCode) where.stockCode = { contains: stockCode, mode: 'insensitive' }
    if (transactionType) where.transactionType = transactionType

    // 获取总数和分页数据
    const [total, transactions] = await Promise.all([
      db.transaction.count({ where }),
      db.transaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip,
        take: pageSize,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('获取交易记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取交易记录失败' },
      { status: 500 }
    )
  }
}

// POST /api/transactions - 创建新的交易记录
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received transaction data:', body) // 调试日志

    // 完整的数据验证
    const requiredFields = ['market', 'stockCode', 'stockName', 'transactionType', 'quantity', 'price', 'currency', 'transactionDate']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `缺少必填字段: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // 数据类型验证
    if (typeof body.quantity !== 'number' || body.quantity <= 0) {
      return NextResponse.json(
        { success: false, error: '数量必须是大于0的数字' },
        { status: 400 }
      )
    }

    if (typeof body.price !== 'number' || body.price <= 0) {
      return NextResponse.json(
        { success: false, error: '价格必须是大于0的数字' },
        { status: 400 }
      )
    }

    if (!['US', 'HK'].includes(body.market)) {
      return NextResponse.json(
        { success: false, error: '市场必须是 US 或 HK' },
        { status: 400 }
      )
    }

    if (!['BUY', 'SELL'].includes(body.transactionType)) {
      return NextResponse.json(
        { success: false, error: '交易类型必须是 BUY 或 SELL' },
        { status: 400 }
      )
    }

    if (!['USD', 'HKD'].includes(body.currency)) {
      return NextResponse.json(
        { success: false, error: '货币必须是 USD 或 HKD' },
        { status: 400 }
      )
    }

    // 创建交易记录
    const transaction = await db.transaction.create({
      data: {
        userId: session.user.id,
        market: body.market,
        stockCode: body.stockCode.toUpperCase(),
        stockName: body.stockName,
        transactionType: body.transactionType,
        quantity: body.quantity,
        price: body.price,
        currency: body.currency,
        transactionDate: new Date(body.transactionDate),
        commission: body.commission || 0,
        notes: body.notes,
      },
    })

    console.log('Created transaction:', transaction) // 调试日志

    // 更新持仓
    await updatePosition(session.user.id, transaction)

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error('创建交易记录失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '创建交易记录失败' 
      },
      { status: 500 }
    )
  }
}

// 更新持仓的辅助函数
async function updatePosition(userId: string, transaction: any) {
  // 1. 更新股票持仓
  await updateStockPosition(userId, transaction)
  
  // 2. 更新现金持仓
  await updateCashPosition(userId, transaction)
}

// 更新股票持仓
async function updateStockPosition(userId: string, transaction: any) {
  const existingPosition = await db.position.findUnique({
    where: {
      userId_stockCode_market: {
        userId,
        stockCode: transaction.stockCode,
        market: transaction.market,
      },
    },
  })

  if (transaction.transactionType === 'BUY') {
    if (existingPosition) {
      // 更新现有持仓
      const newQuantity = existingPosition.quantity + transaction.quantity
      const newAverageCost = 
        (Number(existingPosition.averageCost) * existingPosition.quantity + 
         Number(transaction.price) * transaction.quantity) / newQuantity

      await db.position.update({
        where: { id: existingPosition.id },
        data: {
          quantity: newQuantity,
          averageCost: newAverageCost,
        },
      })
    } else {
      // 创建新持仓
      await db.position.create({
        data: {
          userId,
          market: transaction.market,
          stockCode: transaction.stockCode,
          stockName: transaction.stockName,
          quantity: transaction.quantity,
          averageCost: transaction.price,
          currency: transaction.currency,
        },
      })
    }
  } else if (transaction.transactionType === 'SELL') {
    if (!existingPosition) {
      throw new Error(`无法卖出 ${transaction.stockCode}：您没有持有该股票`)
    }
    
    if (existingPosition.quantity < transaction.quantity) {
      throw new Error(`股票数量不足！当前持有 ${existingPosition.quantity} 股，尝试卖出 ${transaction.quantity} 股`)
    }
    
    const newQuantity = existingPosition.quantity - transaction.quantity
    
    if (newQuantity > 0) {
      await db.position.update({
        where: { id: existingPosition.id },
        data: { quantity: newQuantity },
      })
    } else {
      // 完全卖出，删除持仓
      await db.position.delete({
        where: { id: existingPosition.id },
      })
    }
  }
}

// 更新现金持仓
async function updateCashPosition(userId: string, transaction: any) {
  // 确定现金类型和信息
  const cashStockCode = `CASH_${transaction.currency}` // CASH_USD 或 CASH_HKD
  const cashStockName = transaction.currency === 'USD' ? 'USD Cash' : 'HKD Cash'
  
  // 计算交易总额（包含手续费）
  const transactionAmount = Number(transaction.price) * transaction.quantity
  const totalCost = transactionAmount + Number(transaction.commission || 0)
  
  // 查找现金持仓 - 现金使用特殊的market标识
  let existingCashPosition = await db.position.findUnique({
    where: {
      userId_stockCode_market: {
        userId,
        stockCode: cashStockCode,
        market: transaction.market, // 现金持仓按交易市场分类
      },
    },
  })
  
  if (transaction.transactionType === 'BUY') {
    // 买入：减少现金
    if (existingCashPosition) {
      const currentCashAmount = Number(existingCashPosition.averageCost) * existingCashPosition.quantity
      const newCashAmount = currentCashAmount - totalCost
      
      if (newCashAmount < 0) {
        throw new Error(`${transaction.currency}现金不足！当前余额: ${currentCashAmount.toFixed(2)}, 需要: ${totalCost.toFixed(2)}`)
      }
      
      await db.position.update({
        where: { id: existingCashPosition.id },
        data: {
          quantity: 1, // 现金持仓数量始终为1
          averageCost: newCashAmount, // 用averageCost存储现金余额
        },
      })
    } else {
      throw new Error(`没有找到${transaction.currency}现金账户！请先添加${transaction.currency}现金持仓。`)
    }
  } else if (transaction.transactionType === 'SELL') {
    // 卖出：增加现金
    const cashReceived = transactionAmount - Number(transaction.commission || 0)
    
    if (existingCashPosition) {
      const currentCashAmount = Number(existingCashPosition.averageCost) * existingCashPosition.quantity
      const newCashAmount = currentCashAmount + cashReceived
      
      await db.position.update({
        where: { id: existingCashPosition.id },
        data: {
          quantity: 1,
          averageCost: newCashAmount,
        },
      })
    } else {
      // 如果没有现金持仓，创建一个
      await db.position.create({
        data: {
          userId,
          market: transaction.market, // 使用相同的市场便于数据一致性
          stockCode: cashStockCode,
          stockName: cashStockName,
          quantity: 1,
          averageCost: cashReceived,
          currency: transaction.currency,
        },
      })
    }
  }
} 