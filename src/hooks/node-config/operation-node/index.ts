import type { TFunction } from "i18next";
import type { OperationNodeData } from "@/types/node/operation-node";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";

export { useUpdateOpNodeConfig } from "./update-op-node-config";
export { useSyncSourceNode } from "./use-sync-source-node";

export const createDefaultOperationNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): OperationNodeData => {
	// Default operation is Mean with Unary input
	const defaultOperation = { type: "Mean" as const };
	const defaultInputArrayType = "Unary" as const;

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
		outputConfig:  null,
	};
};
