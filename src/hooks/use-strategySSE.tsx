import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom"; // Import flushSync

const useStrategySSE = (strategyId: number, enabled: boolean = true) => {
	const eventSourceRef = useRef<EventSource | null>(null);
	const [strategeEvent, setStrategeEvent] = useState<Record<string, any[]>>({});
	const strategyEventRef = useRef<Record<string, any[]>>({});

	// Method to clear node messages
	const clearEvent = useCallback((nodeId: string) => {
		// Return directly if the node doesn't exist or the message array is empty
		if (
			!strategyEventRef.current[nodeId] ||
			strategyEventRef.current[nodeId].length === 0
		) {
			return;
		}

		// Clear all messages for this node
		strategyEventRef.current[nodeId] = [];

		// Update state
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

			// Initialize node message array and counter
			if (!strategyEventRef.current[nodeId]) {
				strategyEventRef.current[nodeId] = [];
			}

			// Add message to array
			strategyEventRef.current[nodeId].push({
				...newEvent,
			});

			// Use flushSync to force synchronous update
			flushSync(() => {
				setStrategeEvent({ ...strategyEventRef.current }); // Create new object
				// console.log(`Node ${nodeId} received message`, strategyMessageRef.current[nodeId]);
			});
		};

		sse.onerror = (error) => {
			console.error("SSE error:", error);
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
