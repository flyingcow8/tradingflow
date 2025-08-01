# 实时价格功能测试指南

## 🎯 测试目标

验证TradingFlow应用的实时股票价格获取和显示功能是否正常工作。

## ✅ 前置条件

1. **Alpha Vantage API已配置**
   - 在`.env.local`中设置`USE_REAL_STOCK_API=true`
   - 在`.env.local`中设置有效的`ALPHA_VANTAGE_API_KEY`

2. **应用正在运行**
   ```bash
   npm run dev
   ```

3. **已登录用户账号**

## 🧪 测试步骤

### 步骤1：添加测试股票持仓

在投资组合页面添加以下测试股票：

| 股票 | 代码 | 市场 | 数量 | 成本价 | 货币 |
|------|------|------|------|--------|------|
| Apple Inc. | AAPL | NASDAQ | 10 | $180.00 | USD |
| Tesla Inc. | TSLA | NASDAQ | 5 | $250.00 | USD |
| 腾讯控股 | 0700 | HKEX | 100 | HK$400.00 | HKD |

**添加方法**：
1. 点击"新增持仓"按钮
2. 选择"股票持仓"
3. 填写上述信息
4. 点击"添加"

### 步骤2：观察自动价格更新

添加股票后，系统会自动获取实时价格：

🔍 **观察点**：
- 页面加载后控制台显示"🔄 后台刷新股票价格..."
- 控制台显示"✅ 价格更新成功: X 个持仓"
- 页面底部显示"最后更新: XX:XX:XX"

### 步骤3：验证实时价格显示

在持仓表格中检查：

#### 当前价格列
- **实时价格**：显示从API获取的最新价格
- **价格状态**：绿色动态圆点 + "实时 +X.XX%" 徽章
- **成本价**：如果无实时数据，显示"成本价"徽章

#### 市值计算
- **市值列**：基于实时价格计算（实时价格 × 数量）
- **盈亏列**：基于实时价格vs成本价计算
- **收益率**：基于实时市值vs成本计算

### 步骤4：手动刷新测试

1. 点击"刷新价格"按钮
2. 观察按钮显示"更新中..."
3. 观察价格数据变化
4. 查看更新时间戳

### 步骤5：验证多货币统一显示

检查投资组合总览：
- **总市值**：统一美元显示
- **美股持仓**：AAPL, TSLA 使用美元
- **港股持仓**：0700 港币自动转换为美元
- **汇率转换**：1 HKD = 0.128 USD

## 🔍 预期结果

### ✅ 成功指标

1. **API连接成功**
   ```
   ✅ Alpha Vantage: $201.08 (+0.08)
   ✅ Yahoo Finance: $201.08 (+0.00)
   ```

2. **价格显示正确**
   - 实时价格与成本价不同
   - 显示绿色圆点和"实时"徽章
   - 价格变动百分比正确

3. **市值计算准确**
   - 使用实时价格计算
   - 多货币正确转换
   - 盈亏计算准确

4. **用户体验良好**
   - 自动后台更新
   - 手动刷新响应
   - 加载状态清晰

### ⚠️ 可能的问题

1. **部分股票无实时价格**
   - 港股可能只有Yahoo Finance数据
   - Alpha Vantage免费版有限制
   - 显示"成本价"徽章是正常的

2. **API限制**
   - 免费版每分钟5次请求
   - 每天500次请求限制
   - 超限时使用备用数据源

3. **价格延迟**
   - 数据可能有15-20分钟延迟
   - 非交易时间价格不更新

## 🛠️ 调试工具

### 测试API连接
```bash
npm run test:price-api
```

### 查看控制台日志
打开浏览器开发者工具，查看：
- 价格更新日志
- API调用状态
- 错误信息

### 检查网络请求
在开发者工具Network标签查看：
- `/api/prices/update` 请求
- `/api/positions` 请求
- 响应数据和状态码

## 📊 高级测试

### 测试Today's P&L计算
1. 添加持仓后检查仪表板
2. 观察"今日损益"数值
3. 验证计算逻辑是否合理

### 测试数据持久化
1. 刷新页面
2. 检查实时价格是否保存
3. 验证市值计算一致性

### 测试错误处理
1. 断开网络连接
2. 点击刷新价格
3. 观察错误处理和用户提示

## 📝 测试报告模板

```
### 实时价格功能测试结果

**测试时间**: YYYY-MM-DD HH:MM
**测试环境**: Development/Production
**API状态**: Alpha Vantage + Yahoo Finance

#### 测试结果
- [ ] API连接成功
- [ ] 价格自动更新
- [ ] 实时价格显示
- [ ] 市值计算正确
- [ ] 多货币转换
- [ ] 手动刷新功能
- [ ] 错误处理

#### 发现的问题
1. 
2. 
3. 

#### 建议改进
1. 
2. 
3. 
```

## 🚀 生产环境部署

在生产环境中：
1. 使用付费Alpha Vantage计划获取更高请求限制
2. 配置CDN缓存API响应
3. 添加更多错误监控和告警
4. 考虑添加WebSocket实时推送 