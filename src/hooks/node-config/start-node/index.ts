import { createDefaultBacktestConfig } from "./use-update-backtest-config";

export { useBacktestConfig } from "./use-update-backtest-config";

import type { TFunction } from "i18next";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import type { StartNodeData } from "@/types/node/start-node";
/**
 * Create default start node configuration
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
