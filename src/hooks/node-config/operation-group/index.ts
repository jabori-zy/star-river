import type { TFunction } from "i18next";
import type { OperationGroupData } from "@/types/node/group/operation-group";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";

/**
 * Create default operation group node data
 */
export const createDefaultOperationGroupNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): OperationGroupData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.operationGroup"),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.OperationGroup),
			borderColor: getNodeDefaultColor(NodeType.OperationGroup),
			iconBackgroundColor: getNodeDefaultColor(NodeType.OperationGroup),
			handleColor: getNodeDefaultColor(NodeType.OperationGroup),
			isHovered: false,
		},
		inputConfigs: [],
		outputConfigs: [],
		isCollapsed: false,
	};
};

// Re-export hooks
export { useUpdateOpGroupConfig } from "./update-op-group-config";
