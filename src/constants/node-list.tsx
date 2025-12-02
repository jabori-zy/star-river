import { Hexagon } from "lucide-react";
import { getNodeDefaultColor, getNodeIconName, NodeType } from "@/types/node";
import type { NodeItemProps } from "@/types/nodeCategory";

export const nodeList = [
	{
		title: "node.node",
		icon: Hexagon,
		color:
			"from-[#4776E6]/20 to-[#8E54E9]/20 hover:from-[#4776E6]/30 hover:to-[#8E54E9]/30",
		items: [
			{
				nodeId: "kline_node",
				nodeType: NodeType.KlineNode,
				nodeIcon: getNodeIconName(NodeType.KlineNode),
				nodeIconBackgroundColor: getNodeDefaultColor(NodeType.KlineNode),
				nodeDescription: "获取K线数据",
			} as NodeItemProps,
			{
				nodeId: "indicator_node",
				nodeType: NodeType.IndicatorNode,
				nodeIcon: getNodeIconName(NodeType.IndicatorNode),
				nodeIconBackgroundColor: getNodeDefaultColor(NodeType.IndicatorNode),
				nodeDescription: "技术分析指标",
			} as NodeItemProps,
			{
				nodeId: "if_else_node",
				nodeType: NodeType.IfElseNode,
				nodeIcon: getNodeIconName(NodeType.IfElseNode),
				nodeIconBackgroundColor: getNodeDefaultColor(NodeType.IfElseNode),
				nodeDescription: "条件节点",
			} as NodeItemProps,
			{
				nodeId: "futures_order_node",
				nodeType: NodeType.FuturesOrderNode,
				nodeIcon: getNodeIconName(NodeType.FuturesOrderNode),
				nodeIconBackgroundColor: getNodeDefaultColor(NodeType.FuturesOrderNode),
				nodeDescription: "期货订单节点",
			} as NodeItemProps,
			{
				nodeId: "position_node",
				nodeType: NodeType.PositionNode,
				nodeIcon: getNodeIconName(NodeType.PositionNode),
				nodeIconBackgroundColor: getNodeDefaultColor(NodeType.PositionNode),
				nodeDescription: "仓位管理节点",
			} as NodeItemProps,
			{
				nodeId: "variable_node",
				nodeType: NodeType.VariableNode,
				nodeIcon: getNodeIconName(NodeType.VariableNode),
				nodeIconBackgroundColor: getNodeDefaultColor(NodeType.VariableNode),
				nodeDescription: "变量节点",
			} as NodeItemProps,
		],
	},
];
