import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { EventTestNodeData } from "@/types/node/event-test-node";

/**
 * Event test node specific configuration
 */
export type EventTestNodeConfig = Pick<
	EventTestNodeData,
	| "enableReceiveEvent"
	| "enableAllEvents"
	| "enableReceiveTriggerEvent"
	| "enableReceiveExecuteOverEvent"
>;

/**
 * Create default event test node configuration
 */
export const createDefaultEventTestNodeConfig = (): EventTestNodeConfig => {
	return {
		enableReceiveEvent: false,
		enableAllEvents: false,
		enableReceiveTriggerEvent: false,
		enableReceiveExecuteOverEvent: false,
	};
};

interface UseEventTestNodeConfigProps {
	id: string; // Node ID
}

export const useEventTestNodeConfig = ({
	id,
}: UseEventTestNodeConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as EventTestNodeData | undefined;

	// ==================== Basic Configuration Update ====================

	const setDefaultEventTestNodeConfig = useCallback(() => {
		const defaultConfig = createDefaultEventTestNodeConfig();
		updateNodeData(id, defaultConfig);
	}, [id, updateNodeData]);

	const updateEnableReceiveEvent = useCallback(
		(enableReceiveEvent: boolean) => {
			updateNodeData(id, { enableReceiveEvent });
		},
		[id, updateNodeData],
	);

	const updateEnableAllEvents = useCallback(
		(enableAllEvents: boolean) => {
			updateNodeData(id, { enableAllEvents });
		},
		[id, updateNodeData],
	);

	const updateEnableReceiveTriggerEvent = useCallback(
		(enableReceiveTriggerEvent: boolean) => {
			updateNodeData(id, { enableReceiveTriggerEvent });
		},
		[id, updateNodeData],
	);

	const updateEnableReceiveExecuteOverEvent = useCallback(
		(enableReceiveExecuteOverEvent: boolean) => {
			updateNodeData(id, { enableReceiveExecuteOverEvent });
		},
		[id, updateNodeData],
	);

	return {
		nodeData,
		setDefaultEventTestNodeConfig,
		updateEnableReceiveEvent,
		updateEnableAllEvents,
		updateEnableReceiveTriggerEvent,
		updateEnableReceiveExecuteOverEvent,
	};
};
