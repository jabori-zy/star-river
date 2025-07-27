import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom"; // 引入 flushSync

const useStrategySSE = (strategyId: number, enabled: boolean = true) => {
	const eventSourceRef = useRef<EventSource | null>(null);
	const [strategeEvent, setStrategeEvent] = useState<Record<string, any[]>>({});
	const strategyEventRef = useRef<Record<string, any[]>>({});

	// 添加清空节点消息的方法
	const clearEvent = useCallback((nodeId: string) => {
		// 如果节点不存在或消息数组为空，直接返回
		if (
			!strategyEventRef.current[nodeId] ||
			strategyEventRef.current[nodeId].length === 0
		) {
			return;
		}

		// 直接清空该节点的所有消息
		strategyEventRef.current[nodeId] = [];

		// 更新状态
		setStrategeEvent({ ...strategyEventRef.current });
	}, []);

	useEffect(() => {
		if (!enabled) {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
			return;
		}

		const sse = new EventSource(
			"http://localhost:3100/strategy_sse?strategy_id=" + strategyId,
		);
		eventSourceRef.current = sse;

		sse.onmessage = (event) => {
			const newEvent = JSON.parse(event.data);
			const nodeId = newEvent.from_node_id;

			// 初始化节点消息数组和计数器
			if (!strategyEventRef.current[nodeId]) {
				strategyEventRef.current[nodeId] = [];
			}

			// 添加消息到数组
			strategyEventRef.current[nodeId].push({
				...newEvent,
			});

			// 使用 flushSync 强制同步更新
			flushSync(() => {
				setStrategeEvent({ ...strategyEventRef.current }); // 创建新对象
				// console.log(`Node ${nodeId} received message`, strategyMessageRef.current[nodeId]);
			});
		};

		sse.onerror = (error) => {
			console.error("SSE错误:", error);
			sse.close();
		};

		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
		};
	}, [strategyId, enabled]);

	return { strategeMessage: strategeEvent, clearNodeMessages: clearEvent };
};

export default useStrategySSE;
