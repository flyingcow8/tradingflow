# 股票价格API配置说明

## 概述

TradingFlow支持接入真实的股票价格数据，用于计算准确的市值和今日损益。系统支持两种模式：

1. **模拟模式**（默认）：使用随机生成的价格数据，适合开发和演示
2. **真实模式**：接入Alpha Vantage和Yahoo Finance API获取实时股价

## 环境变量配置

在项目根目录的`.env.local`文件中添加以下配置：

```bash
# 股票价格API配置
USE_REAL_STOCK_API=false        # 设为true启用真实API
ALPHA_VANTAGE_API_KEY=demo      # Alpha Vantage API密钥
```

## API提供商

### 1. Alpha Vantage（主要）
- **免费额度**：每分钟5次请求，每天500次
- **获取API Key**：https://www.alphavantage.co/support/#api-key
- **支持市场**：美股、港股
- **数据质量**：高，官方API

### 2. Yahoo Finance（备用）
- **免费额度**：无官方限制（非官方API）
- **无需API Key**
- **支持市场**：全球主要市场
- **数据质量**：中等，非官方API

## 使用方法

### 启用真实价格数据

1. 注册Alpha Vantage账号获取免费API Key
2. 在`.env.local`中设置：
   ```bash
   USE_REAL_STOCK_API=true
   ALPHA_VANTAGE_API_KEY=your_actual_api_key
   ```
3. 重启开发服务器
4. 在投资组合页面点击"刷新价格"按钮

### 使用模拟数据（开发）

1. 在`.env.local`中设置或不设置：
   ```bash
   USE_REAL_STOCK_API=false
   ```
2. 系统将自动使用模拟价格数据

## API端点

### GET /api/prices
获取股票价格

**查询参数：**
- `symbol` - 股票代码（可选）
- `market` - 市场（US/HK，可选）

**示例：**
```bash
# 获取所有持仓的价格
GET /api/prices

# 获取特定股票价格
GET /api/prices?symbol=AAPL&market=US
```

### POST /api/prices/update
更新持仓价格

**请求体：**
```json
{
  "updateAll": true,           // 更新所有持仓
  "symbols": ["AAPL", "TSLA"]  // 或指定股票代码
}
```

## 股票代码格式

### 美股
- 直接使用交易所代码：`AAPL`、`TSLA`、`MSFT`

### 港股
- 使用4位数字代码：`0700`（腾讯）、`0005`（汇丰）
- 系统自动添加`.HK`后缀发送给API

## 今日损益计算

启用实时价格后，今日损益计算逻辑：

1. **有实时价格**：基于价格变动计算简化损益
2. **无实时价格**：基于交易手续费计算

公式：
```
今日损益 ≈ Σ(估算日内变动 × 持仓数量)
估算日内变动 = (当前价格 - 平均成本) × 5%
```

> 注意：准确的今日损益需要昨日收盘价数据，当前为简化算法

## 错误处理

系统内置多重容错机制：

1. **API失败**：自动切换到备用数据源
2. **网络问题**：保持现有价格数据
3. **限制超出**：显示友好错误信息
4. **无效代码**：跳过更新，记录警告

## 性能优化

- **缓存机制**：价格数据缓存1分钟
- **批量请求**：减少API调用次数
- **请求限制**：添加延迟避免超出限制
- **错误重试**：自动重试失败的请求

## 监控和调试

在浏览器控制台查看价格更新日志：

```javascript
// 成功更新
价格更新结果: {updatedCount: 3, quotes: [...]}

// API错误
Error fetching quote for AAPL: API error message
```

## 注意事项

1. **API限制**：免费版有请求频率限制，请合理使用
2. **数据延迟**：价格数据可能有15-20分钟延迟
3. **市场时间**：非交易时间价格不会更新
4. **汇率**：港股价格自动按配置汇率转换为美元

## 故障排除

### 价格不更新
1. 检查`USE_REAL_STOCK_API`设置
2. 验证API Key是否正确
3. 检查网络连接
4. 查看控制台错误信息

### API限制超出
1. 减少更新频率
2. 考虑升级到付费计划
3. 临时切换到模拟模式

### 股票代码无效
1. 确认股票代码格式正确
2. 检查市场选择（US/HK）
3. 验证股票是否在该市场交易 