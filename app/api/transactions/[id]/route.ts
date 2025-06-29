import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { EditTransactionFormData } from '@/types'

// GET /api/transactions/[id] - 获取单个交易记录
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const transaction = await db.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: '交易记录不存在' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error('获取交易记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取交易记录失败' },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/[id] - 更新交易记录
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body: EditTransactionFormData = await request.json()

    // 验证交易记录是否存在且属于当前用户
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: '交易记录不存在' }, { status: 404 })
    }

    // 更新交易记录
    const updatedTransaction = await db.transaction.update({
      where: { id: params.id },
      data: {
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

    // 重新计算持仓（这里可以优化为增量更新）
    await recalculatePosition(session.user.id, updatedTransaction.stockCode, updatedTransaction.market)

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
    })
  } catch (error) {
    console.error('更新交易记录失败:', error)
    return NextResponse.json(
      { success: false, error: '更新交易记录失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - 删除交易记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 验证交易记录是否存在且属于当前用户
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: '交易记录不存在' }, { status: 404 })
    }

    // 删除交易记录
    await db.transaction.delete({
      where: { id: params.id },
    })

    // 重新计算持仓
    await recalculatePosition(session.user.id, existingTransaction.stockCode, existingTransaction.market)

    return NextResponse.json({
      success: true,
      message: '交易记录已删除',
    })
  } catch (error) {
    console.error('删除交易记录失败:', error)
    return NextResponse.json(
      { success: false, error: '删除交易记录失败' },
      { status: 500 }
    )
  }
}

// 重新计算持仓的辅助函数
async function recalculatePosition(userId: string, stockCode: string, market: string) {
  // 获取该股票的所有交易记录
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      stockCode,
      market,
    },
    orderBy: { transactionDate: 'asc' },
  })

  let totalQuantity = 0
  let totalCost = 0
  let stockName = ''

  for (const transaction of transactions) {
    stockName = transaction.stockName
    
    if (transaction.transactionType === 'BUY') {
      totalQuantity += transaction.quantity
      totalCost += Number(transaction.price) * transaction.quantity
    } else {
      totalQuantity -= transaction.quantity
      // 卖出时按平均成本计算
      if (totalQuantity > 0) {
        const avgCost = totalCost / (totalQuantity + transaction.quantity)
        totalCost = avgCost * totalQuantity
      }
    }
  }

  // 删除或更新持仓
  if (totalQuantity <= 0) {
    await db.position.deleteMany({
      where: {
        userId,
        stockCode,
        market,
      },
    })
  } else {
    const averageCost = totalCost / totalQuantity
    
    await db.position.upsert({
      where: {
        userId_stockCode_market: {
          userId,
          stockCode,
          market,
        },
      },
      update: {
        quantity: totalQuantity,
        averageCost,
      },
      create: {
        userId,
        market,
        stockCode,
        stockName,
        quantity: totalQuantity,
        averageCost,
        currency: transactions[0]?.currency || 'USD',
      },
    })
  }
} 