# Observable 回测策略数据流

这个模块提供了基于 RxJS Observable 的回测策略数据流处理，将 SSE (Server-Sent Events) 包装成响应式数据流，支持 K线、指标等多种数据类型。

## 核心特性

- **响应式数据流**: 使用 RxJS Observable 处理实时 K线、指标数据
- **多数据类型支持**: 支持 K线数据流和指标数据流
- **自动连接管理**: 自动处理 SSE 连接的建立、断开和错误处理
- **数据过滤**: 支持按缓存键过滤特定的数据流
- **连接状态监控**: 提供连接状态的实时监控
- **内存管理**: 自动清理资源，防止内存泄漏

## 使用方式

### 1. K线数据流基本用法

```typescript
import { createKlineStreamForCacheKey } from '@/hooks/obs/backtest-strategy-data-obs';

// 订阅特定缓存键的K线数据
const subscription = createKlineStreamForCacheKey('your-cache-key', true)
  .subscribe({
    next: (klineData: Kline[]) => {
      console.log('收到K线数据:', klineData);
      // 更新图表
      updateChart(klineData);
    },
    error: (error) => {
      console.error('数据流错误:', error);
    },
    complete: () => {
      console.log('数据流完成');
    }
  });

// 记得在组件卸载时取消订阅
useEffect(() => {
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 2. 指标数据流基本用法

```typescript
import { createIndicatorStreamForCacheKey } from '@/hooks/obs/backtest-strategy-data-obs';

// 订阅特定缓存键的指标数据
const subscription = createIndicatorStreamForCacheKey('your-indicator-cache-key', true)
  .subscribe({
    next: (indicatorData: IndicatorValue[]) => {
      console.log('收到指标数据:', indicatorData);
      // 更新指标图表
      updateIndicatorChart(indicatorData);
    },
    error: (error) => {
      console.error('指标数据流错误:', error);
    },
    complete: () => {
      console.log('指标数据流完成');
    }
  });
```

### 3. 在 React 组件中使用

```typescript
import React, { useEffect, useRef } from 'react';
import { createKlineStreamForCacheKey, createIndicatorStreamForCacheKey, getConnectionState } from '@/hooks/obs/backtest-strategy-data-obs';

const MyChartComponent = ({ klineKeyStr, indicatorKeyStr }) => {
  const klineSubscriptionRef = useRef<Subscription | null>(null);
  const indicatorSubscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    // 订阅K线数据流
    klineSubscriptionRef.current = createKlineStreamForCacheKey(klineKeyStr, true)
      .subscribe(klineData => {
        if (klineData.length > 0) {
          const latestKline = klineData[klineData.length - 1];
          updateKlineChart(latestKline);
        }
      });

    // 订阅指标数据流
    indicatorSubscriptionRef.current = createIndicatorStreamForCacheKey(indicatorKeyStr, true)
      .subscribe(indicatorData => {
        if (indicatorData.length > 0) {
          const latestIndicator = indicatorData[indicatorData.length - 1];
          updateIndicatorChart(latestIndicator);
        }
      });

    // 清理函数
    return () => {
      if (klineSubscriptionRef.current) {
        klineSubscriptionRef.current.unsubscribe();
      }
      if (indicatorSubscriptionRef.current) {
        indicatorSubscriptionRef.current.unsubscribe();
      }
    };
  }, [klineKeyStr, indicatorKeyStr]);

  return <div>图表组件</div>;
};
```

### 4. 监听连接状态

```typescript
import { getConnectionState, SSEConnectionState } from '@/hooks/obs/backtest-strategy-data-obs';

const [connectionState, setConnectionState] = useState(SSEConnectionState.DISCONNECTED);

useEffect(() => {
  const subscription = getConnectionState().subscribe(state => {
    setConnectionState(state);
    console.log('连接状态:', state);
  });

  return () => subscription.unsubscribe();
}, []);
```

## API 参考

### 主要函数

#### `createKlineStream(enabled: boolean)`
创建完整的K线数据流，包含所有缓存键的数据。

#### `createKlineStreamForCacheKey(cacheKey: string, enabled: boolean)`
创建特定缓存键的K线数据流，只接收匹配的数据。

#### `createIndicatorStream(enabled: boolean)`
创建完整的指标数据流，包含所有缓存键的数据。

#### `createIndicatorStreamForCacheKey(cacheKey: string, enabled: boolean)`
创建特定缓存键的指标数据流，只接收匹配的数据。

#### `getConnectionState()`
获取 SSE 连接状态的 Observable。

#### `disconnectKlineStream()`
手动断开 SSE 连接。

### 数据类型

#### `klineUpdateEvent`
使用已定义的 `klineUpdateEvent` 类型，包含以下字段：
```typescript
export type klineUpdateEvent = BaseEventProps & {
    klineCacheIndex: number;
    klineCacheKey: CacheKeyStr;
    kline: Kline[];
}
```

#### `SSEConnectionState`
```typescript
enum SSEConnectionState {
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    ERROR = 'error'
}
```

## 与传统方式的对比

### 传统方式 (Zustand + useEffect)
```typescript
// 数据流: SSE → Zustand Store → React State → useEffect → Chart Update
const latestKline = useBacktestKlineDataStore(state => state.getLatestKlineData(key));

useEffect(() => {
  if (latestKline) {
    updateChart(latestKline);
  }
}, [latestKline]);
```

### Observable 方式
```typescript
// 数据流: SSE → Observable → subscribe → Chart Update
createKlineStreamForCacheKey(key).subscribe(klineData => {
  updateChart(klineData);
});
```

## 优势

1. **更好的性能**: 绕过 React 渲染周期，直接更新图表
2. **实时性**: 数据到达后立即处理，无延迟
3. **内存效率**: 不需要在状态中缓存大量数据
4. **错误处理**: 内置的错误处理和重连机制
5. **可组合性**: 可以使用 RxJS 操作符进行数据转换和过滤

## 注意事项

1. 记得在组件卸载时取消订阅，防止内存泄漏
2. 这种方式适合实时数据展示，不适合需要历史数据访问的场景
3. 如果需要在多个组件间共享数据，建议继续使用 Zustand 方式
4. 确保在使用前已安装 RxJS 依赖

## 测试

使用 `ObservableTestExample` 组件来测试 Observable 数据流：

```typescript
import ObservableTestExample from '@/components/chart/stock-chart/kline-chart/observable-test-example';

<ObservableTestExample 
  klineKeyStr="your-cache-key"
  indicatorKeyStrs={[]}
/>
```
