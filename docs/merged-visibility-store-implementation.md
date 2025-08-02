# 合并可见性状态管理实现

## 功能概述

成功将指标和K线的可见性状态管理合并到 `BacktestChartStore` 中，解决了多个图表共享全局状态的问题。现在每个图表实例都有自己独立的可见性状态。

## 主要变更

### ✅ 已完成的工作

1. **BacktestChartStore扩展**
   - 添加了 `indicatorVisibilityMap` 和 `klineVisibilityMap` 状态
   - 集成了所有可见性控制方法
   - 保持了每个图表实例的独立状态

2. **组件更新**
   - 所有图例组件现在使用 `BacktestChartStore` 而不是全局store
   - 传递 `chartConfig` 参数以获取正确的store实例
   - 保持了原有的功能和UI

3. **清理工作**
   - 删除了原来的 `indicator-visibility-store.ts` 文件
   - 更新了所有相关组件的导入

## 技术实现

### 1. BacktestChartStore扩展

```typescript
interface BacktestChartStore {
  // 原有状态...
  
  // === 系列可见性状态 ===
  indicatorVisibilityMap: Record<IndicatorKeyStr, boolean>;
  klineVisibilityMap: Record<KlineKeyStr, boolean>;
  
  // === 可见性控制方法 ===
  setIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr, visible: boolean) => void;
  toggleIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => void;
  getIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => boolean;
  
  setKlineVisibility: (klineKeyStr: KlineKeyStr, visible: boolean) => void;
  toggleKlineVisibility: (klineKeyStr: KlineKeyStr) => void;
  getKlineVisibility: (klineKeyStr: KlineKeyStr) => boolean;
  
  // 批量操作方法...
}
```

### 2. 组件更新模式

所有图例组件现在遵循以下模式：

```typescript
// 组件接口添加 chartConfig
interface ComponentProps {
  // 原有props...
  chartConfig: BacktestChartConfig;
}

// 组件实现使用对应的store
const Component = ({ chartConfig, ...props }) => {
  const { getIndicatorVisibility, toggleIndicatorVisibility } = useBacktestChartStore(chartConfig);
  // ...
};
```

### 3. 更新的组件列表

1. **KlineLegend** - K线图例组件
2. **IndicatorLegend** - 指标图例组件
3. **MainChartIndicatorLegend** - 主图指标图例
4. **SubChartIndicatorLegend** - 子图指标图例
5. **MainChartIndicatorSeries** - 主图指标系列
6. **SubChartIndicatorSeries** - 子图指标系列

## 使用方法

### 1. 基本使用

现在每个图表实例都有独立的可见性状态：

```typescript
// 图表1
const chart1Config = { id: 1, /* ... */ };
const chart1Store = useBacktestChartStore(chart1Config);

// 图表2
const chart2Config = { id: 2, /* ... */ };
const chart2Store = useBacktestChartStore(chart2Config);

// 两个图表的可见性状态完全独立
chart1Store.setIndicatorVisibility('MACD_BINANCE_BTCUSDT_1h', false);
chart2Store.setIndicatorVisibility('MACD_BINANCE_BTCUSDT_1h', true);
```

### 2. 在组件中使用

```typescript
// 图例组件自动获取正确的store实例
<KlineLegend 
  klineSeriesData={legendData} 
  klineKeyStr={klineKeyStr}
  chartConfig={chartConfig} // 传递图表配置
/>
```

### 3. 编程控制

```typescript
const { 
  getKlineVisibility, 
  setKlineVisibility, 
  toggleKlineVisibility,
  getIndicatorVisibility,
  setIndicatorVisibility,
  toggleIndicatorVisibility
} = useBacktestChartStore(chartConfig);

// K线控制
const isKlineVisible = getKlineVisibility('BINANCE_BTCUSDT_1h');
setKlineVisibility('BINANCE_BTCUSDT_1h', false);
toggleKlineVisibility('BINANCE_BTCUSDT_1h');

// 指标控制
const isIndicatorVisible = getIndicatorVisibility('MACD_BINANCE_BTCUSDT_1h');
setIndicatorVisibility('MACD_BINANCE_BTCUSDT_1h', false);
toggleIndicatorVisibility('MACD_BINANCE_BTCUSDT_1h');
```

## 优势

### ✨ 解决的问题

1. **多图表独立性**：每个图表实例现在有独立的可见性状态
2. **状态隔离**：图表1的操作不会影响图表2
3. **内存管理**：图表销毁时，相关状态也会被清理
4. **类型安全**：完整的TypeScript类型支持

### 🎯 技术优势

1. **统一管理**：所有图表相关状态在一个store中
2. **性能优化**：避免了全局状态的不必要更新
3. **可扩展性**：易于添加新的图表相关状态
4. **维护性**：减少了store的数量，简化了架构

## 注意事项

1. **向后兼容**：所有原有功能保持不变
2. **组件更新**：所有图例组件都需要传递 `chartConfig` 参数
3. **状态默认值**：所有K线和指标默认为可见状态
4. **清理机制**：图表实例销毁时会自动清理相关状态

## 测试验证

可以通过以下方式验证功能：

1. **多图表测试**：创建多个图表实例，验证可见性状态独立
2. **功能测试**：点击眼睛按钮，验证只影响当前图表
3. **状态持久性**：验证图表重新渲染时状态保持
4. **内存清理**：验证图表销毁时状态被正确清理

## 后续扩展

1. **状态持久化**：可以将每个图表的状态保存到localStorage
2. **批量操作**：添加图表级别的批量显示/隐藏功能
3. **状态同步**：可选的多图表状态同步功能
4. **快捷键支持**：为每个图表添加独立的快捷键控制
5. **状态导出**：支持导出和导入图表的可见性配置
