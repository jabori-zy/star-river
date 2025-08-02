# 系列可见性控制功能

## 功能概述

实现了在图例中添加眼睛按钮来控制K线和指标的可见性。用户可以通过点击图例中的眼睛图标来显示或隐藏K线或指标，支持多个series的批量控制（如MACD指标的多条线）。

## 核心功能

### ✨ 已实现的功能

1. **K线可见性状态管理**
   - 使用Zustand创建全局状态管理store
   - 支持单个K线的可见性控制
   - 支持批量设置和重置功能

2. **指标可见性状态管理**
   - 使用Zustand创建全局状态管理store
   - 支持单个指标的可见性控制
   - 支持批量设置和重置功能

3. **图例中的眼睛按钮控制**
   - 可见时显示蓝色眼睛图标 (Eye)
   - 隐藏时显示灰色眼睛关闭图标 (EyeOff)
   - 按钮状态与K线/指标可见性实时同步

4. **Series组件支持visible属性**
   - CandlestickSeries支持visible属性控制
   - 所有类型的IndicatorSeries都支持visible属性控制
   - 包括LineSeries、HistogramSeries、AreaSeries

5. **主图和子图的可见性控制**
   - 主图K线可见性控制
   - 主图指标和子图指标都支持可见性控制
   - 多个series的批量控制（如MACD的MACD线、Signal线、Histogram）

## 技术实现

### 1. 状态管理 (`src/store/indicator-visibility-store.ts`)

```typescript
interface IndicatorVisibilityState {
  visibilityMap: Record<IndicatorKeyStr, boolean>;
  setIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr, visible: boolean) => void;
  toggleIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => void;
  getIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => boolean;
  resetAllVisibility: () => void;
  setBatchVisibility: (visibilityMap: Record<IndicatorKeyStr, boolean>) => void;
}
```

### 2. 核心组件修改

#### IndicatorSeries组件
- 新增`visible`属性支持
- 所有Series类型都支持可见性控制

#### IndicatorLegend组件
- 新增`indicatorKeyStr`属性
- 集成眼睛按钮控制逻辑
- 支持可见性状态的实时显示

#### 主图和子图指标组件
- MainChartIndicatorSeries: 集成可见性状态获取
- SubChartIndicatorSeries: 支持多个series的统一控制

### 3. 文件结构

```
src/
├── store/
│   └── indicator-visibility-store.ts          # 可见性状态管理
├── components/chart/backtest-chart/
│   ├── indicator-series.tsx                   # 支持visible属性
│   ├── main-chart-indicator-series.tsx        # 主图指标系列
│   ├── sub-chart-indicator-series.tsx         # 子图指标系列
│   ├── legend/
│   │   └── indicator-legend.tsx               # 图例组件（含眼睛按钮）
│   └── demo/
│       └── indicator-visibility-demo.tsx      # 演示组件
└── pages/
    └── test-indicator-visibility.tsx          # 测试页面
```

## 使用方法

### 1. 基本使用

在图表中，指标图例会自动显示眼睛按钮：
- 点击眼睛图标切换指标可见性
- 可见时显示蓝色眼睛图标
- 隐藏时显示灰色眼睛关闭图标

### 2. 编程控制

```typescript
import { useIndicatorVisibilityStore } from '@/store/indicator-visibility-store';

const { 
  getIndicatorVisibility, 
  setIndicatorVisibility, 
  toggleIndicatorVisibility 
} = useIndicatorVisibilityStore();

// 获取指标可见性
const isVisible = getIndicatorVisibility('MACD_BINANCE_BTCUSDT_1h');

// 设置指标可见性
setIndicatorVisibility('MACD_BINANCE_BTCUSDT_1h', false);

// 切换指标可见性
toggleIndicatorVisibility('MACD_BINANCE_BTCUSDT_1h');
```

## 测试

### 访问测试页面
1. 启动开发服务器：`npm start`
2. 访问：`http://localhost:5174/test-indicator-visibility`
3. 或通过侧边栏菜单："指标可见性测试"

### 测试功能
- 点击演示组件中的眼睛按钮
- 观察状态变化和图标切换
- 测试批量控制功能

## 注意事项

1. **多Series指标**：对于MACD等包含多个series的指标，所有相关series会统一控制可见性
2. **默认状态**：所有指标默认为可见状态
3. **状态持久化**：当前实现为内存状态，页面刷新后会重置
4. **性能优化**：状态变化只会影响相关的series组件重新渲染

## 后续扩展

1. **状态持久化**：可以将可见性状态保存到localStorage或后端
2. **快捷键支持**：添加键盘快捷键控制
3. **批量操作**：添加"显示所有"/"隐藏所有"按钮
4. **动画效果**：添加显示/隐藏的过渡动画
5. **分组控制**：支持按指标类型分组控制可见性
