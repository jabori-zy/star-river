import type { TFunction } from "i18next";
import type { OperationNodeData } from "@/types/node/operation-node";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";

export const createDefaultOperationNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): OperationNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.operationNode"),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.OperationNode),
			borderColor: getNodeDefaultColor(NodeType.OperationNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.OperationNode),
			handleColor: getNodeDefaultColor(NodeType.OperationNode),
			isHovered: false,
		},
		inputArrayType: "Unary",
		operation: { type: "Mean" },
		inputConfig: null,
		outputConfig: null,
		windowConfig: {
			windowSize: 10,
			windowType: "rolling",
		},
		fillingMethod: "FFill",
	};
};
