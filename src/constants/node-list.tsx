import { Hexagon} from "lucide-react";
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
				nodeType: "klineNode",
				nodeName: "node.klineNode",
				nodeDescription: "获取K线数据",
				nodeColor:
					"from-[#4776E6]/20 to-[#8E54E9]/20 hover:from-[#4776E6]/30 hover:to-[#8E54E9]/30",
			} as NodeItemProps,
			{
				nodeId: "indicator_node",
				nodeType: "indicatorNode",
				nodeName: "node.indicatorNode",
				nodeDescription: "技术分析指标",
				nodeColor:
					"from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
			} as NodeItemProps,
			{
				nodeId: "if_else_node",
				nodeType: "ifElseNode",
				nodeName: "node.ifElseNode",
				nodeDescription: "条件节点",
				nodeColor:
					"from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
			} as NodeItemProps,
			{
				nodeId: "futures_order_node",
				nodeType: "futuresOrderNode",
				nodeName: "node.futuresOrderNode",
				nodeDescription: "期货订单节点",
				nodeColor:
					"from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
			} as NodeItemProps,
			{
				nodeId: "position_management_node",
				nodeType: "positionManagementNode",
				nodeName: "node.positionManagementNode",
				nodeDescription: "仓位管理节点",
				nodeColor:
					"from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
			} as NodeItemProps,
			{
				nodeId: "variable_node",
				nodeType: "variableNode",
				nodeName: "node.variableNode",
				nodeDescription: "变量节点",
				nodeColor:
					"from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
			} as NodeItemProps,

		],
	},
];
