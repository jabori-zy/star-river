# 指标图例实现

## 概述

参考K线图例的实现，完成了指标图例的功能。指标图例展示格式为：指标名称（从indicatorKeyStr中解析），keyof IndicatorValueConfig： value

## 实现的文件

### 核心文件
- `use-indicator-legend.ts` - 指标图例的核心逻辑hook
- `indicator-legend.tsx` - 指标图例的UI组件

### 主图指标Legend
- `main-chart-indicator-legend.tsx` - 主图指标图例组件

### 子图指标Legend  
- `sub-chart-indicator-legend.tsx` - 子图指标图例组件
- `sub-chart-indicator-series.tsx` - 修改为支持指标legend

### 集成文件
- `backtest-chart/index.tsx` - 集成主图和子图指标legend
- `legend/index.ts` - 导出组件和类型

## 功能特性

### 主图指标Legend
1. **指标名称解析**: 从indicatorKeyStr中解析出指标的显示名称
2. **动态数据显示**: 显示当前时间点的所有指标值
3. **颜色区分**: 不同指标值使用不同颜色显示
4. **位置管理**: 多个指标图例自动调整位置避免重叠

### 子图指标Legend
1. **独立定位**: 每个子图pane内独立显示legend，使用固定定位相对于pane
2. **实时跟随**: 使用ResizeObserver监听pane变化，legend实时跟随pane位置
3. **统一样式**: 与主图legend保持一致的显示格式
4. **crosshair响应**: 响应鼠标移动事件更新数据

## 使用方式

### 主图指标
```tsx
<MainChartIndicatorLegend
  ref={legendRef}
  indicatorKeyStr={indicatorKeyStr}
  data={indicatorData}
  index={index}
/>
```

### 子图指标
```tsx
<SubChartIndicatorLegend
  ref={legendRef}
  indicatorKeyStr={indicatorKeyStr}
  data={indicatorData}
  paneRef={paneRef}
/>
```

## 架构设计

### 事件流
1. 用户移动鼠标 → Chart的onCrosshairMove
2. BacktestChart的handleCrosshairMove统一处理
3. 分发到K线legend、主图指标legend、子图指标legend
4. 各legend根据时间点查找对应数据并更新显示

### 组件层次
```
BacktestChart
├── Chart (onCrosshairMove=handleCrosshairMove)
│   ├── CandlestickSeries + KlineLegend
│   ├── MainChartIndicatorLegend (主图指标)
│   └── Pane (子图)
│       ├── SubChartIndicatorLegend (子图指标)
│       └── IndicatorSeries
```

## 技术要点

### 子图Legend定位
- 通过`paneRef.current.api().getHTMLElement()`获取pane的HTML元素
- 使用`getBoundingClientRect()`计算pane的实际位置
- 设置legend为`position: fixed`并基于pane位置计算偏移
- 使用`ResizeObserver`监听pane大小变化，实时更新legend位置

### 性能优化
- 只保留ResizeObserver一种监听机制，避免重复更新
- 条件更新：只在实际位置变化时更新legend
- 正确清理：组件卸载时清理所有监听器

## 注意事项

1. **React hooks规则**: 所有hooks必须在组件顶层调用
2. **ref管理**: 使用forwardRef和useImperativeHandle正确暴露方法
3. **事件传递**: 统一的crosshair事件处理确保所有legend同步更新
4. **样式定位**: 
   - 主图使用绝对定位避免重叠
   - 子图使用固定定位相对于pane，确保跟随pane移动
