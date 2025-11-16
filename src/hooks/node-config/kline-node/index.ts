import { createDefaultKlineBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";
import type { KlineNodeData } from "@/types/node/kline-node";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node";
/**
 * 创建默认的 K线节点数据
 */
export const createDefaultKlineNodeData = (
	strategyId: number,
	strategyName: string,
	nodeName: string,
): KlineNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName,
		liveConfig: undefined,
		simulateConfig: undefined,
		backtestConfig: createDefaultKlineBacktestConfig(),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.KlineNode),
			borderColor: getNodeDefaultColor(NodeType.KlineNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.KlineNode),
			handleColor: getNodeDefaultColor(NodeType.KlineNode),
			isHovered: false,
		},
	};
};
