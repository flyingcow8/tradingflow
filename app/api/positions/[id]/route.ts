import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/positions/[id] - 获取单个持仓
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const position = await db.position.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!position) {
      return NextResponse.json({ error: '持仓不存在' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: position,
    })
  } catch (error) {
    console.error('获取持仓失败:', error)
    return NextResponse.json(
      { success: false, error: '获取持仓失败' },
      { status: 500 }
    )
  }
}

// PUT /api/positions/[id] - 更新持仓
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { stockName, quantity, averageCost } = body

    // 验证持仓是否存在且属于当前用户
    const existingPosition = await db.position.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingPosition) {
      return NextResponse.json({ error: '持仓不存在' }, { status: 404 })
    }

    // 验证数据
    if (!stockName || typeof quantity !== 'number' || typeof averageCost !== 'number') {
      return NextResponse.json(
        { success: false, error: '请提供有效的股票名称、数量和平均成本' },
        { status: 400 }
      )
    }

    if (quantity <= 0 || averageCost <= 0) {
      return NextResponse.json(
        { success: false, error: '数量和平均成本必须大于0' },
        { status: 400 }
      )
    }

    // 更新持仓
    const updatedPosition = await db.position.update({
      where: { id: params.id },
      data: {
        stockName,
        quantity,
        averageCost,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedPosition,
      message: '持仓更新成功',
    })
  } catch (error) {
    console.error('更新持仓失败:', error)
    return NextResponse.json(
      { success: false, error: '更新持仓失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/positions/[id] - 删除持仓
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 验证持仓是否存在且属于当前用户
    const existingPosition = await db.position.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingPosition) {
      return NextResponse.json({ error: '持仓不存在' }, { status: 404 })
    }

    // 删除持仓
    await db.position.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: '持仓已删除',
    })
  } catch (error) {
    console.error('删除持仓失败:', error)
    return NextResponse.json(
      { success: false, error: '删除持仓失败' },
      { status: 500 }
    )
  }
} 