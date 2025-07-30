# BacktestChart 多实例优化

## 问题描述

之前的实现中，所有 `BacktestChart` 组件共享同一个全局 Zustand store，导致：

1. **状态冲突**：多个图表的状态会互相覆盖
2. **数据更新问题**：只有最后一个图表能接收数据更新
3. **订阅冲突**：数据流订阅会被后初始化的图表覆盖

## 解决方案

采用**方案1：基于 chartId 的多实例 store 管理**

### 核心改动

1. **Store 工厂函数**：
   ```typescript
   const createBacktestChartStore = (chartId: number) => create<BacktestChartStore>((set, get) => ({
     chartId: chartId, // 每个实例有独立的 chartId
     // ... 其他状态
   }));
   ```

2. **多实例管理器**：
   ```typescript
   const storeInstances = new Map<number, ReturnType<typeof createBacktestChartStore>>();
   
   export const getBacktestChartStore = (chartId: number) => {
     if (!storeInstances.has(chartId)) {
       storeInstances.set(chartId, createBacktestChartStore(chartId));
     }
     return storeInstances.get(chartId);
   };
   ```

3. **组件使用**：
   ```typescript
   const BacktestChart = ({ chartConfig }: BacktestChartProps) => {
     const store = useBacktestChartStore(chartConfig.id); // 传入 chartId
     // ...
   };
   ```

4. **清理机制**：
   ```typescript
   useEffect(() => {
     return () => {
       cleanupBacktestChartStore(chartConfig.id); // 组件卸载时清理对应的 store
     };
   }, [chartConfig.id]);
   ```

### 优势

- ✅ **状态隔离**：每个图表有独立的状态空间
- ✅ **数据独立**：每个图表能独立接收和更新数据
- ✅ **订阅独立**：每个图表有独立的数据流订阅
- ✅ **内存管理**：组件卸载时自动清理对应的 store
- ✅ **向后兼容**：保持所有现有 API 不变

### 验证方法

现在当有多个图表时，控制台日志会显示：
```
success update data point, chartId: 1
success update data point, chartId: 2
success update data point, chartId: 3
```

而不是之前只显示一次的情况。

## 修复的问题

### 🐛 **问题1：无限渲染问题**

**问题描述**：删除图表时出现无限渲染循环。

**根本原因**：
- Zustand store 的函数引用在每次调用时都会变化
- `useEffect` 依赖了这些会变化的函数引用
- 导致 `useEffect` 无限触发，造成无限渲染

**解决方案**：
使用 `useRef` 存储 store 函数，避免依赖项变化：

```typescript
// 使用 useRef 存储 store 函数，避免依赖项变化导致无限渲染
const storeActionsRef = useRef({
  setKlineKeyStr,
  setEnabled,
  initKlineData,
  setSeriesRef,
  setChartRef,
  initObserverSubscriptions,
  cleanupSubscriptions,
});

// 在 useEffect 中使用 ref 中的函数
useEffect(() => {
  storeActionsRef.current.setKlineKeyStr(klineKeyStr);
  storeActionsRef.current.setEnabled(enabled);
  getPlayIndex();
}, [
  chartConfig.klineChartConfig.klineKeyStr,
  chartConfig.id, // 只依赖稳定的值
]);
```

### 🐛 **问题2：删除图表后剩余图表数据丢失**

**问题描述**：当有多个图表时，删除其中一个图表后，剩余图表变成空白，历史数据丢失。

**根本原因**：
- 删除图表时，剩余图表的组件可能重新渲染
- `useEffect` 重新执行，调用 `initKlineData()` 重新初始化数据
- 导致已有的历史数据被清空

**解决方案**：
在 store 中添加 `isInitialized` 标志，防止重复初始化：

```typescript
interface BacktestChartStore {
  // ... 其他属性
  isInitialized: boolean; // 标记是否已经初始化过数据
}

initKlineData: async (playIndex: number) => {
  const state = get();

  // 如果已经初始化过且有数据，跳过重复初始化
  if (state.isInitialized && state.chartData.length > 0) {
    console.log("图表已初始化，跳过重复初始化:", state.chartId);
    return;
  }

  // ... 初始化逻辑
  set({ chartData: klineData, isInitialized: true }); // 标记为已初始化
}
```

## 使用说明

组件使用方式完全不变，只需要确保每个图表有唯一的 `chartConfig.id`：

```typescript
<BacktestChart
  strategyId={strategyId}
  chartConfig={{
    id: 1, // 确保每个图表有唯一ID
    // ... 其他配置
  }}
/>
```
