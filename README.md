# TradingFlow

一个现代化的股票交易记录管理应用，支持美股和港股市场。

## 特性

- 📊 **投资组合管理** - 实时跟踪您的股票持仓和现金余额
- 📈 **交易记录** - 记录和管理所有买卖交易
- 💰 **多货币支持** - 支持美元(USD)和港币(HKD)
- 🔄 **实时价格** - 自动更新股票价格数据
- 🌍 **多语言** - 支持中文和英文界面
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🔐 **安全认证** - Google OAuth 登录

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **数据库**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **认证**: NextAuth.js
- **UI组件**: shadcn/ui
- **图表**: Recharts
- **部署**: Vercel + Supabase

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/tradingflow.git
cd tradingflow
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量示例文件：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入以下配置：

```env
# 数据库连接 (从Supabase获取)
DATABASE_URL="postgresql://..."

# NextAuth配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth (从Google Console获取)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 股票价格API (可选)
ALPHA_VANTAGE_API_KEY="your-api-key"
```

### 4. 设置数据库

```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库架构
npx prisma db push
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署指南

### Vercel + Supabase 部署

1. **设置Supabase数据库**
   - 访问 [supabase.com](https://supabase.com) 创建项目
   - 获取数据库连接字符串

2. **部署到Vercel**
   - 连接GitHub仓库到Vercel
   - 配置环境变量
   - 自动部署

详细部署步骤请参考 [部署文档](docs/deployment.md)

## 项目结构

```
tradingflow/
├── app/                 # Next.js App Router
├── components/          # React组件
├── lib/                 # 工具库和配置
├── prisma/             # 数据库架构
├── types/              # TypeScript类型定义
├── docs/               # 文档
└── public/             # 静态资源
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License