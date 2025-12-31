import {
	Position,
	type NodeProps,
	useNodesData,
	useStore,
	useReactFlow,
	getConnectedEdges,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Subscription } from "rxjs";
import { CircleOff } from "lucide-react";
import BaseNode from "@/components/flow/base/BaseNode";
import { createBacktestEventTestStream } from "@/hooks/obs/backtest-event-test-obs";
import type { StrategyFlowNode } from "@/types/node/index";
import {
	NodeType,
	getNodeDefaultColor,
	getNodeDefaultInputHandleId,
} from "@/types/node/index";
import type {
	EventTestNode as EventTestNodeType,
	EventTestNodeData,
} from "@/types/node/event-test-node";
import type { ReceivedEventUpdate } from "@/types/strategy-event/event-received-event";
import {
	isReceiveKlineNodeEvent,
	isReceiveIndicatorNodeEvent,
	isReceiveExecuteOverEvent,
	isReceiveTriggerEvent,
	isReceiveIfElseNodeEvent,
	isReceiveOperationGroupEvent,
} from "@/types/strategy-event/event-received-event";
import { ExecuteOverEventShow } from "./components/execute-over-event-show";
import { KlineNodeEventShow } from "./components/kline-node-event-show";
import { IndicatorNodeEventShow } from "./components/indicator-node-event-show";
import { IfElseNodeEventShow } from "./components/if-else-event-show";
import { OperationGroupEventShow } from "./components/operation-group-event-show";

const EventTestNode: React.FC<NodeProps<EventTestNodeType>> = ({
	id,
	selected,
}) => {
	const eventTestNodeData = useNodesData<StrategyFlowNode>(id)
		?.data as EventTestNodeData;
	const { updateNodeData } = useReactFlow();

	const [receivedEvents, setReceivedEvents] = useState<ReceivedEventUpdate[]>(
		[],
	);
	const eventStreamSubscription = useRef<Subscription | null>(null);

	const nodeName = eventTestNodeData.nodeName;
	const handleColor =
		eventTestNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.EventTestNode);

	// Get config values
	const enableReceiveEvent = eventTestNodeData?.enableReceiveEvent ?? false;
	const enableAllEvents = eventTestNodeData?.enableAllEvents ?? false;
	const enableReceiveTriggerEvent =
		eventTestNodeData?.enableReceiveTriggerEvent ?? false;
	const enableReceiveExecuteOverEvent =
		eventTestNodeData?.enableReceiveExecuteOverEvent ?? false;

	// Watch for edge changes and update sourceNodeType, sourceNodeId and sourceHandleId
	const { sourceNodeType, sourceNodeId, sourceHandleId } = useStore((state) => {
		const currentNode = state.nodes.find((n) => n.id === id);
		if (!currentNode) return { sourceNodeType: null, sourceNodeId: null, sourceHandleId: null };

		// Get edges connected to this node as target
		const connectedEdges = getConnectedEdges([currentNode], state.edges);
		const incomingEdge = connectedEdges.find((edge) => edge.target === id);

		if (!incomingEdge) return { sourceNodeType: null, sourceNodeId: null, sourceHandleId: null };

		// Get source node and its type
		const sourceNode = state.nodes.find((n) => n.id === incomingEdge.source);
		if (!sourceNode) return { sourceNodeType: null, sourceNodeId: null, sourceHandleId: null };

		return {
			sourceNodeType: (sourceNode.type as NodeType) || null,
			sourceNodeId: sourceNode.id || null,
			sourceHandleId: incomingEdge.sourceHandle || null,
		};
	});

	// Update node data when sourceNodeType changes
	useEffect(() => {
		const currentSourceNodeType = eventTestNodeData?.sourceNodeType ?? null;
		if (sourceNodeType !== currentSourceNodeType) {
			updateNodeData(id, { sourceNodeType });
		}
	}, [sourceNodeType, id, updateNodeData, eventTestNodeData?.sourceNodeType]);

	// Determine if should receive specific event type based on config
	const shouldReceiveEvent = useCallback(
		(event: ReceivedEventUpdate): boolean => {
			// Check trigger event
			if (enableReceiveTriggerEvent && isReceiveTriggerEvent(event)) {
				return true;
			}
			// Check execute over event
			// For execute over event, must verify that the event comes from the connected source node
			if (enableReceiveExecuteOverEvent && isReceiveExecuteOverEvent(event)) {
				if (sourceNodeId && event.nodeId === sourceNodeId) {
					return true;
				}
				return false;
			}
			return false;
		},
		[enableReceiveTriggerEvent, enableReceiveExecuteOverEvent, sourceNodeId],
	);

	// Subscribe to event test stream
	useEffect(() => {
		// Cleanup previous subscription
		if (eventStreamSubscription.current) {
			eventStreamSubscription.current.unsubscribe();
			eventStreamSubscription.current = null;
		}

		// If sourceNodeType is null, don't subscribe to event stream
		if (sourceNodeType === null) {
			return;
		}

		// If receive event is disabled, don't subscribe
		if (!enableReceiveEvent) {
			return;
		}

		const eventStream = createBacktestEventTestStream(enableReceiveEvent);
		const subscription = eventStream.subscribe((eventUpdate) => {
			// console.log("eventUpdate:", eventUpdate);
			// First, filter by sourceNodeType (highest priority)
			if (sourceNodeType === NodeType.KlineNode) {
				// KlineNode should only receive kline events or execute-over events from itself
				if (isReceiveKlineNodeEvent(eventUpdate)) {
					// Accept kline events
				} else if (isReceiveExecuteOverEvent(eventUpdate) && eventUpdate.nodeId === sourceNodeId) {
					// Accept execute-over events only from the connected kline node
				} else {
					return;
				}
			} else if (sourceNodeType === NodeType.IndicatorNode) {
				// IndicatorNode should only receive indicator events or execute-over events from itself
				if (isReceiveIndicatorNodeEvent(eventUpdate)) {
					// Accept indicator events
				} else if (isReceiveExecuteOverEvent(eventUpdate) && eventUpdate.nodeId === sourceNodeId) {
					// Accept execute-over events only from the connected indicator node
				} else {
					return;
				}
			} else if (sourceNodeType === NodeType.IfElseNode) {
				// IfElseNode should only receive if-else events or execute-over events from itself
				// Note: if-else events will be filtered by caseId inside IfElseNodeEventShow component
				if (isReceiveIfElseNodeEvent(eventUpdate)) {
					// Accept all if-else events, component will filter by sourceHandleId
				} else if (isReceiveExecuteOverEvent(eventUpdate) && eventUpdate.nodeId === sourceNodeId) {
					// Accept execute-over events only from the connected if-else node
				} else {
					return;
				}
			} else if (sourceNodeType === NodeType.OperationGroup) {
				// OperationGroup should only receive operation-group events or execute-over events from itself
				if (isReceiveOperationGroupEvent(eventUpdate)) {
					// Accept operation-group events, component will filter by sourceHandleId
				} else if (isReceiveExecuteOverEvent(eventUpdate) && eventUpdate.nodeId === sourceNodeId) {
					// Accept execute-over events only from the connected operation-group node
				} else {
					return;
				}
			} else {
				// For other node types, reject kline, indicator, if-else and operation-group events
				if (isReceiveKlineNodeEvent(eventUpdate)) {
					return;
				}
				if (isReceiveIndicatorNodeEvent(eventUpdate)) {
					return;
				}
				if (isReceiveIfElseNodeEvent(eventUpdate)) {
					return;
				}
				if (isReceiveOperationGroupEvent(eventUpdate)) {
					return;
				}
				// Accept execute-over and trigger events
			}

			// Then, filter events based on config
			const shouldReceive = enableAllEvents || shouldReceiveEvent(eventUpdate);

			if (shouldReceive) {
				setReceivedEvents((prev) => [eventUpdate, ...prev]);
			}
		});
		eventStreamSubscription.current = subscription;

		return () => {
			// Cleanup subscription when connection is disconnected
			eventStreamSubscription.current?.unsubscribe();
			eventStreamSubscription.current = null;
		};
	}, [sourceNodeType, sourceNodeId, enableReceiveEvent, enableAllEvents, shouldReceiveEvent]);

	// Filter execute over events
	const executeOverEvents = receivedEvents.filter(isReceiveExecuteOverEvent);
	// Filter kline node events
	const klineNodeEvents = receivedEvents.filter(isReceiveKlineNodeEvent);
	// Filter indicator node events
	const indicatorNodeEvents = receivedEvents.filter(isReceiveIndicatorNodeEvent);
	// Filter if-else node events
	const ifElseNodeEvents = receivedEvents.filter(isReceiveIfElseNodeEvent);
	// Filter operation-group node events
	const operationGroupEvents = receivedEvents.filter(isReceiveOperationGroupEvent);

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			iconName={eventTestNodeData.nodeConfig.iconName}
			iconBackgroundColor={eventTestNodeData.nodeConfig.iconBackgroundColor}
			selectedBorderColor={eventTestNodeData.nodeConfig.borderColor}
			selected={selected}
			isHovered={eventTestNodeData.nodeConfig.isHovered}
			className="min-w-0! min-h-0! p-0"
			showTitle={true}
			defaultInputHandle={{
				id: getNodeDefaultInputHandleId(id, NodeType.EventTestNode),
				type: "target",
				position: Position.Left,
				handleColor: handleColor,
				heightPositionClassName: "!top-1/2 !-translate-y-[2px]",
				className: "!left-[-1px]",
			}}
		>

			{/* Disabled indicator when receive event is off */}
			{!enableReceiveEvent && (
				<div className="flex items-center justify-center p-2">
					<CircleOff className="h-5 w-5 text-red-500" />
				</div>
			)}

			{/* Execute Over Events Display */}
			{((enableAllEvents || enableReceiveExecuteOverEvent) && executeOverEvents.length > 0 && sourceNodeType !== NodeType.OperationGroup) && (
				<div className="p-1.5 w-full">
					<ExecuteOverEventShow events={executeOverEvents} />
				</div>
			)}

			{/* Kline Node Events Display */}
			{(enableReceiveEvent && sourceNodeType === NodeType.KlineNode) && (
				<div className="p-1.5 w-full">
					<KlineNodeEventShow events={klineNodeEvents} sourceHandleId={sourceHandleId} />
				</div>
			)}

			{/* Indicator Node Events Display */}
			{(enableReceiveEvent && sourceNodeType === NodeType.IndicatorNode) && (
				<div className="p-1.5 w-full">
					<IndicatorNodeEventShow events={indicatorNodeEvents} sourceHandleId={sourceHandleId} />
				</div>
			)}

			{/* If-Else Node Events Display */}
			{(enableReceiveEvent && sourceNodeType === NodeType.IfElseNode) && (
				<div className="p-1.5 w-full">
					<IfElseNodeEventShow events={ifElseNodeEvents} sourceHandleId={sourceHandleId} />
				</div>
			)}

			{/* Operation Group Events Display */}
			{(enableReceiveEvent && sourceNodeType === NodeType.OperationGroup) && (
				<div className="p-1.5 w-full">
					<OperationGroupEventShow events={operationGroupEvents} sourceHandleId={sourceHandleId} />
				</div>
			)}
		</BaseNode>
	);
};

export default EventTestNode;
