import { useEffect, useRef } from "react";
import { useStrategyEventStore } from "@/store/useStrategyEventStore";
import type { LiveStrategyEvent } from "@/types/strategyEvent";

const useStrategyEventSSE = (strategyId: number, enabled: boolean = true) => {
	const eventSourceRef = useRef<EventSource | null>(null);
	const { addEvent, clearEvents } = useStrategyEventStore();

	useEffect(() => {
		// If not enabled, close existing connection and return
		if (!enabled) {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
			return;
		}

		// Create SSE connection
		const sse = new EventSource(
			"http://localhost:3100/strategy_sse?strategy_id=" + strategyId,
		);
		eventSourceRef.current = sse;

		// Handle received messages
		sse.onmessage = (event) => {
			try {
				const strategyEvent = JSON.parse(event.data) as LiveStrategyEvent;
				const eventName = strategyEvent.event_name;

				// Ensure event name is valid
				if (
					eventName === "strategy-data-update" ||
					eventName === "node-message-update"
				) {
					// Add event to corresponding storage
					addEvent(eventName, strategyEvent);
				} else {
					console.warn("Unknown event type:", eventName);
				}
			} catch (error) {
				console.error("Failed to parse SSE message:", error);
			}
		};

		// Handle connection errors
		sse.onerror = (error) => {
			console.error("SSE connection error:", error);
			// Attempt to close connection
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}

			// Reconnection logic can be added here
		};

		// Cleanup function, close connection
		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
		};
	}, [strategyId, enabled, addEvent]);

	// Return available operations
	return {
		clearEvents, // Re-export clear method from store for convenience
		isConnected: !!eventSourceRef.current,
	};
};

export default useStrategyEventSSE;
