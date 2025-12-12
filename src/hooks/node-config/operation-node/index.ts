import type { TFunction } from "i18next";
import type { OperationNodeData } from "@/types/node/operation-node";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import { getOperationMeta } from "@/types/operation/operation-meta";

export const createDefaultOperationNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): OperationNodeData => {
	// Default operation is Mean with Unary input
	const defaultOperation = { type: "Mean" as const };
	const defaultInputArrayType = "Unary" as const;
	const meta = getOperationMeta(defaultOperation.type, defaultInputArrayType);
	const outputType = meta?.output ?? "Series";
	const displayName = meta?.defaultOutputDisplayName ?? defaultOperation.type;

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
		inputArrayType: defaultInputArrayType,
		operation: defaultOperation,
		inputConfig: null,
		outputConfig: outputType === "Series"
			? {
				type: "Series",
				outputHandleId: "default_output",
				seriesDisplayName: displayName,
			}
			: {
				type: "Scalar",
				outputHandleId: "default_output",
				scalarDisplayName: displayName,
			},
		windowConfig: {
			windowSize: 10,
			windowType: "rolling",
		},
		fillingMethod: "FFill",
	};
};
