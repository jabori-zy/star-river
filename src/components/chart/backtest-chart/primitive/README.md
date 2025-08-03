# Backtest Chart Primitives

这个文件夹包含了基于 TradingView Lightweight Charts 的 Series Primitives 实现的图表组件。

## KlineLegend Primitive

### 概述
`KlineLegend` 是一个使用 Series Primitives 手动绘制的K线图例组件，替代了原有的基于DOM的图例实现。

### 特性
- 使用 Canvas 直接绘制，性能更好
- 支持鼠标悬浮效果
- 样式与原有图例保持一致
- 自动跟随十字线更新数据
- 支持自定义样式配置

### 使用方法

```tsx
import { KlineLegendPrimitive } from "./primitive/KlineLegendPrimitive";

// 在 CandlestickSeries 内部使用
<CandlestickSeries data={data}>
  <KlineLegendPrimitive
    options={{
      position: {
        top: 10,
        left: 10,
      },
      backgroundColor: "rgba(255, 255, 255, 0.0)",
      textColor: "#000000",
      fontSize: 12,
      padding: 8,
      borderRadius: 4,
      opacity: 1.0,
      hoverBackgroundColor: "rgba(243, 244, 246, 0.8)",
    }}
  />
</CandlestickSeries>
```

### 配置选项

- `position`: 图例位置 `{ top: number, left: number }`
- `backgroundColor`: 背景颜色
- `textColor`: 文本颜色
- `fontSize`: 字体大小
- `padding`: 内边距
- `borderRadius`: 圆角半径
- `opacity`: 透明度
- `hoverBackgroundColor`: 悬浮时的背景颜色
- `valueColor`: 数值颜色
- `upColor`: 上涨颜色 (默认: #22c55e)
- `downColor`: 下跌颜色 (默认: #ef4444)

### 实现原理

1. **Series Primitive**: 实现了 `ISeriesPrimitive` 接口
2. **Canvas 绘制**: 使用 `CanvasRenderingTarget2D` 进行绘制
3. **事件监听**: 监听十字线移动事件更新数据
4. **生命周期管理**: 正确处理 attached/detached 生命周期

### 与原有实现的区别

| 特性 | 原有实现 | Primitive 实现 |
|------|----------|----------------|
| 渲染方式 | DOM 元素 | Canvas 绘制 |
| 性能 | 一般 | 更好 |
| 样式控制 | CSS 类 | Canvas API |
| 事件处理 | React 事件 | Chart API 事件 |
| 层级控制 | z-index | zOrder |

### 注意事项

1. Primitive 必须在对应的 Series 组件内部使用
2. 样式配置通过 options 属性传递，不支持 CSS
3. 文本渲染需要考虑设备像素比 (devicePixelRatio)
4. 事件处理需要手动管理生命周期
