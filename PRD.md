# 投资报表工具 - 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品简介
TradingFlow 是一个面向个人投资者的股票交易记录工具，支持美股和港股市场的交易管理，帮助用户记录交易历史、查看持仓状况、分析基础投资表现。

### 1.2 产品目标
- 提供简单易用的股票交易记录管理功能
- 支持美股和港股两个主要市场
- 展示基础的持仓状态和收益情况
- 生成基础的投资统计报表
- 快速上线验证用户需求

### 1.3 目标用户
- 美股和港股的个人投资者
- 需要记录和管理交易记录的用户
- 希望了解基础投资表现的投资者

## 2. 功能需求

### 2.1 用户管理模块

#### 2.1.1 用户注册登录
- **功能描述**: Google账户一键登录
- **具体要求**:
  - Google OAuth 2.0 登录
  - 自动创建用户账户
  - 登录状态保持
  - 基础个人信息管理（用户名、头像）

### 2.2 交易记录模块

#### 2.2.1 交易记录录入
- **功能描述**: 记录美股和港股的交易信息
- **数据字段**:
  - 市场选择（美股/港股）
  - 股票代码/名称
  - 交易类型（买入/卖出）
  - 交易数量
  - 交易价格
  - 交易货币（USD/HKD）
  - 交易日期
  - 手续费
  - 备注

#### 2.2.2 交易记录管理
- **功能描述**: 查看、编辑、删除交易记录
- **具体要求**:
  - 交易记录列表展示
  - 按时间、股票、市场筛选
  - 交易记录编辑和删除
  - 基础搜索功能

### 2.3 仓位管理模块

#### 2.3.1 持仓概览
- **功能描述**: 显示美股和港股的持仓情况
- **展示内容**:
  - 市场分类（美股/港股）
  - 股票代码/名称
  - 持仓数量
  - 持仓成本
  - 浮动盈亏
  - 持仓比例

#### 2.3.2 资产统计
- **功能描述**: 基础资产统计
- **统计内容**:
  - 总资产价值
  - 总盈亏
  - 盈亏比例
  - 市场分布（美股/港股占比）

### 2.4 基础报表模块

#### 2.4.1 收益统计
- **功能描述**: 基础收益统计信息
- **统计内容**:
  - 总收益率
  - 总盈亏金额
  - 盈利/亏损交易次数
  - 平均持仓天数

#### 2.4.2 交易统计
- **功能描述**: 交易行为统计
- **统计内容**:
  - 交易次数统计
  - 手续费统计
  - 各市场交易分布
  - 月度交易汇总

### 2.5 Dashboard 首页
- **功能描述**: 数据概览页面
- **展示内容**:
  - 总资产和盈亏概览
  - 主要持仓展示
  - 近期交易记录
  - 快速操作入口

## 3. 技术需求

### 3.1 技术架构（MVP版本）
- **前端**: React + TypeScript + Next.js
- **UI框架**: Tailwind CSS
- **表单处理**: React Hook Form + Zod
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js + Google Provider

### 3.2 第三方服务
- **股票数据**: Yahoo Finance API（美股和港股）
- **汇率数据**: Yahoo Finance API（USD/HKD转换）
- **部署**: Vercel（前端 + 数据库）

## 4. 数据模型设计

### 4.1 用户表 (users)
```sql
- id: 主键
- google_id: Google用户ID
- email: 邮箱
- username: 用户名
- avatar_url: 头像链接
- created_at: 创建时间
- updated_at: 更新时间
```

### 4.2 交易记录表 (transactions)
```sql
- id: 主键
- user_id: 用户ID
- market: 市场 (US/HK)
- stock_code: 股票代码
- stock_name: 股票名称
- transaction_type: 交易类型 (买入/卖出)
- quantity: 交易数量
- price: 交易价格
- currency: 交易货币 (USD/HKD)
- transaction_date: 交易日期
- commission: 手续费
- notes: 备注
- created_at: 创建时间
```

### 4.3 持仓表 (positions)
```sql
- id: 主键
- user_id: 用户ID
- market: 市场 (US/HK)
- stock_code: 股票代码
- stock_name: 股票名称
- quantity: 持仓数量
- average_cost: 平均成本
- currency: 货币单位
- last_updated: 最后更新时间
```

## 5. 界面设计要求

### 5.1 设计风格
- 简洁现代的设计风格
- 响应式设计，支持移动端
- 专业的金融工具外观
- 数据可读性优先

### 5.2 色彩方案
- 主色调：蓝色系（专业、信任）
- 辅助色：绿色（盈利）、红色（亏损）
- 背景色：白色/浅灰色
- 文字色：深灰色

### 5.3 关键页面
1. **Google登录页**
2. **Dashboard 首页**（资产概览）
3. **交易记录页**（美股/港股）
4. **持仓管理页**
5. **统计报表页**
6. **个人设置页**

## 6. 性能需求

### 6.1 基础性能要求
- 页面加载时间 < 3秒
- API响应时间 < 2秒
- 支持100+并发用户（初期）
- 交易数据精确到小数点后2位

## 7. 安全需求

### 7.1 基础安全要求
- Google OAuth 2.0 安全认证
- HTTPS加密传输
- 用户身份认证（基于Google账户）
- 数据权限隔离（用户只能看到自己的数据）

## 8. 开发计划

## MVP 开发计划 (8-10周)

### 阶段一：核心功能 (4-5周)
- 用户注册登录系统
- 基础交易记录功能（美股/港股）
- 简单的持仓计算和展示
- 基础UI框架
- 数据库设计和实现

### 阶段二：完善功能 (3-4周)
- 基础统计报表
- Dashboard首页
- 基础汇率支持（USD/HKD）
- 数据验证和错误处理

### 阶段三：上线准备 (1-2周)
- 测试和bug修复
- 部署配置
- 基础文档
- 上线发布

## 9. MVP成功指标

### 9.1 用户指标
- 注册用户数 > 100
- 周活跃用户数 > 20
- 用户留存率 > 30%（7天）

### 9.2 功能指标
- 交易记录录入量 > 500笔
- 用户平均使用时长 > 5分钟
- 功能使用率（记录交易、查看持仓、统计报表）

### 9.3 技术指标
- 系统可用性 > 95%
- 页面加载时间 < 3秒
- 错误率 < 1%

## 10. 后续迭代规划

### V2.0 计划功能
- 数据导入导出
- 更详细的报表分析
- 基础图表可视化
- 移动端优化
- 管理员

### V3.0 计划功能
- 支持更多市场（A股等）
- 高级分析功能
- 社交功能
- API开放 