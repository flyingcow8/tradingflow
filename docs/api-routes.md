# API 路由文档

本文档描述了 TradingFlow 应用的所有 API 端点。

## 🔐 认证

所有业务 API 都需要用户认证（除了测试端点）。使用 NextAuth.js 进行身份验证。

### 认证端点

- `GET/POST /api/auth/[...nextauth]` - NextAuth.js 认证处理器
- `GET /api/auth/signin` - 登录页面
- `GET /api/auth/signout` - 登出
- `GET /api/auth/session` - 获取当前会话

## 📊 交易记录 API

### GET /api/transactions
获取交易记录列表（支持分页和过滤）

**查询参数:**
- `page` - 页码（默认: 1）
- `pageSize` - 每页数量（默认: 10）
- `market` - 市场过滤（US/HK）
- `stockCode` - 股票代码过滤
- `transactionType` - 交易类型过滤（BUY/SELL）

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "market": "US",
      "stockCode": "AAPL",
      "stockName": "Apple Inc.",
      "transactionType": "BUY",
      "quantity": 100,
      "price": "150.25",
      "currency": "USD",
      "transactionDate": "2024-01-15T00:00:00.000Z",
      "commission": "2.99",
      "notes": "长期投资",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### POST /api/transactions
创建新的交易记录

**请求体:**
```json
{
  "market": "US",
  "stockCode": "AAPL",
  "stockName": "Apple Inc.",
  "transactionType": "BUY",
  "quantity": 100,
  "price": 150.25,
  "currency": "USD",
  "transactionDate": "2024-01-15T00:00:00.000Z",
  "commission": 2.99,
  "notes": "长期投资"
}
```

### GET /api/transactions/[id]
获取单个交易记录

### PUT /api/transactions/[id]
更新交易记录

### DELETE /api/transactions/[id]
删除交易记录

## 💼 持仓管理 API

### GET /api/positions
获取持仓列表（支持分页和过滤）

**查询参数:**
- `page` - 页码（默认: 1）
- `pageSize` - 每页数量（默认: 10）
- `market` - 市场过滤（US/HK）
- `stockCode` - 股票代码过滤

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "market": "US",
      "stockCode": "AAPL",
      "stockName": "Apple Inc.",
      "quantity": 70,
      "averageCost": "150.25",
      "currency": "USD",
      "lastPrice": "168.50",
      "currentValue": 11795,
      "profitLoss": 1277.5,
      "profitLossPercentage": 12.15,
      "lastUpdated": "2024-02-10T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### POST /api/positions/update-prices
批量更新股票价格

**请求体:**
```json
{
  "stockUpdates": [
    {
      "stockCode": "AAPL",
      "market": "US",
      "price": 168.50
    },
    {
      "stockCode": "0700",
      "market": "HK",
      "price": 315.00
    }
  ]
}
```

## 📈 统计数据 API

### GET /api/stats
获取统计数据

**查询参数:**
- `type` - 统计类型（portfolio/trading/all，默认: all）

**响应示例:**
```json
{
  "success": true,
  "data": {
    "portfolio": {
      "totalValue": 50000.00,
      "totalCost": 45000.00,
      "totalProfitLoss": 5000.00,
      "totalProfitLossPercentage": 11.11,
      "positionCount": 5,
      "marketDistribution": {
        "US": {
          "value": 35000.00,
          "percentage": 70.0,
          "count": 3
        },
        "HK": {
          "value": 15000.00,
          "percentage": 30.0,
          "count": 2
        }
      }
    },
    "trading": {
      "totalTransactions": 25,
      "totalBuyTransactions": 20,
      "totalSellTransactions": 5,
      "totalCommission": 74.75,
      "averageTransactionSize": 2000.00,
      "mostTradedStock": {
        "stockCode": "AAPL",
        "stockName": "Apple Inc.",
        "transactionCount": 8
      }
    }
  }
}
```

## 🧪 测试 API

### GET /api/test
系统状态测试端点

**响应示例:**
```json
{
  "success": true,
  "message": "系统运行正常",
  "data": {
    "authenticated": true,
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "database": {
      "connected": true,
      "userCount": 10
    },
    "timestamp": "2024-02-10T15:30:00.000Z"
  }
}
```

## 🚨 错误处理

所有 API 端点都使用统一的错误响应格式：

```json
{
  "success": false,
  "error": "错误消息",
  "details": "详细错误信息（开发环境）"
}
```

### 常见 HTTP 状态码

- `200` - 成功
- `400` - 请求参数错误
- `401` - 未授权访问
- `404` - 资源不存在
- `500` - 服务器内部错误

## 🔧 使用示例

### JavaScript/TypeScript 客户端

```typescript
// 获取交易记录
const response = await fetch('/api/transactions?page=1&pageSize=10')
const data = await response.json()

// 创建交易记录
const newTransaction = {
  market: 'US',
  stockCode: 'AAPL',
  stockName: 'Apple Inc.',
  transactionType: 'BUY',
  quantity: 100,
  price: 150.25,
  currency: 'USD',
  transactionDate: new Date(),
  commission: 2.99
}

const response = await fetch('/api/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newTransaction)
})

const result = await response.json()
```

## 📝 注意事项

1. **认证要求**: 除了测试端点，所有 API 都需要用户登录
2. **数据验证**: 所有输入数据都会进行服务器端验证
3. **自动持仓计算**: 创建、更新、删除交易记录时会自动重新计算持仓
4. **时区处理**: 所有日期时间都使用 UTC 时间
5. **精度处理**: 价格字段支持 4 位小数精度
6. **分页限制**: 每页最大返回 100 条记录 