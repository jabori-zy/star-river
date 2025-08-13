import type { IfElseNodeData } from "./if-else-node";
import type { IndicatorNodeData } from "./indicator-node";
import type { KlineNodeData } from "./kline-node";
import type { PositionManagementNodeData } from "./position-management-node";
import type { StartNodeData } from "./start-node";


export type NodeId = string;

export enum NodeType {
	StartNode = "startNode",
	KlineNode = "klineNode",
	IndicatorNode = "indicatorNode",
	IfElseNode = "ifElseNode",
	FuturesOrderNode = "futuresOrderNode",
	PositionManagementNode = "positionManagementNode",
	VariableNode = "variableNode",
}

export const getNodeDefaultInputHandleId = (id: string, nodeType: NodeType) => {
	switch (nodeType) {
		case NodeType.IndicatorNode:
			return `${id}_default_input`;
		case NodeType.IfElseNode:
			return `${id}_default_input`;
		case NodeType.FuturesOrderNode:
			return `${id}_default_input`;
		case NodeType.PositionManagementNode:
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
	id: string,
	nodeType: NodeType,
) => {
	switch (nodeType) {
		case NodeType.IndicatorNode:
			return `${id}_default_output`;
		case NodeType.IfElseNode:
			return `${id}_default_output`;
		case NodeType.FuturesOrderNode:
			return `${id}_default_output`;
		case NodeType.PositionManagementNode:
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

// 所有节点的数据类型的联合类型
export type NodeData =
	| StartNodeData
	| KlineNodeData
	| IndicatorNodeData
	| IfElseNodeData
	| PositionManagementNodeData;
