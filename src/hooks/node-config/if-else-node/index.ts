import { createDefaultIfElseBacktestConfig } from "./use-update-backtest-config";

export { useSyncSourceNode } from "./use-sync-source-node";
export { useBacktestConfig } from "./use-update-backtest-config";

import { useReactFlow } from "@xyflow/react";
import type { TFunction } from "i18next";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import type { IfElseNodeData } from "@/types/node/if-else-node";

/**
 * Hook to update isNested property of if-else node
 *
 * @param id - If-else node ID
 * @returns Current isNested value and update function
 */
export const useUpdateIsNested = ({ id }: { id: string }) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as IfElseNodeData;
	const isNested = nodeData?.isNested ?? false;

	/**
	 * Update isNested property
	 * @param value - New isNested value
	 */
	const updateIsNested = useCallback(
		(value: boolean) => {
			updateNodeData(id, { isNested: value });
		},
		[id, updateNodeData],
	);

	return { isNested, updateIsNested };
};

/**
 * Create default if-else node data
 */
export const createDefaultIfElseNodeData = (
	strategyId: number,
	strategyName: string,
	nodeId: string,
	t: TFunction,
): IfElseNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.ifElseNode"),
		isNested: false,
		liveConfig: undefined,
		simulateConfig: undefined,
		backtestConfig: createDefaultIfElseBacktestConfig(nodeId),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.IfElseNode),
			borderColor: getNodeDefaultColor(NodeType.IfElseNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.IfElseNode),
			handleColor: getNodeDefaultColor(NodeType.IfElseNode),
			isHovered: false,
		},
	};
};
