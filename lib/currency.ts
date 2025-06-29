// 汇率转换工具库

// 当前汇率 (可以后续改为从API获取实时汇率)
const EXCHANGE_RATES = {
  USD_TO_HKD: 7.8, // 1 USD = 7.8 HKD
  HKD_TO_USD: 0.128, // 1 HKD = 0.128 USD
}

/**
 * 将任意货币金额转换为美元
 */
export function convertToUSD(amount: number, currency: string): number {
  if (currency === 'USD') {
    return amount
  }
  
  if (currency === 'HKD') {
    return amount * EXCHANGE_RATES.HKD_TO_USD
  }
  
  // 默认返回原金额（如果遇到未知货币）
  console.warn(`Unknown currency: ${currency}, returning original amount`)
  return amount
}

/**
 * 将美元转换为指定货币
 */
export function convertFromUSD(amountInUSD: number, targetCurrency: string): number {
  if (targetCurrency === 'USD') {
    return amountInUSD
  }
  
  if (targetCurrency === 'HKD') {
    return amountInUSD * EXCHANGE_RATES.USD_TO_HKD
  }
  
  // 默认返回原金额（如果遇到未知货币）
  console.warn(`Unknown currency: ${targetCurrency}, returning original amount`)
  return amountInUSD
}

/**
 * 获取当前汇率
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) {
    return 1
  }
  
  if (fromCurrency === 'USD' && toCurrency === 'HKD') {
    return EXCHANGE_RATES.USD_TO_HKD
  }
  
  if (fromCurrency === 'HKD' && toCurrency === 'USD') {
    return EXCHANGE_RATES.HKD_TO_USD
  }
  
  return 1
}

/**
 * 格式化货币显示 (统一显示为美元)
 */
export function formatCurrencyInUSD(amount: number, originalCurrency?: string): string {
  const amountInUSD = originalCurrency ? convertToUSD(amount, originalCurrency) : amount
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInUSD)
}

/**
 * 格式化货币显示 (保持原货币)
 */
export function formatCurrencyOriginal(amount: number, currency: string): string {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'HKD': 'HK$',
  }
  
  const symbol = currencySymbols[currency] || currency
  
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
} 