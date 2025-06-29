#!/bin/bash

echo "🚀 TradingFlow 部署脚本"
echo "====================="

# 检查Git状态
echo "📋 检查Git状态..."
git status

# 添加所有文件
echo "📦 添加文件到Git..."
git add .

# 提交更改
echo "�� 提交更改..."
git commit -m "feat: prepare for deployment - add env config, deployment docs and README"

# 推送到远程仓库
echo "🔄 推送到GitHub..."
git push origin main

echo "✅ 代码已推送到GitHub!"
echo ""
echo "📋 接下来的步骤:"
echo "1. 创建Supabase项目: https://supabase.com"
echo "2. 获取数据库连接字符串"
echo "3. 设置Google OAuth: https://console.cloud.google.com"
echo "4. 部署到Vercel: https://vercel.com"
echo ""
echo "详细步骤请查看: docs/deployment.md"
