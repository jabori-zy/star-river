import type { TFunction } from "i18next";
import type { IconName } from "lucide-react/dynamic";
import { z } from "zod";
import type { IfElseNode, IfElseNodeData } from "./if-else-node";
import type { IndicatorNode, IndicatorNodeData } from "./indicator-node";
import type { KlineNode, KlineNodeData } from "./kline-node";
import type { PositionNode, PositionNodeData } from "./position-node";
import type { StartNode, StartNodeData } from "./start-node";
import type { VariableNode, VariableNodeData } from "./variable-node";
import type { OperationGroup, OperationGroupData } from "./group/operation-group";
import type { OperationStartNode, OperationStartNodeData } from "./group/operation-group/operation-start-node";
import type { OperationEndNode, OperationEndNodeData } from "./group/operation-group/operation-end-node";
import type { OperationNode, OperationNodeData } from "./operation-node";

export type NodeId = string;
export type NodeName = string;

export enum NodeType {
	StartNode = "startNode",
	KlineNode = "klineNode",
	IndicatorNode = "indicatorNode",
	IfElseNode = "ifElseNode",
	FuturesOrderNode = "futuresOrderNode",
	PositionNode = "positionNode",
	VariableNode = "variableNode",
	OperationGroup = "operationGroup", // operation group: to group operation nodes
	OperationStartNode = "operationStartNode", // operation start node
	OperationEndNode = "operationEndNode", // operation end node
	OperationNode = "operationNode", // operation node
	// LogicGroup = "logicGroup",
}

export const getNodeTypeName = (nodeType: NodeType, t: TFunction): string => {
	switch (nodeType) {
		case NodeType.StartNode:
			return t("node.startNode");
		case NodeType.KlineNode:
			return t("node.klineNode");
		case NodeType.IndicatorNode:
			return t("node.indicatorNode");
		case NodeType.IfElseNode:
			return t("node.ifElseNode");
		case NodeType.FuturesOrderNode:
			return t("node.futuresOrderNode");
		case NodeType.PositionNode:
			return t("node.positionNode");
		case NodeType.VariableNode:
			return t("node.variableNode");
		case NodeType.OperationGroup:
			return t("node.operationGroup");
		case NodeType.OperationStartNode:
			return t("node.operationStartNode");
		case NodeType.OperationEndNode:
			return t("node.operationEndNode");
		case NodeType.OperationNode:
			return t("node.operationNode");
		default:
			return "";
	}
};

// Node type corresponding border color (hexadecimal)
export const NodeDefaultColorsMap: Record<NodeType, string> = {
	[NodeType.StartNode]: "#10b981", // Green - Start node
	[NodeType.KlineNode]: "#3b82f6", // Blue - Kline node
	[NodeType.IndicatorNode]: "#8b5cf6", // Purple - Indicator node
	[NodeType.IfElseNode]: "#f59e0b", // Orange - Conditional node
	[NodeType.FuturesOrderNode]: "#0f766e", // Red - Futures order node
	[NodeType.PositionNode]: "#ec4899", // Pink - Position management node
	[NodeType.VariableNode]: "#06b6d4", // Cyan - Variable node
	[NodeType.OperationGroup]: "#a21caf", // Fuchsia - Operation group
	[NodeType.OperationStartNode]: "#7c3aed", // Violet - Operation start node
	[NodeType.OperationEndNode]: "#dc2626", // Red - Operation end node
	[NodeType.OperationNode]: "#ea580c", // Orange - Operation node
};

// Get the border color corresponding to the node type
export const getNodeDefaultColor = (nodeType: NodeType): string => {
	return NodeDefaultColorsMap[nodeType];
};

export const NodeIconsMap: Record<NodeType, IconName> = {
	[NodeType.StartNode]: "play",
	[NodeType.KlineNode]: "chart-candlestick",
	[NodeType.IndicatorNode]: "chart-line",
	[NodeType.IfElseNode]: "git-branch",
	[NodeType.FuturesOrderNode]: "shopping-cart",
	[NodeType.PositionNode]: "wallet",
	[NodeType.VariableNode]: "variable",
	[NodeType.OperationGroup]: "group",
	[NodeType.OperationStartNode]: "play",
	[NodeType.OperationEndNode]: "play",
	[NodeType.OperationNode]: "square-function",
};

export const getNodeIconName = (nodeType: NodeType): IconName => {
	return NodeIconsMap[nodeType];
};

export const getNodeDefaultInputHandleId = (id: NodeId, nodeType: NodeType) => {
	switch (nodeType) {
		case NodeType.IndicatorNode:
			return `${id}_default_input`;
		case NodeType.IfElseNode:
			return `${id}_default_input`;
		case NodeType.FuturesOrderNode:
			return `${id}_default_input`;
		case NodeType.PositionNode:
			return `${id}_default_input`;
		case NodeType.VariableNode:
			return `${id}_default_input`;
		case NodeType.KlineNode:
			return `${id}_default_input`;
		case NodeType.StartNode:
			return `${id}_default_input`;
		case NodeType.OperationStartNode:
			return `${id}_default_input`;
		case NodeType.OperationEndNode:
			return `${id}_default_input`;
		case NodeType.OperationNode:
			return `${id}_default_input`;
		case NodeType.OperationGroup:
			return `${id}_default_input`;
	}
};

export const getNodeDefaultOutputHandleId = (
	id: NodeId,
	nodeType: NodeType,
) => {
	switch (nodeType) {
		case NodeType.IndicatorNode:
			return `${id}_default_output`;
		case NodeType.IfElseNode:
			return `${id}_default_output`;
		case NodeType.FuturesOrderNode:
			return `${id}_default_output`;
		case NodeType.PositionNode:
			return `${id}_default_output`;
		case NodeType.VariableNode:
			return `${id}_default_output`;
		case NodeType.KlineNode:
			return `${id}_default_output`;
		case NodeType.StartNode:
			return `${id}_default_output`;
		case NodeType.OperationStartNode:
			return `${id}_default_output`;
		case NodeType.OperationEndNode:
			return `${id}_default_output`;
		case NodeType.OperationNode:
			return `${id}_default_output`;
		case NodeType.OperationGroup:
			return `${id}_default_output`;
	}
};

export const isDefaultInputHandleId = (handleId: string) => {
	// Default input handle id format: ${id}_default_input
	return handleId.endsWith("_default_input");
};

export const isDefaultOutputHandleId = (handleId: string) => {
	// Default output handle id format: ${id}_default_output
	return handleId.endsWith("_default_output");
};

export type NodeDataBase = {
	strategyId: number;
	strategyName: string;
	nodeName: string;
	nodeConfig: {
		iconName: IconName; // lucide-react icon name (e.g., "chart-candlestick")
		borderColor: string;
		iconBackgroundColor: string;
		handleColor: string;
		isHovered?: boolean; // is hovered
	};
};

// Node config schema (Zod version)
export const NodeConfigSchema = z.object({
	iconName: z.string(), // lucide-react icon name (e.g., "chart-candlestick")
	borderColor: z.string(),
	iconBackgroundColor: z.string(),
	handleColor: z.string(),
	isHovered: z.boolean().optional(),
});

// Node data base schema (Zod version)
export const NodeDataBaseSchema = z.object({
	strategyId: z.number(),
	strategyName: z.string(),
	nodeName: z.string(),
	nodeConfig: NodeConfigSchema,
});

// Union type of all node data types
export type NodeData =
	| StartNodeData
	| KlineNodeData
	| IndicatorNodeData
	| IfElseNodeData
	| PositionNodeData
	| VariableNodeData
	| OperationGroupData
	| OperationStartNodeData
	| OperationEndNodeData
	| OperationNodeData;

export type StrategyFlowNode =
	| StartNode
	| KlineNode
	| IndicatorNode
	| IfElseNode
	| PositionNode
	| VariableNode
	| OperationGroup
	| OperationStartNode
	| OperationEndNode
	| OperationNode;

// Node type guards
export const isStartNode = (node: StrategyFlowNode): node is StartNode => {
	return node.type === NodeType.StartNode;
};
export const isKlineNode = (
	node: StrategyFlowNode | Pick<StrategyFlowNode, "type">,
): node is KlineNode => {
	return node.type === NodeType.KlineNode;
};
export const isIndicatorNode = (
	node: StrategyFlowNode,
): node is IndicatorNode => {
	return node.type === NodeType.IndicatorNode;
};
export const isIfElseNode = (node: StrategyFlowNode): node is IfElseNode => {
	return node.type === NodeType.IfElseNode;
};
export const isPositionNode = (
	node: StrategyFlowNode,
): node is PositionNode => {
	return node.type === NodeType.PositionNode;
};
