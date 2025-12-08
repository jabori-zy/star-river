import { createDefaultIndicatorBacktestConfig } from "./use-update-backtest-config";

export { useSyncSourceNode } from "./use-sync-source-node";
export { useSyncTimeRange } from "./use-sync-time-range";
export { useBacktestConfig } from "./use-update-backtest-config";

import type { TFunction } from "i18next";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
/**
 * Create default indicator node data
 */
export const createDefaultIndicatorNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): IndicatorNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.indicatorNode"),
		liveConfig: undefined,
		simulateConfig: undefined,
		backtestConfig: createDefaultIndicatorBacktestConfig(),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.IndicatorNode),
			borderColor: getNodeDefaultColor(NodeType.IndicatorNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.IndicatorNode),
			handleColor: getNodeDefaultColor(NodeType.IndicatorNode),
			isHovered: false,
		},
	};
};
