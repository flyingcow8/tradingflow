"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Language = "zh" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  zh: {
    // Navigation
    dashboard: "仪表板",
    tradingRecords: "交易记录",
    portfolio: "投资组合",

    // Common
    welcome: "欢迎回来",
    loading: "加载中...",
    save: "保存",
    cancel: "取消",
    edit: "编辑",
    delete: "删除",
    confirm: "确认",
    record: "记录",
    filter: "筛选",
    clear: "清除",

    // Dashboard
    dashboardTitle: "仪表板",
    dashboardSubtitle: "欢迎回来，查看您的投资概况",
    totalAssets: "总资产",
    todayPL: "今日损益",
    totalReturn: "总收益",
    positions: "持仓数量",
    marketOverview: "市场概览",
    latestNews: "最新动态",
    chartArea: "图表区域",
    newsList: "动态列表",

    // Trading Records
    tradingRecordsTitle: "交易记录",
    tradingRecordsSubtitle: "查看和管理您的所有交易记录",
    totalTrades: "总交易次数",
    totalAmount: "总交易金额",
    totalPL: "总盈亏",
    tradingRecordsList: "交易记录列表",
    newRecord: "新建交易记录",
    editRecord: "编辑交易记录",
    deleteConfirm: "确认删除",
    deleteMessage: "此操作无法撤销。确定要删除这条交易记录吗？",

    // Portfolio
    portfolioTitle: "投资组合",
    portfolioSubtitle: "查看您的持仓分布和资产配置",
    totalMarketValue: "总市值",
    totalCost: "总成本",
    unrealizedPL: "未实现盈亏",
    totalReturnRate: "总收益率",
    assetAllocation: "资产配置",
    positionRatio: "仓位占比",
    holdingsDetail: "持仓明细",

    // Table Headers
    dateTime: "日期时间",
    symbol: "股票代码",
    name: "股票名称",
    exchange: "交易所",
    type: "交易类型",
    quantity: "数量",
    price: "价格",
    amount: "金额",
    fee: "手续费",
    profit: "盈亏",
    actions: "操作",
    shares: "持仓数量",
    avgPrice: "平均成本",
    currentPrice: "当前价格",
    marketValue: "市值",
    costBasis: "成本基础",
    returnRate: "收益率",
    allocation: "仓位占比",

    // Form Fields
    tradingDate: "交易日期",
    tradingTime: "交易时间",
    stockSymbol: "股票代码",
    stockName: "股票名称",
    tradingType: "交易类型",
    buy: "买入",
    sell: "卖出",
    cash: "现金",
    optional: "可选",

    // Time Filter
    timeFilter: "时间筛选",
    startDate: "开始日期",
    endDate: "结束日期",
    clearFilter: "清除筛选",
    showingRecords: "显示",
    ofRecords: "条记录",

    // User Menu
    profile: "个人资料",
    settings: "账户设置",
    logout: "退出登录",
    language: "语言",
    chinese: "中文",
    english: "English",

    // Login
    loginTitle: "欢迎使用 TradingFlow",
    loginSubtitle: "请使用您的Google账户登录",
    loginWithGoogle: "使用 Google 账户登录",
    loggingIn: "登录中...",
    termsAndPrivacy: "登录即表示您同意我们的",
    terms: "服务条款",
    and: "和",
    privacy: "隐私政策",

    // Exchanges
    selectExchange: "选择交易所",

    // Messages
    fillDetails: "填写交易详情信息，创建新的交易记录。",
    modifyDetails: "修改交易详情信息。",
    saveRecord: "保存记录",
    saveChanges: "保存修改",
    confirmDelete: "确认删除",
    
    // Portfolio specific
    newPosition: "新增持仓",
    refreshPrices: "刷新价格",
    updating: "更新中...",
    stockHoldings: "股票持仓",
    cashHoldings: "现金持仓",
    stockPosition: "股票持仓",
    cashPosition: "现金持仓",
    unifiedUsdDisplay: "所有金额已统一转换为美元显示",
    realTimeData: "价格数据自动更新",
    realTimePrices: "实时价格",
    lastUpdated: "最后更新",
    withRealTimeData: "含实时价格数据",
    manageHoldings: "管理您的投资持仓和资产配置",
    market: "市场",
    cost: "成本",
    currency: "货币",
    cashBalance: "现金余额",
    noHoldings: "暂无持仓数据",
    noRecordsFound: "未找到交易记录",
    totalCommission: "总手续费",
    
    // Trading specific
    newTrade: "新增交易",
    priceNote: "如果不填写，将使用平均成本作为当前价格",
    
    // Dialog specific
    addPositionManually: "手动添加持仓",
    fillStockOrCashInfo: "填写股票或现金信息以添加新的持仓记录",
    positionType: "持仓类型",
    averageCost: "平均成本",
    currentPriceOptional: "当前价格 (可选)",
    cashAmount: "现金金额",
    addPosition: "添加持仓",
    enterCashBalance: "输入您的",
    usd: "美元",
    hkd: "港币",
    cashBalance2: "现金余额",
    
    // Exchanges
    nasdaq: "纳斯达克交易所 (NASDAQ)",
    nyse: "纽约证券交易所 (NYSE)",
    hkex: "香港联合交易所 (HKEX)",
    usStock: "美股",
    hkStock: "港股",
    nasdaqExchange: "纳斯达克交易所",
    nyseExchange: "纽约证券交易所",
    hkexExchange: "香港联合交易所",
    
    // Cash positions
    usdCash: "美元现金",
    hkdCash: "港币现金",
    
    // Settings page
    settingsTitle: "设置",
    settingsSubtitle: "管理您的账户设置和数据",
    loginRequired: "需要登录",
    loginRequiredMessage: "请先登录以访问设置页面",
    userInfo: "用户信息",
    loginMethod: "登录方式",
    accountStatus: "账户状态",
    active: "活跃",
    dataManagement: "数据管理",
    resetDatabase: "重置交易数据库",
    resetDatabaseDescription: "此操作将删除您的所有交易记录和持仓数据，包括股票持仓和现金持仓。",
    resetting: "重置中...",
    resetDatabaseButton: "重置数据库",
    confirmResetDatabase: "确认重置数据库",
    resetDatabaseWarning: "此操作将永久删除以下数据：",
    allTradingRecords: "• 所有交易记录",
    allPositions: "• 所有持仓信息（包括股票和现金）",
    relatedStats: "• 相关的统计数据",
    irreversibleAction: "此操作无法撤销，请谨慎操作！",
    confirmReset: "确认重置",
    resetSuccess: "重置成功",
    resetSuccessMessage: "所有交易数据已清空，页面将在3秒后刷新",
    otherSettings: "其他设置",
    moreSettingsComingSoon: "更多设置选项正在开发中...",
    
    // Error messages
    loginFailed: "登录失败:",
    resetDataFailed: "重置数据失败",
    resetDataFailedRetry: "重置数据失败，请重试",
    addRecordFailed: "添加交易记录失败，请检查输入数据并重试。",
    refreshPricesFailed: "刷新价格失败",
    
    // Common UI text
    userAvatar: "用户头像",
    user: "用户",
    noHoldingsData: "暂无持仓数据",
    noHoldingsDescription: "您还没有任何持仓记录，点击下方按钮开始添加",
    
    // Price indicator
    costPrice: "成本价",
    realTime: "实时",
    
    // Market mappings
    hkExchangeFull: "香港联合交易所",
    
    // Cash types
    usdCashFull: "美元现金",
    hkdCashFull: "港币现金",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    tradingRecords: "Trading Records",
    portfolio: "Portfolio",

    // Common
    welcome: "Welcome back",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    record: "Record",
    filter: "Filter",
    clear: "Clear",

    // Dashboard
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Welcome back, view your investment overview",
    totalAssets: "Total Assets",
    todayPL: "Today's P&L",
    totalReturn: "Total Return",
    positions: "Positions",
    marketOverview: "Market Overview",
    latestNews: "Latest News",
    chartArea: "Chart Area",
    newsList: "News List",

    // Trading Records
    tradingRecordsTitle: "Trading Records",
    tradingRecordsSubtitle: "View and manage all your trading records",
    totalTrades: "Total Trades",
    totalAmount: "Total Amount",
    totalPL: "Total P&L",
    tradingRecordsList: "Trading Records List",
    newRecord: "New Trading Record",
    editRecord: "Edit Trading Record",
    deleteConfirm: "Confirm Delete",
    deleteMessage: "This action cannot be undone. Are you sure you want to delete this trading record?",

    // Portfolio
    portfolioTitle: "Portfolio",
    portfolioSubtitle: "View your holdings distribution and asset allocation",
    totalMarketValue: "Total Market Value",
    totalCost: "Total Cost",
    unrealizedPL: "Unrealized P&L",
    totalReturnRate: "Total Return Rate",
    assetAllocation: "Asset Allocation",
    positionRatio: "Position Ratio",
    holdingsDetail: "Holdings Detail",

    // Table Headers
    dateTime: "Date/Time",
    symbol: "Symbol",
    name: "Name",
    exchange: "Exchange",
    type: "Type",
    quantity: "Quantity",
    price: "Price",
    amount: "Amount",
    fee: "Fee",
    profit: "P&L",
    actions: "Actions",
    shares: "Shares",
    avgPrice: "Avg Price",
    currentPrice: "Current Price",
    marketValue: "Market Value",
    costBasis: "Cost Basis",
    returnRate: "Return Rate",
    allocation: "Allocation",

    // Form Fields
    tradingDate: "Trading Date",
    tradingTime: "Trading Time",
    stockSymbol: "Stock Symbol",
    stockName: "Stock Name",
    tradingType: "Trading Type",
    buy: "Buy",
    sell: "Sell",
    cash: "Cash",
    optional: "Optional",

    // Time Filter
    timeFilter: "Time Filter",
    startDate: "Start Date",
    endDate: "End Date",
    clearFilter: "Clear Filter",
    showingRecords: "Showing",
    ofRecords: "records",

    // User Menu
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    language: "Language",
    chinese: "中文",
    english: "English",

    // Login
    loginTitle: "Welcome to TradingFlow",
    loginSubtitle: "Please sign in with your Google account",
    loginWithGoogle: "Sign in with Google",
    loggingIn: "Signing in...",
    termsAndPrivacy: "By signing in, you agree to our",
    terms: "Terms of Service",
    and: "and",
    privacy: "Privacy Policy",

    // Exchanges
    selectExchange: "Select Exchange",

    // Messages
    fillDetails: "Fill in the trading details to create a new trading record.",
    modifyDetails: "Modify the trading details.",
    saveRecord: "Save Record",
    saveChanges: "Save Changes",
    confirmDelete: "Confirm Delete",
    
    // Portfolio specific
    newPosition: "New Position",
    refreshPrices: "Refresh Prices",
    updating: "Updating...",
    stockHoldings: "Stock Holdings",
    cashHoldings: "Cash Holdings",
    stockPosition: "Stock Position",
    cashPosition: "Cash Position",
    unifiedUsdDisplay: "All amounts are converted to USD for unified display",
    realTimeData: "Real-time price data updates automatically",
    realTimePrices: "Real-time prices",
    lastUpdated: "Last updated",
    withRealTimeData: "Includes real-time price data",
    manageHoldings: "Manage your investment holdings and asset allocation",
    market: "Market",
    cost: "Cost",
    currency: "Currency",
    cashBalance: "Cash Balance",
    noHoldings: "No holdings data",
    noRecordsFound: "No trading records found",
    totalCommission: "Total Commission",
    
    // Trading specific
    newTrade: "New Trade",
    priceNote: "If not filled, average cost will be used as current price",
    
    // Dialog specific
    addPositionManually: "Add Position Manually",
    fillStockOrCashInfo: "Fill in stock or cash information to add a new position record",
    positionType: "Position Type",
    averageCost: "Average Cost",
    currentPriceOptional: "Current Price (Optional)",
    cashAmount: "Cash Amount",
    addPosition: "Add Position",
    enterCashBalance: "Enter your",
    usd: "USD",
    hkd: "HKD",
    cashBalance2: "cash balance",
    
    // Exchanges
    nasdaq: "NASDAQ Exchange (NASDAQ)",
    nyse: "New York Stock Exchange (NYSE)",
    hkex: "Hong Kong Exchange (HKEX)",
    usStock: "US Stock",
    hkStock: "HK Stock",
    nasdaqExchange: "NASDAQ Exchange",
    nyseExchange: "NYSE Exchange",
    hkexExchange: "HKEX Exchange",
    
    // Cash positions
    usdCash: "USD Cash",
    hkdCash: "HKD Cash",
    
    // Settings page
    settingsTitle: "Settings",
    settingsSubtitle: "Manage your account settings and data",
    loginRequired: "Login Required",
    loginRequiredMessage: "Please login to access the settings page",
    userInfo: "User Information",
    loginMethod: "Login Method",
    accountStatus: "Account Status",
    active: "Active",
    dataManagement: "Data Management",
    resetDatabase: "Reset Trading Database",
    resetDatabaseDescription: "This operation will delete all your trading records and position data, including stock positions and cash positions.",
    resetting: "Resetting...",
    resetDatabaseButton: "Reset Database",
    confirmResetDatabase: "Confirm Reset Database",
    resetDatabaseWarning: "This operation will permanently delete the following data:",
    allTradingRecords: "• All trading records",
    allPositions: "• All position information (including stocks and cash)",
    relatedStats: "• Related statistical data",
    irreversibleAction: "This operation cannot be undone, please proceed with caution!",
    confirmReset: "Confirm Reset",
    resetSuccess: "Reset Successful",
    resetSuccessMessage: "All trading data has been cleared, page will refresh in 3 seconds",
    otherSettings: "Other Settings",
    moreSettingsComingSoon: "More settings options are under development...",
    
    // Error messages
    loginFailed: "Login failed:",
    resetDataFailed: "Reset data failed",
    resetDataFailedRetry: "Reset data failed, please try again",
    addRecordFailed: "Failed to add trading record, please check input data and retry.",
    refreshPricesFailed: "Failed to refresh prices",
    
    // Common UI text
    userAvatar: "User avatar",
    user: "User",
    noHoldingsData: "No holdings data",
    noHoldingsDescription: "You don't have any holdings yet, click the button below to start adding",
    
    // Price indicator
    costPrice: "Cost Price",
    realTime: "Live",
    
    // Market mappings
    hkExchangeFull: "Hong Kong Exchange",
    
    // Cash types
    usdCashFull: "USD Cash",
    hkdCashFull: "HKD Cash",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "zh" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
