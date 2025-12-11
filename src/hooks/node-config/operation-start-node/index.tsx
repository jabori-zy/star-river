import type { TFunction } from "i18next";
import type { OperationStartNodeData } from "@/types/node/group/operation-group/operation-start-node";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";




export const createDefaultOperationStartNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): OperationStartNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.operationStartNode"),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.OperationStartNode),
			borderColor: getNodeDefaultColor(NodeType.OperationStartNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.OperationStartNode),
			handleColor: getNodeDefaultColor(NodeType.OperationStartNode),
			isHovered: false,
		},
	};
};

