import { createDefaultPositionBacktestConfig } from "./use-update-backtest-config";

export { useBacktestConfig } from "./use-update-backtest-config";

import type { TFunction } from "i18next";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import type { PositionNodeData } from "@/types/node/position-node";
/**
 * Create default position management node data
 */
export const createDefaultPositionNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): PositionNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.positionNode"),
		liveConfig: undefined,
		simulateConfig: undefined,
		backtestConfig: createDefaultPositionBacktestConfig(),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.PositionNode),
			borderColor: getNodeDefaultColor(NodeType.PositionNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.PositionNode),
			handleColor: getNodeDefaultColor(NodeType.PositionNode),
			isHovered: false,
		},
	};
};
