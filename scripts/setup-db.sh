#!/bin/bash

echo "🗄️ 数据库设置脚本"
echo "=================="

# 检查是否存在 .env.local 文件
if [ ! -f .env.local ]; then
    echo "❌ 请先创建 .env.local 文件并配置数据库连接"
    echo "可以复制 .env.example 作为模板："
    echo "cp .env.example .env.local"
    echo ""
    echo "然后配置以下环境变量："
    echo "- DATABASE_URL: PostgreSQL 数据库连接字符串"
    echo "- NEXTAUTH_SECRET: NextAuth.js 密钥"
    echo "- GOOGLE_CLIENT_ID: Google OAuth 客户端 ID"
    echo "- GOOGLE_CLIENT_SECRET: Google OAuth 客户端密钥"
    exit 1
fi

echo "✅ 找到 .env.local 文件"

# 生成 Prisma 客户端
echo "📦 生成 Prisma 客户端..."
npx prisma generate

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
npx prisma db push

echo ""
echo "✅ 数据库设置完成！"
echo ""
echo "📋 下一步："
echo "1. 确保 Google OAuth 已正确配置"
echo "2. 运行 npm run dev 启动开发服务器"
echo "3. 访问 http://localhost:3000 测试应用"
echo ""
echo "🔧 有用的命令："
echo "- npx prisma studio: 打开数据库管理界面"
echo "- npx prisma db seed: 运行种子数据脚本（如果存在）"
echo "- npx prisma migrate dev: 创建新的数据库迁移" 