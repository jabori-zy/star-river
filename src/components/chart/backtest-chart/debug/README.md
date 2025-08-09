# 新图表组件调试面板

## 概述

这是为新图表组件 `BacktestChartNew` 专门设计的调试面板，用于帮助开发者调试和管理图表中的指标和子图pane。

## 功能特性

### 1. 图表信息显示
- 显示图表ID
- 显示主图指标数量
- 显示子图指标数量
- 显示总指标数量
- 显示Pane数量（通过图表API获取）

### 2. 子图Pane删除测试
新图表组件调试器专门针对子图pane的删除功能进行了优化，提供了两种删除方式：

#### 🔴 删除配置（推荐方式）
- **适用范围**: 所有指标（主图和子图）
- **操作**: 调用 `removeIndicator(chartId, indicatorKeyStr)`
- **原理**: 通过设置 `isDelete: true` 让配置层面删除指标
- **结果**: 新图表组件的 `useBacktestChart` hook 会自动处理pane的清理
- **优点**: 
  - 状态一致性好
  - 自动处理依赖清理
  - 不会出现状态不一致问题

#### 🟠 只删除Pane（测试方式）
- **适用范围**: 仅子图指标
- **操作**: 直接调用 `chartApi.removePane(paneIndex)`
- **原理**: 绕过配置层，直接操作图表API删除pane
- **结果**: Pane被删除，但配置保留
- **问题**: 可能导致配置与实际图表状态不一致

#### 🟣 清空Pane内Series（新方案）
- **适用范围**: 仅子图指标
- **操作**: 删除指定Pane内的所有Series，让Pane自动消失
- **原理**: 通过 `chartApi.removeSeries()` 删除所有series
- **结果**: Series被删除，空的Pane会自动消失
- **特点**: 这是一种更温和的删除方式

### 3. 指标管理
- **查看所有指标**: 列出所有主图和子图指标
- **指标可见性控制**: 单独控制每个指标的显示/隐藏
- **批量操作**: 
  - 全部显示
  - 全部隐藏
  - 删除全部指标
- **指标详情**: 查看单个指标的详细信息和数据统计

### 4. 数据统计
- 显示每个指标的数据点数量
- 区分主图指标和子图指标
- 显示指标是否有数据
- 显示Pane引用信息（仅子图指标）

### 5. 调试功能
- **打印图表配置**: 将完整的图表配置打印到控制台，并复制到剪贴板
- **打印指标详情**: 查看单个指标的详细信息，包括数据统计和Pane引用
- **实时状态监控**: 显示图表的实时状态信息

## 与旧版调试器的区别

### 架构差异
- **旧版**: 基于 `lightweight-charts-react-components` 的React组件架构
- **新版**: 基于 `useBacktestChart` hook 的直接API调用架构

### Pane管理差异
- **旧版**: 通过React组件的生命周期管理Pane
- **新版**: 通过hook内部的 `createIndicatorSeries` 方法直接创建和管理Pane

### 删除机制差异
- **旧版**: 依赖React组件卸载来清理Pane
- **新版**: 通过配置变化触发hook重新计算来清理Pane

## 使用方法

### 启用调试面板
调试面板已集成到新图表组件中：
```tsx
<BacktestChartNew 
    strategyId={strategyId} 
    chartId={chartId} 
/>
```

### 打开调试面板
1. 在图表右上角点击"调试面板 (New)"按钮
2. 调试面板将以浮动窗口的形式显示

### 测试删除功能
1. **推荐测试**: 使用🔴红色垃圾桶按钮删除指标
2. **问题测试**: 使用🟠橙色最小化按钮只删除Pane
3. **新方案测试**: 使用🟣紫色图层按钮清空Pane内Series

### 查看调试信息
1. 点击"打印配置到控制台"按钮
2. 打开浏览器开发者工具的控制台
3. 查看详细的配置信息和Pane引用信息

## 测试页面

访问 `/test-new-chart-debugger` 可以使用专门的测试页面：
- 预配置了多个测试指标（主图和子图）
- 提供了完整的测试环境
- 包含详细的使用说明

## 控制台输出格式

### 图表配置输出
```
🔧 图表配置调试信息 (New Chart)
  📊 完整配置: {...}
  🔑 图表ID: 999
  📈 K线配置: {...}
  📊 所有指标配置: {...}
  📈 主图指标: [...]
  📉 子图指标: [...]
  📋 指标数据: {...}
  📊 主图指标数量: 2
    主图指标1: {...}
    主图指标2: {...}
  📉 子图指标数量: 3
    子图指标1: {...}
      Pane引用: {...}
    子图指标2: {...}
      Pane引用: {...}
  🎯 图表API信息:
    - Panes数量: 4
    - 时间范围: {...}
    - 图表尺寸: {...}
```

### 指标详情输出
```
🔍 指标详情: RSI
  指标键: symbol:BTCUSDT|interval:1m|indicator:RSI|params:{"period":14}
  指标类型: sub
  可见性: true
  数据详情: {...}
  数据点数量: 120
    value: 120 个数据点
  Pane引用: {...}
```

## 技术细节

### Pane索引计算
在新图表组件中，Pane索引的计算方式：
```typescript
// 子图的Pane索引 = 主图(0) + 子图索引 + 1
const paneIndex = subChartIndex + 1;
```

### Store集成
调试面板直接使用新图表组件的store：
```typescript
const {
    getIndicatorVisibility,
    toggleIndicatorVisibility,
    indicatorData,
    getChartRef,
    getSubChartPaneRef,
} = useBacktestChartStore(chartConfig.id);
```

### 配置管理
使用全局配置store进行指标删除：
```typescript
const { removeIndicator } = useBacktestChartConfigStore();
```

## 注意事项

1. **删除顺序**: 建议优先使用配置删除方式，避免直接操作Pane
2. **状态一致性**: 直接删除Pane可能导致配置与实际状态不一致
3. **调试环境**: 调试面板主要用于开发环境，生产环境建议隐藏
4. **性能影响**: 频繁的删除和添加操作可能影响性能，建议适度使用
