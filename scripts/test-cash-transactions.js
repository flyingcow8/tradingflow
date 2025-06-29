#!/usr/bin/env node

/**
 * 测试现金交易功能
 * 验证买入和卖出股票时现金持仓的自动更新
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  console.log('🧪 开始测试现金交易功能...\n')

  // 获取第一个用户
  const user = await db.user.findFirst()
  if (!user) {
    console.log('❌ 没有找到用户，请先登录系统')
    return
  }

  console.log(`👤 使用用户: ${user.name} (${user.email})`)

  try {
    // 1. 清空现有数据
    console.log('\n🧹 清空测试数据...')
    await db.transaction.deleteMany({ where: { userId: user.id } })
    await db.position.deleteMany({ where: { userId: user.id } })

    // 2. 添加初始现金
    console.log('\n💰 添加初始现金...')
    const usdCash = await db.position.create({
      data: {
        userId: user.id,
        market: 'US',
        stockCode: 'CASH_USD',
        stockName: 'USD Cash',
        quantity: 1,
        averageCost: 10000, // $10,000
        currency: 'USD',
      },
    })

    const hkdCash = await db.position.create({
      data: {
        userId: user.id,
        market: 'HK',
        stockCode: 'CASH_HKD',
        stockName: 'HKD Cash',
        quantity: 1,
        averageCost: 78000, // HK$78,000
        currency: 'HKD',
      },
    })

    console.log(`✅ 添加USD现金: $${usdCash.averageCost}`)
    console.log(`✅ 添加HKD现金: HK$${hkdCash.averageCost}`)

    // 3. 测试买入AAPL股票
    console.log('\n📈 测试买入AAPL股票...')
    const buyTransaction = await db.transaction.create({
      data: {
        userId: user.id,
        market: 'US',
        stockCode: 'AAPL',
        stockName: 'Apple Inc.',
        transactionType: 'BUY',
        quantity: 10,
        price: 150.00,
        currency: 'USD',
        transactionDate: new Date(),
        commission: 5.00,
      },
    })

    // 手动调用更新持仓函数（模拟API调用）
    await updatePosition(user.id, buyTransaction)

    // 检查现金和股票持仓
    const updatedUsdCash = await db.position.findUnique({
      where: {
        userId_stockCode_market: {
          userId: user.id,
          stockCode: 'CASH_USD',
          market: 'US',
        },
      },
    })

    const aaplPosition = await db.position.findUnique({
      where: {
        userId_stockCode_market: {
          userId: user.id,
          stockCode: 'AAPL',
          market: 'US',
        },
      },
    })

    console.log(`✅ 买入后USD现金: $${updatedUsdCash.averageCost} (减少 $${10000 - updatedUsdCash.averageCost})`)
    console.log(`✅ AAPL持仓: ${aaplPosition.quantity}股，平均成本: $${aaplPosition.averageCost}`)

    // 4. 测试卖出部分AAPL股票
    console.log('\n📉 测试卖出部分AAPL股票...')
    const sellTransaction = await db.transaction.create({
      data: {
        userId: user.id,
        market: 'US',
        stockCode: 'AAPL',
        stockName: 'Apple Inc.',
        transactionType: 'SELL',
        quantity: 5,
        price: 155.00,
        currency: 'USD',
        transactionDate: new Date(),
        commission: 5.00,
      },
    })

    await updatePosition(user.id, sellTransaction)

    // 检查更新后的持仓
    const finalUsdCash = await db.position.findUnique({
      where: {
        userId_stockCode_market: {
          userId: user.id,
          stockCode: 'CASH_USD',
          market: 'US',
        },
      },
    })

    const finalAaplPosition = await db.position.findUnique({
      where: {
        userId_stockCode_market: {
          userId: user.id,
          stockCode: 'AAPL',
          market: 'US',
        },
      },
    })

    console.log(`✅ 卖出后USD现金: $${finalUsdCash.averageCost} (增加 $${finalUsdCash.averageCost - updatedUsdCash.averageCost})`)
    console.log(`✅ 剩余AAPL持仓: ${finalAaplPosition ? finalAaplPosition.quantity : 0}股`)

    // 5. 测试现金不足情况
    console.log('\n⚠️  测试现金不足情况...')
    let overBuyTransaction = null
    try {
      overBuyTransaction = await db.transaction.create({
        data: {
          userId: user.id,
          market: 'US',
          stockCode: 'TSLA',
          stockName: 'Tesla Inc.',
          transactionType: 'BUY',
          quantity: 100,
          price: 200.00, // $20,000 > 当前现金
          currency: 'USD',
          transactionDate: new Date(),
          commission: 10.00,
        },
      })

      await updatePosition(user.id, overBuyTransaction)
      console.log('❌ 应该抛出现金不足错误！')
    } catch (error) {
      console.log(`✅ 正确抛出错误: ${error.message}`)
      // 删除这个失败的交易记录
      if (overBuyTransaction) {
        await db.transaction.delete({ where: { id: overBuyTransaction.id } })
      }
    }

    console.log('\n🎉 现金交易功能测试完成！')

  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    await db.$disconnect()
  }
}

// 这里复制API中的updatePosition相关函数
async function updatePosition(userId, transaction) {
  await updateStockPosition(userId, transaction)
  await updateCashPosition(userId, transaction)
}

async function updateStockPosition(userId, transaction) {
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
      await db.position.delete({
        where: { id: existingPosition.id },
      })
    }
  }
}

async function updateCashPosition(userId, transaction) {
  const cashStockCode = `CASH_${transaction.currency}`
  const cashStockName = transaction.currency === 'USD' ? 'USD Cash' : 'HKD Cash'
  
  const transactionAmount = Number(transaction.price) * transaction.quantity
  const totalCost = transactionAmount + Number(transaction.commission || 0)
  
  let existingCashPosition = await db.position.findUnique({
    where: {
      userId_stockCode_market: {
        userId,
        stockCode: cashStockCode,
        market: transaction.market,
      },
    },
  })
  
  if (transaction.transactionType === 'BUY') {
    if (existingCashPosition) {
      const currentCashAmount = Number(existingCashPosition.averageCost) * existingCashPosition.quantity
      const newCashAmount = currentCashAmount - totalCost
      
      if (newCashAmount < 0) {
        throw new Error(`${transaction.currency}现金不足！当前余额: ${currentCashAmount.toFixed(2)}, 需要: ${totalCost.toFixed(2)}`)
      }
      
      await db.position.update({
        where: { id: existingCashPosition.id },
        data: {
          quantity: 1,
          averageCost: newCashAmount,
        },
      })
    } else {
      throw new Error(`没有找到${transaction.currency}现金账户！请先添加${transaction.currency}现金持仓。`)
    }
  } else if (transaction.transactionType === 'SELL') {
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
      await db.position.create({
        data: {
          userId,
          market: transaction.market,
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

if (require.main === module) {
  main().catch(console.error)
} 