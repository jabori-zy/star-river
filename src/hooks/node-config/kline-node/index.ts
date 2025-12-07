import { createDefaultKlineBacktestConfig } from "./use-update-backtest-config";

export { useBacktestConfig } from "./use-update-backtest-config";

import type { TFunction } from "i18next";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import type { KlineNodeData } from "@/types/node/kline-node";
/**
 * Create default Kline node data
 */
export const createDefaultKlineNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): KlineNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.klineNode"),
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
