import { createDefaultIfElseBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";
import type { IfElseNodeData } from "@/types/node/if-else-node";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node";
/**
 * Create default if-else node data
 */
export const createDefaultIfElseNodeData = (
	strategyId: number,
	strategyName: string,
	nodeName: string,
	nodeId: string,
): IfElseNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName,
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
