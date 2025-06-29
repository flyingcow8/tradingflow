import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始播种测试数据...')

  // 创建测试用户（这里通常由 NextAuth 自动创建，但我们可以创建一些示例数据）
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: '测试用户',
      image: 'https://via.placeholder.com/150',
    },
  })

  console.log('✅ 创建测试用户:', testUser.email)

  // 创建示例交易记录
  const sampleTransactions = [
    {
      userId: testUser.id,
      market: 'US' as const,
      stockCode: 'AAPL',
      stockName: 'Apple Inc.',
      transactionType: 'BUY' as const,
      quantity: 100,
      price: 150.25,
      currency: 'USD' as const,
      transactionDate: new Date('2024-01-15'),
      commission: 2.99,
      notes: '长期投资苹果股票',
    },
    {
      userId: testUser.id,
      market: 'US' as const,
      stockCode: 'TSLA',
      stockName: 'Tesla, Inc.',
      transactionType: 'BUY' as const,
      quantity: 50,
      price: 245.67,
      currency: 'USD' as const,
      transactionDate: new Date('2024-01-20'),
      commission: 2.99,
      notes: '看好电动车前景',
    },
    {
      userId: testUser.id,
      market: 'HK' as const,
      stockCode: '0700',
      stockName: '腾讯控股',
      transactionType: 'BUY' as const,
      quantity: 200,
      price: 320.50,
      currency: 'HKD' as const,
      transactionDate: new Date('2024-01-25'),
      commission: 15.0,
      notes: '港股科技股投资',
    },
    {
      userId: testUser.id,
      market: 'US' as const,
      stockCode: 'AAPL',
      stockName: 'Apple Inc.',
      transactionType: 'SELL' as const,
      quantity: 30,
      price: 165.80,
      currency: 'USD' as const,
      transactionDate: new Date('2024-02-10'),
      commission: 2.99,
      notes: '部分获利了结',
    },
  ]

  for (const transaction of sampleTransactions) {
    await prisma.transaction.create({
      data: transaction,
    })
  }

  console.log('✅ 创建示例交易记录:', sampleTransactions.length, '条')

  // 创建示例持仓（通常由系统自动计算，但这里手动创建用于测试）
  const samplePositions = [
    {
      userId: testUser.id,
      market: 'US' as const,
      stockCode: 'AAPL',
      stockName: 'Apple Inc.',
      quantity: 70, // 100 - 30 = 70
      averageCost: 150.25,
      currency: 'USD' as const,
      lastPrice: 168.50,
    },
    {
      userId: testUser.id,
      market: 'US' as const,
      stockCode: 'TSLA',
      stockName: 'Tesla, Inc.',
      quantity: 50,
      averageCost: 245.67,
      currency: 'USD' as const,
      lastPrice: 220.30,
    },
    {
      userId: testUser.id,
      market: 'HK' as const,
      stockCode: '0700',
      stockName: '腾讯控股',
      quantity: 200,
      averageCost: 320.50,
      currency: 'HKD' as const,
      lastPrice: 315.00,
    },
  ]

  for (const position of samplePositions) {
    await prisma.position.create({
      data: position,
    })
  }

  console.log('✅ 创建示例持仓:', samplePositions.length, '条')
  console.log('🎉 种子数据播种完成！')
}

main()
  .catch((e) => {
    console.error('❌ 播种数据时出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 