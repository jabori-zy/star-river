
import type { TFunction } from "i18next";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import type { EventTestNodeData } from "@/types/node/event-test-node";

export {
	useEventTestNodeConfig,
	createDefaultEventTestNodeConfig,
} from "./use-update-event-test-node-config";
/**
 * Create default position management node data
 */
export const createDefaultEventTestNodeData = (
	strategyId: number,
	strategyName: string,
	t: TFunction,
): EventTestNodeData => {
	return {
		strategyId,
		strategyName,
		nodeName: t("node.eventTestNode"),
		nodeConfig: {
			iconName: getNodeIconName(NodeType.EventTestNode),
			borderColor: getNodeDefaultColor(NodeType.EventTestNode),
			iconBackgroundColor: getNodeDefaultColor(NodeType.EventTestNode),
			handleColor: getNodeDefaultColor(NodeType.EventTestNode),
			isHovered: false,
		},
        sourceNodeType: null,
        enableReceiveEvent: true,
        enableAllEvents: true,
        enableReceiveTriggerEvent: true,
        enableReceiveExecuteOverEvent: true,
	};
};
