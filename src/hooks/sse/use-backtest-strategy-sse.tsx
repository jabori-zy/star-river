import { useEffect, useRef } from "react";
import { useBacktestStrategyMarketDataStore } from "@/store/useBacktestStrategyDataStore";
import { BacktestStrategyEvent } from "@/types/strategy-event/backtest-strategy-event";
import { BACKTESET_STRATEGY_SSE_URL } from "./index";


const supportBacktestEvents = [
    "kline-update",
]

const useBacktestStrategyEventSSE = (enabled: boolean = true) => {
  console.log("useBacktestStrategyEventSSE", enabled);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { addMarketData, clearMarketData } = useBacktestStrategyMarketDataStore();

  useEffect(() => {
    // 如果未启用，则关闭现有连接并返回
    if (!enabled) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    // 创建 SSE 连接
    const sse = new EventSource(BACKTESET_STRATEGY_SSE_URL);
    eventSourceRef.current = sse;

    // 处理接收到的消息
    sse.onmessage = (event) => {
      try {
        const strategyEvent = JSON.parse(event.data) as BacktestStrategyEvent;
        console.log("strategyEvent", strategyEvent);
        const eventName = strategyEvent.event;
        
        // 确保事件名称有效
        if (supportBacktestEvents.includes(eventName)) {
          if (eventName === "kline-update") {
            // 将事件添加到对应的存储中
            const cacheKeyStr = strategyEvent.klineCacheKey;
            const data = strategyEvent.kline;
            addMarketData(cacheKeyStr, data);
          }
            
        } else {
          console.warn('未知的事件类型:', eventName);
        }
      } catch (error) {
        console.error('解析 SSE 消息失败:', error);
      }
    };

    // 处理连接错误
    sse.onerror = (error) => {
      console.error('SSE 连接错误:', error);
      // 尝试关闭连接
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      // 可以在这里添加重连逻辑
    };

    // 清理函数，关闭连接
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, addMarketData]);

  // 返回可用的操作
  return {
    clearMarketData, // 从 store 重新导出清除方法，方便直接使用
    isConnected: !!eventSourceRef.current,
  };
};

export default useBacktestStrategyEventSSE;
