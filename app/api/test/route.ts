import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/test - 测试数据库连接和认证
export async function GET(request: NextRequest) {
  try {
    // 测试会话
    const session = await getServerSession(authOptions)
    
    // 测试数据库连接
    await db.$connect()
    const userCount = await db.user.count()
    
    return NextResponse.json({
      success: true,
      message: '系统运行正常',
      data: {
        authenticated: !!session,
        user: session?.user || null,
        database: {
          connected: true,
          userCount,
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('系统测试失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '系统测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  } finally {
    await db.$disconnect()
  }
} 