# TradingFlow 部署指南

本指南将帮助您将 TradingFlow 应用部署到 Vercel + Supabase。

## 🚀 部署步骤

### Step 1: 设置 Supabase 数据库

#### 1.1 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 账号登录
4. 点击 "New Project"
5. 填写项目信息：
   - **Organization**: 选择或创建组织
   - **Project name**: `tradingflow`
   - **Database password**: 生成强密码（请保存此密码）
   - **Region**: 选择离您最近的区域（推荐：Tokyo 或 Hong Kong）

#### 1.2 等待项目创建
项目创建需要1-2分钟，请耐心等待。

#### 1.3 获取数据库连接信息
项目创建完成后：

1. 进入 **Settings** → **Database**
2. 复制 **Connection string**，选择 **URI** 格式
3. 将连接字符串中的 `[YOUR-PASSWORD]` 替换为您刚才设置的密码

连接字符串格式：
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres
```

#### 1.4 推送数据库架构
在本地项目中：

```bash
# 设置数据库连接
export DATABASE_URL="您的Supabase连接字符串"

# 推送架构到Supabase
npx prisma db push
```

### Step 2: 配置 Google OAuth

#### 2.1 创建 Google OAuth 应用
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID：
   - **Application type**: Web application
   - **Name**: TradingFlow
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` （开发环境）
     - `https://your-domain.vercel.app` （生产环境）
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` （开发环境）
     - `https://your-domain.vercel.app/api/auth/callback/google` （生产环境）

#### 2.2 获取凭据
创建完成后，复制：
- **Client ID**
- **Client Secret**

### Step 3: 部署到 Vercel

#### 3.1 推送代码到 GitHub
```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "Ready for deployment"

# 推送到远程仓库
git push origin main
```

#### 3.2 连接 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择您的 `tradingflow` 仓库
5. 点击 "Import"

#### 3.3 配置环境变量
在 Vercel 项目设置中，添加以下环境变量：

```env
# 数据库连接
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres

# NextAuth配置
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-random-secret-string

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 股票价格API（可选）
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

**生成 NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

#### 3.4 部署
1. 点击 "Deploy"
2. 等待部署完成（通常需要2-3分钟）
3. 部署成功后，您会得到一个 `.vercel.app` 域名

### Step 4: 更新 OAuth 重定向 URI

部署完成后，需要更新 Google OAuth 设置：

1. 返回 Google Cloud Console
2. 更新 OAuth 客户端的重定向 URI：
   - 添加：`https://your-project-name.vercel.app/api/auth/callback/google`
3. 保存更改

### Step 5: 验证部署

1. 访问您的 Vercel 域名
2. 测试 Google 登录功能
3. 检查数据库连接
4. 验证所有功能正常工作

## 🔧 常见问题

### Q: 数据库连接失败
**A**: 检查 `DATABASE_URL` 是否正确，确保密码正确替换。

### Q: Google 登录失败
**A**: 检查 Google OAuth 重定向 URI 是否匹配 Vercel 域名。

### Q: 环境变量不生效
**A**: 在 Vercel 中更新环境变量后需要重新部署。

### Q: 如何查看部署日志
**A**: 在 Vercel 项目面板中点击 "Functions" 标签查看日志。

## 📝 部署后配置

### 自定义域名（可选）
1. 在 Vercel 项目设置中添加自定义域名
2. 更新 DNS 记录
3. 更新 Google OAuth 重定向 URI

### 监控和分析
- Vercel 提供内置的分析功能
- Supabase 提供数据库监控

## 🚨 安全建议

1. **定期更新密码**: 定期更换数据库和 API 密钥
2. **监控日志**: 定期检查访问日志
3. **备份数据**: 定期备份数据库
4. **使用强密码**: 确保所有密码符合安全标准

## 📞 获取帮助

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查 Supabase 数据库连接
3. 验证环境变量配置
4. 查看项目 README 中的故障排除部分
