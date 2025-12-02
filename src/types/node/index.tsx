import type { TFunction } from "i18next";
import type { IconName } from "lucide-react/dynamic";
import type { IfElseNode, IfElseNodeData } from "./if-else-node";
import type { IndicatorNode, IndicatorNodeData } from "./indicator-node";
import type { KlineNode, KlineNodeData } from "./kline-node";
import type { PositionNode, PositionNodeData } from "./position-node";
import type { StartNode, StartNodeData } from "./start-node";
import type { VariableNode, VariableNodeData } from "./variable-node";

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
		default:
			return "";
	}
};

// 节点类型对应的边框颜色（16进制）
export const NodeDefaultColorsMap: Record<NodeType, string> = {
	[NodeType.StartNode]: "#10b981", // 绿色 - 起始节点
	[NodeType.KlineNode]: "#3b82f6", // 蓝色 - K线节点
	[NodeType.IndicatorNode]: "#8b5cf6", // 紫色 - 指标节点
	[NodeType.IfElseNode]: "#f59e0b", // 橙色 - 条件节点
	[NodeType.FuturesOrderNode]: "#0f766e", // 红色 - 期货订单节点
	[NodeType.PositionNode]: "#ec4899", // 粉色 - 持仓管理节点
	[NodeType.VariableNode]: "#06b6d4", // 青色 - 变量节点
};

// 获取节点类型对应的边框颜色
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
	}
};

export const isDefaultInputHandleId = (handleId: string) => {
	// 默认输入出口的handleId格式为：${id}_default_input
	return handleId.endsWith("_default_input");
};

export const isDefaultOutputHandleId = (handleId: string) => {
	// 默认输入出口的handleId格式为：${id}_default_output
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

// 所有节点的数据类型的联合类型
export type NodeData =
	| StartNodeData
	| KlineNodeData
	| IndicatorNodeData
	| IfElseNodeData
	| PositionNodeData
	| VariableNodeData;

export type StrategyFlowNode =
	| StartNode
	| KlineNode
	| IndicatorNode
	| IfElseNode
	| PositionNode
	| VariableNode;

// 节点类型守卫
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
