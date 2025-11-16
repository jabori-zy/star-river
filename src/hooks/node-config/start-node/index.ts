import {createDefaultBacktestConfig} from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";
import type { StartNodeData } from "@/types/node/start-node";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node";
import type { TFunction } from "i18next";
/**
 * 创建默认的开始节点配置
 */
export const createDefaultStartNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): StartNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.startNode"),
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
