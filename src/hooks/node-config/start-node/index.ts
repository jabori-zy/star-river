import {createDefaultBacktestConfig} from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";
import type { StartNodeData } from "@/types/node/start-node";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node";
/**
 * 创建默认的开始节点配置
 */
export const createDefaultStartNodeData = (
	strategyId: number,
	strategyName: string,
	nodeName: string,
): StartNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName,
		liveConfig: null,
		simulateConfig: null,
		backtestConfig: createDefaultBacktestConfig(),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.StartNode),
			borderColor: getNodeDefaultColor(NodeType.StartNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.StartNode),
			handleColor: getNodeDefaultColor(NodeType.StartNode),
			isHovered: false,
		},
	};
};