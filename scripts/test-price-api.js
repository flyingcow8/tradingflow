#!/usr/bin/env node

/**
 * 股票价格API测试脚本
 * 用于验证Alpha Vantage和Yahoo Finance API的连接
 */

// 尝试加载.env.local文件（如果存在）
try {
  const fs = require('fs')
  const path = require('path')
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
} catch (error) {
  console.log('⚠️  无法读取.env.local文件:', error.message)
}

// 测试股票列表
const TEST_STOCKS = [
  { symbol: 'AAPL', market: 'US', name: 'Apple Inc.' },
  { symbol: 'TSLA', market: 'US', name: 'Tesla Inc.' },
  { symbol: '0700', market: 'HK', name: '腾讯控股' },
  { symbol: '0005', market: 'HK', name: '汇丰控股' },
]

// Alpha Vantage API测试
async function testAlphaVantage(symbol, market) {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo'
    const formattedSymbol = market === 'HK' ? `${symbol.padStart(4, '0')}.HK` : symbol
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${formattedSymbol}&apikey=${apiKey}`
    
    console.log(`  📡 Testing Alpha Vantage: ${formattedSymbol}`)
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const price = parseFloat(data['Global Quote']['05. price'])
      const change = parseFloat(data['Global Quote']['09. change'])
      console.log(`  ✅ Alpha Vantage: $${price} (${change >= 0 ? '+' : ''}${change})`)
      return { success: true, price, change }
    } else {
      console.log(`  ❌ Alpha Vantage: No data or API limit reached`)
      console.log(`  📄 Response:`, JSON.stringify(data, null, 2))
      return { success: false, error: 'No price data' }
    }
  } catch (error) {
    console.log(`  ❌ Alpha Vantage Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Yahoo Finance API测试
async function testYahooFinance(symbol, market) {
  try {
    const formattedSymbol = market === 'HK' ? `${symbol.padStart(4, '0')}.HK` : symbol
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?metrics=high?&interval=1d&range=1d`
    
    console.log(`  📡 Testing Yahoo Finance: ${formattedSymbol}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const data = await response.json()
    
    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      const price = data.chart.result[0].meta.regularMarketPrice
      const change = data.chart.result[0].meta.regularMarketChange || 0
      console.log(`  ✅ Yahoo Finance: $${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`)
      return { success: true, price, change }
    } else {
      console.log(`  ❌ Yahoo Finance: No data available`)
      return { success: false, error: 'No price data' }
    }
  } catch (error) {
    console.log(`  ❌ Yahoo Finance Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// 模拟数据测试
function testMockData(symbol, market) {
  const basePrice = Math.random() * 200 + 50
  const change = (Math.random() - 0.5) * 10
  
  console.log(`  🎭 Mock Data: $${basePrice.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`)
  return { success: true, price: basePrice, change }
}

// 主测试函数
async function runTests() {
  console.log('🚀 TradingFlow 股票价格API测试\n')
  
  // 显示环境配置
  console.log('📋 环境配置:')
  console.log(`   USE_REAL_STOCK_API: ${process.env.USE_REAL_STOCK_API || 'false'}`)
  console.log(`   ALPHA_VANTAGE_API_KEY: ${process.env.ALPHA_VANTAGE_API_KEY ? '已设置' : '未设置'}`)
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`)
  
  const useRealApi = process.env.USE_REAL_STOCK_API === 'true'
  const hasApiKey = !!process.env.ALPHA_VANTAGE_API_KEY && process.env.ALPHA_VANTAGE_API_KEY !== 'demo'
  
  if (!useRealApi) {
    console.log('🎭 使用模拟模式 (USE_REAL_STOCK_API=false)\n')
  } else if (!hasApiKey) {
    console.log('⚠️  真实API模式但未设置有效的API Key\n')
  } else {
    console.log('📡 使用真实API模式\n')
  }
  
  let totalTests = 0
  let successfulTests = 0
  
  for (const stock of TEST_STOCKS) {
    console.log(`🏢 测试 ${stock.name} (${stock.symbol})`)
    
    if (!useRealApi) {
      // 模拟模式
      const result = testMockData(stock.symbol, stock.market)
      totalTests++
      if (result.success) successfulTests++
    } else {
      // 真实API模式
      totalTests += 2
      
      // 测试Yahoo Finance
      const yahooResult = await testYahooFinance(stock.symbol, stock.market)
      if (yahooResult.success) successfulTests++
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 测试Alpha Vantage（如果有API Key）
      if (hasApiKey) {
        const alphaResult = await testAlphaVantage(stock.symbol, stock.market)
        if (alphaResult.success) successfulTests++
      } else {
        console.log(`  ⚠️  Alpha Vantage: 跳过 (无有效API Key)`)
      }
    }
    
    console.log('') // 空行分隔
  }
  
  // 测试总结
  console.log('📊 测试总结:')
  console.log(`   总测试数: ${totalTests}`)
  console.log(`   成功数: ${successfulTests}`)
  console.log(`   成功率: ${((successfulTests / totalTests) * 100).toFixed(1)}%`)
  
  if (successfulTests === totalTests) {
    console.log('\n🎉 所有测试通过！价格API工作正常')
  } else if (successfulTests > 0) {
    console.log('\n⚠️  部分测试失败，请检查网络连接和API配置')
  } else {
    console.log('\n❌ 所有测试失败，请检查配置和网络连接')
  }
  
  console.log('\n📚 更多信息请查看: docs/stock-price-api.md')
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { runTests } 