# 数据库设置指南

这个文档将指导您如何设置 TradingFlow 项目的数据库。

## 📋 前置条件

1. **PostgreSQL 数据库**
   - 本地 PostgreSQL 实例，或
   - 云数据库服务（推荐：Supabase、Railway、Vercel Postgres）

2. **Node.js 环境**
   - Node.js 18+ 已安装
   - npm 或 yarn 包管理器

## 🗄️ 数据库结构

### 用户表 (users)
- 集成 NextAuth.js 的标准用户模型
- 支持 Google OAuth 登录
- 存储用户基本信息

### 交易记录表 (transactions)
- 记录美股 (US) 和港股 (HK) 交易
- 支持买入 (BUY) 和卖出 (SELL) 操作
- 包含股票代码、价格、数量、手续费等信息
- 支持 USD 和 HKD 双币种

### 持仓表 (positions)
- 计算和存储当前持仓状态
- 按用户和股票代码聚合
- 记录平均成本和最新价格

## 🚀 快速设置

### 1. 环境变量配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件，配置以下变量：
# DATABASE_URL="postgresql://..."
# NEXTAUTH_SECRET="your-secret"
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. 自动设置（推荐）
```bash
# 运行自动设置脚本
npm run db:setup
```

### 3. 手动设置
```bash
# 1. 生成 Prisma 客户端
npm run db:generate

# 2. 推送数据库结构
npm run db:push

# 3. 添加测试数据（可选）
npm run db:seed
```

## 🛠️ 常用命令

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送 schema 到数据库
npm run db:push

# 添加种子数据
npm run db:seed

# 打开数据库管理界面
npm run db:studio

# 完整设置流程
npm run db:setup
```

## 🗂️ 数据库提供商设置

### Supabase（推荐）
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 在设置中找到数据库连接字符串
4. 将连接字符串添加到 `.env.local`

### Railway
1. 访问 [railway.app](https://railway.app)
2. 创建 PostgreSQL 服务
3. 复制连接字符串
4. 将连接字符串添加到 `.env.local`

### 本地 PostgreSQL
```bash
# 安装 PostgreSQL（macOS）
brew install postgresql
brew services start postgresql

# 创建数据库
createdb tradingflow

# 连接字符串示例
DATABASE_URL="postgresql://username:password@localhost:5432/tradingflow"
```

## 📊 数据模型详细说明

### 交易记录 (Transaction)
```typescript
{
  id: string              // 唯一标识
  userId: string          // 用户ID
  market: 'US' | 'HK'     // 市场
  stockCode: string       // 股票代码
  stockName: string       // 股票名称
  transactionType: 'BUY' | 'SELL'  // 交易类型
  quantity: number        // 数量
  price: number          // 价格
  currency: 'USD' | 'HKD' // 货币
  transactionDate: Date   // 交易日期
  commission?: number     // 手续费
  notes?: string         // 备注
}
```

### 持仓 (Position)
```typescript
{
  id: string              // 唯一标识
  userId: string          // 用户ID
  market: 'US' | 'HK'     // 市场
  stockCode: string       // 股票代码
  stockName: string       // 股票名称
  quantity: number        // 持仓数量
  averageCost: number     // 平均成本
  currency: 'USD' | 'HKD' // 货币
  lastPrice?: number      // 最新价格
}
```

## 🔧 故障排除

### 常见问题

1. **连接数据库失败**
   - 检查 `DATABASE_URL` 是否正确
   - 确保数据库服务正在运行
   - 验证网络连接

2. **Prisma 生成失败**
   - 运行 `npm run db:generate`
   - 检查 `schema.prisma` 语法

3. **迁移失败**
   - 检查数据库权限
   - 确保目标数据库为空或兼容

### 重置数据库
```bash
# 警告：这会删除所有数据
npx prisma db push --force-reset
npm run db:seed
```

## 📝 下一步

1. [设置 Google OAuth](./google-oauth-setup.md)
2. [API 路由开发](./api-development.md)
3. [前端集成](./frontend-integration.md)

## 🤝 技术支持

如果遇到问题，请检查：
1. [Prisma 官方文档](https://www.prisma.io/docs/)
2. [NextAuth.js 文档](https://next-auth.js.org/)
3. 项目 GitHub Issues 