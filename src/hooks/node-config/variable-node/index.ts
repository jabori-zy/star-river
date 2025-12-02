import { createDefaultVariableBacktestConfig } from "./use-update-backtest-config";

export { useBacktestConfig } from "./use-update-backtest-config";

import type { TFunction } from "i18next";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import type { VariableNodeData } from "@/types/node/variable-node";
/**
 * Create default variable node data
 */
export const createDefaultVariableNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): VariableNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.variableNode"),
		liveConfig: undefined,
		simulateConfig: undefined,
		backtestConfig: createDefaultVariableBacktestConfig(),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.VariableNode),
			borderColor: getNodeDefaultColor(NodeType.VariableNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.VariableNode),
			handleColor: getNodeDefaultColor(NodeType.VariableNode),
			isHovered: false,
		},
	};
};
