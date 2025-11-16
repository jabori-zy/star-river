import { createDefaultFuturesOrderBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";
import type { FuturesOrderNodeData } from "@/types/node/futures-order-node";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node";
/**
 * Create default futures order node data
 */
export const createDefaultFuturesOrderNodeData = (
	strategyId: number,
	strategyName: string,
	nodeName: string,
): FuturesOrderNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName,
		liveConfig: undefined,
		simulateConfig: undefined,
		backtestConfig: createDefaultFuturesOrderBacktestConfig(),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.FuturesOrderNode),
			borderColor: getNodeDefaultColor(NodeType.FuturesOrderNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.FuturesOrderNode),
			handleColor: getNodeDefaultColor(NodeType.FuturesOrderNode),
			isHovered: false,
		},
	};
};
