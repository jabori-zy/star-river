import { createDefaultVariableBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";
import type { VariableNodeData } from "@/types/node/variable-node";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node";
/**
 * Create default variable node data
 */
export const createDefaultVariableNodeData = (
	strategyId: number,
	strategyName: string,
	nodeName: string,
): VariableNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName,
		liveConfig: undefined,
		simulateConfig: undefined,
		backtestConfig: createDefaultVariableBacktestConfig(),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.VariableNode),
			borderColor: getNodeDefaultColor(NodeType.VariableNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.VariableNode),
			handleColor: getNodeDefaultColor(NodeType.VariableNode),
			isHovered: false,
		},
	};
};
