#!/bin/bash

echo "🚀 TradingFlow 项目快速启动脚本"
echo "=================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 创建项目
echo "📦 创建 Next.js 项目..."
npx create-next-app@latest tradingflow --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

cd tradingflow

# 安装依赖
echo "📦 安装项目依赖..."
npm install next-auth @auth/prisma-adapter prisma @prisma/client @vercel/postgres react-hook-form @hookform/resolvers zod @headlessui/react @heroicons/react date-fns

npm install -D @types/node

# 创建基础文件结构
echo "📁 创建项目结构..."
mkdir -p app/api/auth app/dashboard app/transactions app/positions app/settings
mkdir -p components/ui components/forms components/auth
mkdir -p lib types prisma

# 创建基础配置文件
echo "⚙️ 创建配置文件..."

# Prisma Schema
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  googleId  String   @unique @map("google_id")
  email     String   @unique
  username  String?
  avatarUrl String?  @map("avatar_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  transactions Transaction[]
  positions    Position[]

  @@map("users")
}

model Transaction {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  market          String
  stockCode       String   @map("stock_code")
  stockName       String   @map("stock_name")
  transactionType String   @map("transaction_type")
  quantity        Int
  price           Decimal  @db.Decimal(10, 4)
  currency        String
  transactionDate DateTime @map("transaction_date")
  commission      Decimal? @db.Decimal(10, 4)
  notes           String?
  createdAt       DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("transactions")
}

model Position {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  market      String
  stockCode   String   @map("stock_code")
  stockName   String   @map("stock_name")
  quantity    Int
  averageCost Decimal  @db.Decimal(10, 4) @map("average_cost")
  currency    String
  lastUpdated DateTime @updatedAt @map("last_updated")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, stockCode, market])
  @@map("positions")
}
EOF

# 环境变量模板
cat > .env.example << 'EOF'
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tradingflow"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
EOF

# 数据库客户端
cat > lib/db.ts << 'EOF'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
EOF

# 类型定义
cat > types/index.ts << 'EOF'
export interface Transaction {
  id: string
  market: 'US' | 'HK'
  stockCode: string
  stockName: string
  transactionType: 'BUY' | 'SELL'
  quantity: number
  price: number
  currency: 'USD' | 'HKD'
  transactionDate: Date
  commission?: number
  notes?: string
}

export interface Position {
  id: string
  market: 'US' | 'HK'
  stockCode: string
  stockName: string
  quantity: number
  averageCost: number
  currency: 'USD' | 'HKD'
  currentValue?: number
  profitLoss?: number
}
EOF

echo "✅ 项目结构创建完成！"
echo ""
echo "📋 下一步操作："
echo "1. cd tradingflow"
echo "2. 复制 .env.example 到 .env.local 并配置环境变量"
echo "3. 配置 Google OAuth (见 setup-guide.md)"
echo "4. npm run dev 启动开发服务器"
echo ""
echo "📖 详细教程请查看 setup-guide.md" 