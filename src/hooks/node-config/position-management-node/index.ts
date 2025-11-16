import { createDefaultPositionBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";
import type { PositionManagementNodeData } from "@/types/node/position-management-node";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node";
/**
 * Create default position management node data
 */
export const createDefaultPositionManagementNodeData = (
	strategyId: number,
	strategyName: string,
	nodeName: string,
): PositionManagementNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName,
		liveConfig: undefined,
		simulateConfig: undefined,
		backtestConfig: createDefaultPositionBacktestConfig(),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.PositionManagementNode),
			borderColor: getNodeDefaultColor(NodeType.PositionManagementNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.PositionManagementNode),
			handleColor: getNodeDefaultColor(NodeType.PositionManagementNode),
			isHovered: false,
		},
	};
};
