#!/usr/bin/env node

/**
 * 生产环境股价API测试脚本
 * 用于验证生产环境的股价API配置
 */

const PRODUCTION_URL = process.argv[2] || 'https://your-app.vercel.app'

async function testProductionAPI() {
  console.log('🚀 测试生产环境股价API')
  console.log(`🌐 目标URL: ${PRODUCTION_URL}`)
  console.log('==========================================\n')

  try {
    // 1. 测试系统状态
    console.log('📡 测试系统状态...')
    const systemResponse = await fetch(`${PRODUCTION_URL}/api/test`)
    const systemData = await systemResponse.json()
    
    if (systemData.success) {
      console.log('✅ 系统状态: 正常')
      console.log(`   数据库连接: ${systemData.data.database.connected ? '✅ 已连接' : '❌ 未连接'}`)
    } else {
      console.log('❌ 系统状态: 异常')
      return
    }

    // 2. 测试股价API（需要认证，这里只是检查端点响应）
    console.log('\n📈 测试股价API端点...')
    const priceResponse = await fetch(`${PRODUCTION_URL}/api/prices`)
    
    if (priceResponse.status === 401) {
      console.log('✅ 股价API端点: 正常（需要认证）')
    } else if (priceResponse.ok) {
      console.log('✅ 股价API端点: 正常')
    } else {
      console.log(`❌ 股价API端点: 错误 (${priceResponse.status})`)
    }

    // 3. 检查特定股票价格（使用公开测试）
    console.log('\n🏢 测试Yahoo Finance连接...')
    try {
      const testSymbol = 'AAPL'
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${testSymbol}?interval=1d&range=1d`
      
      const yahooResponse = await fetch(yahooUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StockPriceTest/1.0)'
        }
      })

      if (yahooResponse.ok) {
        const yahooData = await yahooResponse.json()
        if (yahooData.chart?.result?.[0]?.meta?.regularMarketPrice) {
          const price = yahooData.chart.result[0].meta.regularMarketPrice
          console.log(`✅ Yahoo Finance连接: 正常`)
          console.log(`   AAPL价格: $${price.toFixed(2)}`)
        } else {
          console.log('⚠️  Yahoo Finance: 数据格式异常')
        }
      } else {
        console.log('❌ Yahoo Finance连接: 失败')
      }
    } catch (error) {
      console.log('❌ Yahoo Finance测试失败:', error.message)
    }

    console.log('\n🎉 测试完成！')
    console.log('\n📋 下一步:')
    console.log('1. 登录您的生产应用')
    console.log('2. 添加一些股票持仓')
    console.log('3. 点击"刷新价格"按钮测试真实API')
    console.log('4. 查看浏览器控制台日志验证')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 如果URL未提供，显示帮助信息
if (!process.argv[2]) {
  console.log('使用方法:')
  console.log('node scripts/test-production-api.js https://your-app.vercel.app')
  console.log('')
  console.log('或者设置您的生产URL并运行:')
  console.log('node scripts/test-production-api.js')
} else {
  testProductionAPI()
} 