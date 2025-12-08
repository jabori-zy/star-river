import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { Subscription } from "rxjs";
import { VariableTable } from "@/components/new-table/backtest/variable-table";
import BacktestVariableTable from "@/components/table/backtest-variable-table";
import {
	createCustomVariableStream,
	createSystemVariableStream,
} from "@/hooks/obs/backtest-strategy-event-obs";
import { getStrategyVariables } from "@/service/backtest-strategy/variable";
import type {
	CustomVariableUpdateEvent,
	SystemVariableUpdateEvent,
} from "@/types/strategy-event";
import {
	isCustomVariableUpdateEvent,
	isSystemVariableUpdateEvent,
} from "@/types/strategy-event/backtest-strategy-event";
import { isCustomVariable, isSystemVariable } from "@/types/variable";

interface StrategyVariableProps {
	strategyId: number;
}

export interface StrategyVariableRef {
	clearVariableEvents: () => void;
}

const StrategyVariable = forwardRef<StrategyVariableRef, StrategyVariableProps>(
	({ strategyId }, ref) => {
		useImperativeHandle(
			ref,
			() => ({
				clearVariableEvents: () => {
					setVariableUpdateEvents([]);
					hasInitializedRef.current = false;
				},
			}),
			[],
		);

		const [variableUpdateEvents, setVariableUpdateEvents] = useState<
			(CustomVariableUpdateEvent | SystemVariableUpdateEvent)[]
		>([]);

		const customVariableSubscriptionRef = useRef<Subscription | null>(null);
		const systemVariableSubscriptionRef = useRef<Subscription | null>(null);
		const isInitializingRef = useRef(false);
		const hasInitializedRef = useRef(false);
		const variableUpdateEventsRef = useRef<
			(CustomVariableUpdateEvent | SystemVariableUpdateEvent)[]
		>([]);

		// Sync state to ref
		useEffect(() => {
			variableUpdateEventsRef.current = variableUpdateEvents;
		}, [variableUpdateEvents]);

		// Initialize variable data
		const getInitVariableData = useCallback(async () => {
			if (isInitializingRef.current || hasInitializedRef.current) {
				return;
			}

			isInitializingRef.current = true;
			try {
				// Fetch data from API
				const initialVariableData = await getStrategyVariables(strategyId);
				const events: (
					| CustomVariableUpdateEvent
					| SystemVariableUpdateEvent
				)[] = [];

				initialVariableData.forEach((variable) => {
					if (isCustomVariable(variable)) {
						events.push({
							channel: "",
							cycleId: 0,
							event: "custom-variable-update-event",
							datetime: new Date().toISOString(),
							nodeId: "",
							nodeName: "",
							outputHandleId: "",
							varOperation: "get",
							customVariable: variable,
						});
					} else if (isSystemVariable(variable)) {
						events.push({
							channel: "",
							cycleId: 0,
							event: "sys-variable-update-event",
							datetime: new Date().toISOString(),
							nodeId: "",
							nodeName: "",
							outputHandleId: "",
							sysVariable: variable,
						});
					}
				});

				setVariableUpdateEvents(events);
				hasInitializedRef.current = true;
			} catch (error) {
				console.warn("Failed to fetch strategy variables", error);
			} finally {
				isInitializingRef.current = false;
			}
		}, [strategyId]);

		// Initialize data
		useEffect(() => {
			getInitVariableData();
		}, [getInitVariableData]);

		// SSE real-time data subscription
		useEffect(() => {
			// Clean up previous subscriptions (if any)
			if (customVariableSubscriptionRef.current) {
				customVariableSubscriptionRef.current.unsubscribe();
				customVariableSubscriptionRef.current = null;
			}

			if (systemVariableSubscriptionRef.current) {
				systemVariableSubscriptionRef.current.unsubscribe();
				systemVariableSubscriptionRef.current = null;
			}

			// Create custom variable stream subscription
			const customVariableStream = createCustomVariableStream(true);
			const customVariableSubscription = customVariableStream.subscribe(
				async (customVariableEvent) => {
					// If list is empty and not initialized, fetch initial data first
					if (
						variableUpdateEventsRef.current.length === 0 &&
						!isInitializingRef.current &&
						!hasInitializedRef.current
					) {
						await getInitVariableData();
					}

					// Then execute normal insert/update logic
					setVariableUpdateEvents((prev) => {
						const newVarName = customVariableEvent.customVariable.varName;
						// Check if data with same varName exists
						const existingIndex = prev.findIndex(
							(event) =>
								isCustomVariableUpdateEvent(event) &&
								event.customVariable.varName === newVarName,
						);

						if (existingIndex !== -1) {
							// Replace existing data
							const newPrev = [...prev];
							newPrev[existingIndex] = customVariableEvent;
							return newPrev;
						} else {
							// If not exists, add new data at the front
							return [customVariableEvent, ...prev];
						}
					});
				},
			);

			customVariableSubscriptionRef.current = customVariableSubscription;

			// Create system variable stream subscription
			const systemVariableStream = createSystemVariableStream(true);
			const systemVariableSubscription = systemVariableStream.subscribe(
				async (systemVariableEvent) => {
					console.log("systemVariableEvent", systemVariableEvent);
					// If list is empty and not initialized, fetch initial data first
					if (
						variableUpdateEventsRef.current.length === 0 &&
						!isInitializingRef.current &&
						!hasInitializedRef.current
					) {
						await getInitVariableData();
					}

					// Then execute normal insert/update logic
					setVariableUpdateEvents((prev) => {
						const newVarName = systemVariableEvent.sysVariable.varName;
						// Check if data with same varName exists
						const existingIndex = prev.findIndex(
							(event) =>
								isSystemVariableUpdateEvent(event) &&
								event.sysVariable.varName === newVarName,
						);

						if (existingIndex !== -1) {
							// Replace existing data
							const newPrev = [...prev];
							newPrev[existingIndex] = systemVariableEvent;
							return newPrev;
						} else {
							// If not exists, add new data at the front
							return [systemVariableEvent, ...prev];
						}
					});
				},
			);
			systemVariableSubscriptionRef.current = systemVariableSubscription;

			return () => {
				customVariableSubscriptionRef.current?.unsubscribe();
				customVariableSubscriptionRef.current = null;
				systemVariableSubscriptionRef.current?.unsubscribe();
				systemVariableSubscriptionRef.current = null;
			};
		}, [getInitVariableData]);

		// Pass event array directly (can fallback to mockData when SSE is unavailable if needed)
		// Keep simplest implementation here: only use real-time and initialized events
		return <VariableTable data={variableUpdateEvents} />;
	},
);

export default StrategyVariable;
