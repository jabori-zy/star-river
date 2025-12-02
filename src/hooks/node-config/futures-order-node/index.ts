import { createDefaultFuturesOrderBacktestConfig } from "./use-update-backtest-config";

export { useBacktestConfig } from "./use-update-backtest-config";

import type { TFunction } from "i18next";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import type { FuturesOrderNodeData } from "@/types/node/futures-order-node";
/**
 * Create default futures order node data
 */
export const createDefaultFuturesOrderNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): FuturesOrderNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.futuresOrderNode"),
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
