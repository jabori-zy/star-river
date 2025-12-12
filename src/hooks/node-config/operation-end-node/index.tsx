import type { TFunction } from "i18next";
import type { OperationEndNodeData } from "@/types/node/group/operation-group/operation-end-node";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";




export const createDefaultOperationEndNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): OperationEndNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.operationEndNode"),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.OperationEndNode),
			borderColor: getNodeDefaultColor(NodeType.OperationEndNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.OperationEndNode),
			handleColor: getNodeDefaultColor(NodeType.OperationEndNode),
			isHovered: false,
		},
	};
};

