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
