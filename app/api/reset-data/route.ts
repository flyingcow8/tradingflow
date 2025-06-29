import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/reset-data - 重置用户的所有交易数据
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const userId = session.user.id

    // 开始数据库事务，确保原子性操作
    const result = await db.$transaction(async (prisma) => {
      // 1. 删除所有交易记录
      const deletedTransactions = await prisma.transaction.deleteMany({
        where: { userId },
      })

      // 2. 删除所有持仓（包括股票和现金）
      const deletedPositions = await prisma.position.deleteMany({
        where: { userId },
      })

      return {
        deletedTransactions: deletedTransactions.count,
        deletedPositions: deletedPositions.count,
      }
    })

    console.log(`用户 ${userId} 重置数据完成:`, result)

    return NextResponse.json({
      success: true,
      message: '数据重置成功',
      data: {
        deletedTransactions: result.deletedTransactions,
        deletedPositions: result.deletedPositions,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('重置数据失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '重置数据失败' 
      },
      { status: 500 }
    )
  }
} 