# Pane 删除测试页面 - 创建总结

## 已完成的工作

### 1. 创建了专门的测试页面
- **文件位置**: `src/pages/test-pane-deletion.tsx`
- **路由**: `http://localhost:5173/test-pane-deletion`
- **功能**: 专门测试 lightweight-charts 中 Pane 删除功能

### 2. 使用真实配置结构
- 采用与生产环境相同的 `BacktestChartConfig` 配置结构
- 包含完整的指标配置：`IndicatorChartConfig[]`
- 支持主图指标和子图指标
- 使用真实的 Series 类型（line、column）

### 3. 实现三种删除方式测试

#### 方式1: 只删除 Pane（🟠 橙色按钮）
```typescript
const handleRemovePaneOnly = (indicatorKeyStr: IndicatorKeyStr) => {
  // 直接调用 chartApi.removePane(paneIndex)
  // 保留 React 配置，可能导致状态不一致
};
```

#### 方式2: 删除配置（🔴 红色按钮）
```typescript
const handleDeleteIndicator = (indicatorKeyStr: IndicatorKeyStr) => {
  // 设置 isDelete: true，让 React 自然卸载组件
  // 推荐的删除方式
};
```

#### 方式3: 同时删除（⚫ 黑色按钮）
```typescript
const handleDeleteBoth = (indicatorKeyStr: IndicatorKeyStr) => {
  // 先删除 Pane，延迟删除配置
  // 可能导致各种问题
};
```

### 4. 完整的调试功能
- 实时状态显示（主图指标数量、子图指标数量、Pane 数量）
- 详细的控制台调试信息
- 支持添加新的测试指标
- 支持恢复已删除的指标
- 打印完整的图表配置和 API 信息

### 5. 模拟数据生成
- 使用现有的 `generateOHLCData` 生成 K线数据
- 创建了 `generateMockIndicatorData` 和 `generateMockHistogramData` 生成指标数据
- 数据结构与真实环境保持一致

### 6. 路由配置
- 已添加到 `src/router/index.tsx`
- 可通过 `/test-pane-deletion` 路径访问

## 测试页面特性

### 初始状态
- 5个指标：2个主图指标（MA5, MA20），3个子图指标（RSI, MACD, Volume）
- 对应的图表结构：1个主图 Pane + 3个子图 Pane = 4个 Pane

### 交互功能
1. **状态监控**: 实时显示当前指标和 Pane 数量
2. **删除测试**: 三种不同的删除方式
3. **恢复功能**: 可以恢复已删除的指标
4. **动态添加**: 可以添加新的测试指标
5. **调试输出**: 详细的控制台日志

### 视觉反馈
- 已删除的指标显示为删除线样式
- 不同类型的按钮有不同的颜色标识
- 实时显示图表状态信息
- Badge 显示指标类型和键名

## 如何使用测试页面

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问测试页面
打开浏览器访问: `http://localhost:5173/test-pane-deletion`

### 3. 测试删除功能
1. 观察初始状态（5个指标，4个 Pane）
2. 尝试不同的删除方式：
   - 🟠 只删除 Pane（仅子图指标可用）
   - 🔴 删除配置（推荐方式）
   - ⚫ 同时删除（可能有问题）
3. 观察控制台输出和图表变化
4. 使用"恢复"按钮测试恢复功能
5. 使用"添加测试指标"测试动态添加

### 4. 调试信息
- 点击"打印调试信息"按钮查看详细信息
- 观察控制台中的 Pane 数量变化
- 检查是否有错误或警告信息

## 预期测试结果

### 正常情况（推荐方式）
- 使用 🔴 删除配置：指标和对应的 Pane 都被正确删除
- 其他指标继续正常显示
- 没有控制台错误

### 问题情况（不推荐方式）
- 使用 🟠 只删除 Pane：可能出现渲染问题或状态不一致
- 使用 ⚫ 同时删除：可能出现时序问题

## 技术要点

### Pane 索引计算
```typescript
// 子图的 Pane 索引 = 主图(0) + 子图索引 + 1
const paneIndex = subChartIndex + 1;
```

### 配置过滤
```typescript
const getSubChartIndicators = () => {
  return chartConfig.indicatorChartConfigs.filter(
    (indicatorConfig) => indicatorConfig.isInMainChart === false && !indicatorConfig.isDelete
  );
};
```

### 软删除实现
```typescript
setChartConfig(prev => ({
  ...prev,
  indicatorChartConfigs: prev.indicatorChartConfigs.map(config =>
    config.indicatorKeyStr === indicatorKeyStr
      ? { ...config, isDelete: true }
      : config
  )
}));
```

## 下一步建议

1. **运行测试**: 访问测试页面，验证各种删除方式的行为
2. **问题复现**: 尝试复现原始问题中提到的删除子图表问题
3. **解决方案验证**: 确认推荐的删除方式（软删除）是否能解决问题
4. **性能测试**: 测试大量指标的删除和恢复操作
5. **边界情况**: 测试删除所有子图指标、删除最后一个指标等边界情况

## 相关文件

- `src/pages/test-pane-deletion.tsx` - 主测试页面
- `src/pages/test-pane-deletion/README.md` - 详细说明文档
- `src/router/index.tsx` - 路由配置
- `src/components/chart/backtest-chart/debug/indicator-debug-panel.tsx` - 原始调试面板参考
