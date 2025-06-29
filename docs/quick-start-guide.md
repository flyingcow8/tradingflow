# TradingFlow 快速启动指南

本指南将帮助您快速配置和启动 TradingFlow 应用。

## 🚀 快速启动（推荐路径）

### 1. 📦 确认依赖已安装
```bash
# 检查项目依赖
npm install

# 确认关键依赖已安装
npm list prisma @prisma/client next-auth
```

### 2. 🗄️ 配置数据库

#### 选项A：使用 Supabase（推荐）
1. 访问 [supabase.com](https://supabase.com) 并创建账户
2. 创建新项目
3. 在 Settings → Database 中找到连接字符串
4. 复制类似这样的URL：`postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres`

#### 选项B：使用 Railway
1. 访问 [railway.app](https://railway.app)
2. 创建 PostgreSQL 数据库
3. 复制数据库连接字符串

#### 选项C：本地 PostgreSQL
```bash
# macOS 安装
brew install postgresql
brew services start postgresql

# 创建数据库
createdb tradingflow

# 连接字符串
DATABASE_URL="postgresql://username:password@localhost:5432/tradingflow"
```

### 3. ⚙️ 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件
nano .env.local
```

**必须配置的变量：**
```env
# 数据库连接（替换为您的实际连接字符串）
DATABASE_URL="postgresql://..."

# NextAuth 密钥（随机生成）
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters"

# Google OAuth（可暂时使用占位符，但无法登录）
GOOGLE_CLIENT_ID="placeholder"
GOOGLE_CLIENT_SECRET="placeholder"
```

### 4. 🏗️ 初始化数据库
```bash
# 一键设置数据库
npm run db:setup

# 或者手动执行
npm run db:generate
npm run db:push
npm run db:seed  # 可选：添加测试数据
```

### 5. ▶️ 启动应用
```bash
npm run dev
```

访问 http://localhost:3000

## 🔧 Google OAuth 配置（可选但推荐）

### 1. 创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API

### 2. 配置 OAuth 2.0
1. 导航到 "APIs & Services" → "Credentials"
2. 点击 "Create Credentials" → "OAuth 2.0 Client IDs"
3. 选择 "Web application"
4. 设置授权重定向 URI：
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google` (生产环境)

### 3. 更新环境变量
```env
GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
```

## 🧪 验证安装

### 1. 测试数据库连接
访问：http://localhost:3000/api/test

应该看到类似这样的响应：
```json
{
  "success": true,
  "message": "系统运行正常",
  "data": {
    "authenticated": false,
    "database": {
      "connected": true,
      "userCount": 1
    }
  }
}
```

### 2. 测试 API 端点
```bash
# 获取交易记录（需要登录）
curl http://localhost:3000/api/transactions

# 获取统计数据（需要登录）
curl http://localhost:3000/api/stats
```

### 3. 查看数据库内容
```bash
# 打开 Prisma Studio
npm run db:studio
```

## 📊 使用应用

### 1. 登录系统
- 如果配置了 Google OAuth：点击 Google 登录
- 如果没有配置：暂时无法登录，需要先配置 OAuth

### 2. 添加交易记录
- 导航到 "交易记录" 页面
- 点击 "新增交易" 按钮
- 填写交易信息并保存

### 3. 查看持仓
- 导航到 "投资组合" 页面
- 查看自动计算的持仓和盈亏

### 4. 查看统计
- 导航到 "Dashboard" 页面
- 查看投资组合概览和统计数据

## 🛠️ 开发工具

### 有用的命令
```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 数据库
npm run db:generate      # 生成 Prisma 客户端
npm run db:push          # 推送 schema 到数据库
npm run db:seed          # 添加种子数据
npm run db:studio        # 打开数据库管理界面

# 完整设置
npm run db:setup         # 自动执行数据库设置流程
```

### 数据库管理
- **Prisma Studio**: `npm run db:studio` - 可视化数据库管理
- **重置数据库**: `npx prisma db push --force-reset`
- **查看 schema**: 编辑 `prisma/schema.prisma`

## 🚨 常见问题

### 1. 数据库连接失败
- 检查 `DATABASE_URL` 是否正确
- 确保数据库服务正在运行
- 检查网络连接

### 2. 登录失败
- 检查 Google OAuth 配置
- 确保回调 URL 正确设置
- 检查 `NEXTAUTH_SECRET` 是否设置

### 3. API 请求失败
- 检查是否已登录
- 查看浏览器开发者工具的网络面板
- 检查服务器日志

### 4. Prisma 错误
- 运行 `npm run db:generate` 重新生成客户端
- 检查 `schema.prisma` 语法
- 确保数据库连接正常

## 📚 参考文档

- [数据库设置指南](./database-setup.md)
- [API 路由文档](./api-routes.md)
- [PRD 产品需求文档](../PRD.md)
- [Prisma 文档](https://www.prisma.io/docs/)
- [NextAuth.js 文档](https://next-auth.js.org/)
- [Next.js 文档](https://nextjs.org/docs)

## 🤝 获取帮助

如果遇到问题：
1. 检查本文档的常见问题部分
2. 查看项目的 GitHub Issues
3. 参考相关技术栈的官方文档

---

**🎉 恭喜！您现在已经成功配置了 TradingFlow 应用的数据库和 API 系统。** 