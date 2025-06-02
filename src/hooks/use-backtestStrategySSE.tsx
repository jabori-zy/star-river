import { useEffect, useRef } from "react";
import { useBacktestStrategyDataStore } from "@/store/useBacktestStrategyDataStore";
import { BacktestStrategyEvent } from "@/types/strategyEvent";

const useBacktestStrategyEventSSE = (enabled: boolean = true) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { addData, clearData } = useBacktestStrategyDataStore();

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
    const sse = new EventSource("http://localhost:3100/api/v1/sse/strategy/backtest");
    eventSourceRef.current = sse;

    // 处理接收到的消息
    sse.onmessage = (event) => {
      try {
        const strategyEvent = JSON.parse(event.data) as BacktestStrategyEvent;
        const eventName = strategyEvent.event_name;
        
        // 确保事件名称有效
        if (eventName === 'backtest-strategy-data-update') {
            const cacheKeyStr = strategyEvent.cache_key;
            const data = strategyEvent.data;
          // 将事件添加到对应的存储中
          addData(cacheKeyStr, data);
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
  }, [enabled, addData]);

  // 返回可用的操作
  return {
    clearData, // 从 store 重新导出清除方法，方便直接使用
    isConnected: !!eventSourceRef.current,
  };
};

export default useBacktestStrategyEventSSE;
