# Pane 删除问题解决方案

## 问题描述

在删除子图后，会出现以下错误：

```
Unexpected Application Error!
Value is null
Error: Value is null
    at ensureNotNull (chunk-GDQ7MVTS.js?v=ebd5840f:495:11)
    at ChartModel._internal_removeSeries (chunk-GDQ7MVTS.js?v=ebd5840f:6405:22)
    at ChartApi.removeSeries (chunk-GDQ7MVTS.js?v=ebd5840f:11643:11)
    at Object.clear (lightweight-charts-react-components.js?v=ebd5840f:268:69)
    at lightweight-charts-react-components.js?v=ebd5840f:274:16
```

错误发生在 `SeriesTemplate` 组件中，当删除 Pane 后，React 组件试图清理 series 时发生了空值错误。

## 原因分析

当前的删除方案是直接删除 Pane：
```typescript
chartApiRef.current.removePane(paneIndex);
```

这种方式会导致：
1. Pane 被立即删除
2. React 组件仍然存在，但对应的 Pane 已经不存在
3. 当 React 组件卸载时，`lightweight-charts-react-components` 试图清理 series
4. 但此时 series 已经随着 Pane 一起被删除，导致空值错误

## 解决方案

### 方案1：删除配置（推荐）
```typescript
const handleDeleteIndicator = (indicatorKeyStr: IndicatorKeyStr) => {
    // 只删除配置，让React自然地卸载组件和清理Pane
    // lightweight-charts-react-components会自动处理series和pane的清理
    removeIndicator(chartConfig.id, indicatorKeyStr);
};
```

**优点**：
- React 组件自然卸载
- `lightweight-charts-react-components` 自动处理清理
- 不会出现状态不一致的问题

### 方案2：清空 Pane 内的 Series（新方案）
```typescript
const handleClearPaneSeries = (indicatorKeyStr: IndicatorKeyStr) => {
    const panes = chartApiRef.current.panes();
    const targetPane = panes[paneIndex];
    
    // 获取该Pane内的所有Series
    const seriesInPane = targetPane.getSeries();
    
    // 删除该Pane内的所有Series
    seriesInPane.forEach((series) => {
        if (chartApiRef.current) {
            chartApiRef.current.removeSeries(series);
        }
    });
    
    // Pane会自动消失
};
```

**优点**：
- 使用 `IPaneApi.getSeries()` 获取 Pane 内的所有 Series
- 使用 `IChartApi.removeSeries()` 逐个删除 Series
- 清空 Pane 内的所有 Series 后，Pane 会自动消失
- 避免了直接删除 Pane 导致的状态不一致问题

## 技术实现

### 1. API 使用
根据 `lightweight-charts` 的类型定义：

```typescript
interface IPaneApi<HorzScaleItem> {
    getSeries(): ISeriesApi<SeriesType, HorzScaleItem>[];
}

interface IChartApi {
    removeSeries(seriesApi: ISeriesApi<SeriesType, HorzScaleItem>): void;
}
```

### 2. 实现代码
在 `indicator-debug-panel.tsx` 中添加了新的删除方法：

```typescript
// 通过删除Pane内的所有Series来清空Pane（新方案）
const handleClearPaneSeries = (indicatorKeyStr: IndicatorKeyStr) => {
    const subIndicators = getSubChartIndicators();
    const targetIndicator = subIndicators.find(indicator => indicator.indicatorKeyStr === indicatorKeyStr);

    if (targetIndicator && chartApiRef?.current) {
        const subChartIndex = subIndicators.findIndex(indicator => indicator.indicatorKeyStr === indicatorKeyStr);

        if (subChartIndex !== -1) {
            try {
                const panes = chartApiRef.current.panes();
                const paneIndex = subChartIndex + 1;

                if (panes[paneIndex]) {
                    const targetPane = panes[paneIndex];
                    const seriesInPane = targetPane.getSeries();
                    
                    seriesInPane.forEach((series, index) => {
                        console.log(`删除Pane ${paneIndex} 内的Series ${index}`);
                        if (chartApiRef.current) {
                            chartApiRef.current.removeSeries(series);
                        }
                    });

                    console.log(`已清空Pane ${paneIndex} 内的所有Series，Pane会自动消失`);
                }
            } catch (error) {
                console.error('清空Pane内Series失败:', error);
            }
        }
    }
};
```

### 3. UI 更新
添加了新的按钮来测试不同的删除方式：

- 🔴 红色垃圾桶：删除配置（推荐）
- 🟠 橙色最小化：只删除Pane（保留配置）
- 🟣 紫色图层：清空Pane内Series（新方案）

## 测试方法

1. 打开调试面板
2. 添加一些子图指标
3. 尝试不同的删除方式：
   - 使用红色按钮（推荐方式）
   - 使用紫色按钮（新方案）
   - 使用橙色按钮（会出错的方式）

## 结论

**推荐使用方案1**（删除配置），因为它是最安全和最符合 React 组件生命周期的方式。

**方案2**（清空Series）可以作为备选方案，特别是在需要保留配置但清空显示的场景下使用。

**避免使用**直接删除 Pane 的方式，因为它会导致 React 组件状态与图表 API 状态不一致。
