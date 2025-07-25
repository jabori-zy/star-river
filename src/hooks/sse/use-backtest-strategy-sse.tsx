import { useEffect, useRef } from "react";
import {
	BacktestStrategyEvent,
	indicatorUpdateEvent,
	klineUpdateEvent,
	FuturesOrderFilledEvent,
} from "@/types/strategy-event/backtest-strategy-event";
import { BACKTESET_STRATEGY_SSE_URL } from "./index";
import { useBacktestIndicatorDataStore } from "@/store/backtest-replay-store/use-backtest-indicator-store";
import { useBacktestKlineDataStore } from "@/store/backtest-replay-store/use-backtest-kline-store";
import { useBacktestOrderDataStore } from "@/store/backtest-replay-store/use-backtest-order-store";

const supportBacktestEvents = [
	"kline-update",
	"indicator-update",
	"futures-order_created",
	"futures-order-filled",
];

const useBacktestStrategyEventSSE = (enabled: boolean = true) => {
	// console.log("useBacktestStrategyEventSSE", enabled);
	const eventSourceRef = useRef<EventSource | null>(null);
	const { addIndicatorData } = useBacktestIndicatorDataStore();
	const { addKlineData } = useBacktestKlineDataStore();
	const { addSingleOrder, getAllOrderData } = useBacktestOrderDataStore();

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
				// console.log("strategyEvent", strategyEvent);
				const eventName = strategyEvent.event;

				// 确保事件名称有效
				if (supportBacktestEvents.includes(eventName)) {
					if (eventName === "kline-update") {
						// 将事件添加到对应的存储中

						const cacheKeyStr = (strategyEvent as klineUpdateEvent).klineKey;
						const data = (strategyEvent as klineUpdateEvent).kline;
						addKlineData(cacheKeyStr, data);
					}
					if (eventName === "indicator-update") {
						// 将事件添加到对应的存储中
						const cacheKeyStr = (strategyEvent as indicatorUpdateEvent)
							.indicatorKey;
						const data = (strategyEvent as indicatorUpdateEvent)
							.indicatorSeries;
						// console.log("添加新指标数据", cacheKeyStr, data);
						addIndicatorData(cacheKeyStr, data);
					}
					if (eventName === "futures-order-filled") {
						const data = (strategyEvent as FuturesOrderFilledEvent)
							.futuresOrder;
						addSingleOrder(data.exchange, data.symbol, data);
						console.log("所有订单数据", getAllOrderData());
					}
				} else {
					console.warn("未知的事件类型:", eventName);
				}
			} catch (error) {
				console.error("解析 SSE 消息失败:", error);
			}
		};

		// 处理连接错误
		sse.onerror = (error) => {
			console.error("SSE 连接错误:", error);
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
	}, [enabled, addKlineData, addIndicatorData]);

	// 返回可用的操作
	return {
		isConnected: !!eventSourceRef.current,
	};
};

export default useBacktestStrategyEventSSE;
