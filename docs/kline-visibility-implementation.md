# K线可见性控制功能实现

## 功能概述

在原有指标可见性控制功能的基础上，扩展实现了K线的可见性控制功能。用户现在可以通过点击K线图例中的眼睛按钮来显示或隐藏K线。

## 新增功能

### ✅ K线可见性控制

1. **状态管理扩展**
   - 扩展了 `useIndicatorVisibilityStore` 以支持K线可见性
   - 新增 `klineVisibilityMap` 状态
   - 新增K线相关的控制方法

2. **K线图例增强**
   - 修改 `KlineLegend` 组件，添加眼睛按钮
   - 支持可见性状态的实时显示和切换
   - 与指标图例保持一致的UI设计

3. **CandlestickSeries支持**
   - 为 `CandlestickSeries` 添加 `visible` 属性支持
   - 可见性状态与图例按钮实时同步

## 技术实现

### 1. 状态管理更新

```typescript
// 扩展后的状态接口
interface SeriesVisibilityState {
  indicatorVisibilityMap: Record<IndicatorKeyStr, boolean>;
  klineVisibilityMap: Record<KlineKeyStr, boolean>;
}

// 新增的K线控制方法
setKlineVisibility: (klineKeyStr: KlineKeyStr, visible: boolean) => void;
toggleKlineVisibility: (klineKeyStr: KlineKeyStr) => void;
getKlineVisibility: (klineKeyStr: KlineKeyStr) => boolean;
```

### 2. 组件修改

#### KlineLegend组件
- 新增 `klineKeyStr` 属性
- 集成可见性状态管理
- 添加眼睛按钮控制逻辑

#### 主图表组件
- 获取K线可见性状态
- 将可见性状态传递给 `CandlestickSeries`
- 传递 `klineKeyStr` 给 `KlineLegend`

### 3. 演示组件更新

- 扩展演示组件以包含K线控制
- 分别显示K线和指标的可见性状态
- 提供独立的控制区域

## 文件变更

### 修改的文件

1. **src/store/indicator-visibility-store.ts**
   - 扩展状态接口以支持K线
   - 添加K线相关的控制方法
   - 重命名部分方法以保持一致性

2. **src/components/chart/backtest-chart/legend/kline-legend.tsx**
   - 添加可见性控制逻辑
   - 集成眼睛按钮功能
   - 新增 `klineKeyStr` 属性

3. **src/components/chart/backtest-chart/index.tsx**
   - 导入可见性状态管理
   - 获取K线可见性状态
   - 为CandlestickSeries添加visible属性

4. **src/components/chart/backtest-chart/demo/indicator-visibility-demo.tsx**
   - 扩展演示功能以包含K线控制
   - 更新状态显示部分
   - 添加K线控制区域

5. **src/pages/test-indicator-visibility.tsx**
   - 更新页面标题和说明
   - 反映新的功能范围

6. **docs/indicator-visibility-feature.md**
   - 更新文档以反映K线功能
   - 扩展功能说明和使用方法

## 使用方法

### 基本使用

1. **K线控制**：点击K线图例中的眼睛图标切换K线可见性
2. **指标控制**：点击指标图例中的眼睛图标切换指标可见性
3. **状态同步**：按钮状态与图表显示状态实时同步

### 编程控制

```typescript
import { useIndicatorVisibilityStore } from '@/store/indicator-visibility-store';

const { 
  getKlineVisibility, 
  setKlineVisibility, 
  toggleKlineVisibility 
} = useIndicatorVisibilityStore();

// 获取K线可见性
const isVisible = getKlineVisibility('BINANCE_BTCUSDT_1h');

// 设置K线可见性
setKlineVisibility('BINANCE_BTCUSDT_1h', false);

// 切换K线可见性
toggleKlineVisibility('BINANCE_BTCUSDT_1h');
```

## 测试

访问测试页面：`http://localhost:5174/test-indicator-visibility`

测试功能：
- K线可见性控制
- 指标可见性控制
- 状态同步验证
- 批量操作测试

## 注意事项

1. **向后兼容**：原有的指标可见性功能保持不变
2. **状态管理**：K线和指标使用独立的状态映射
3. **默认状态**：所有K线和指标默认为可见状态
4. **性能优化**：状态变化只影响相关组件重新渲染

## 后续扩展

1. **成交量控制**：可以扩展支持成交量的可见性控制
2. **批量操作**：添加"显示所有K线"/"隐藏所有K线"按钮
3. **状态持久化**：将可见性状态保存到localStorage
4. **快捷键支持**：添加键盘快捷键控制
5. **分组控制**：支持按交易对或时间周期分组控制
