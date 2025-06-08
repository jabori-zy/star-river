import { Boxes, Sigma, ChevronsUpDown } from "lucide-react";
import { NodeItemProps } from "@/types/nodeCategory";

export const nodeCategories = [
    {
      title: "数据输入",
      icon: Boxes,
      color: "from-[#4776E6]/20 to-[#8E54E9]/20 hover:from-[#4776E6]/30 hover:to-[#8E54E9]/30",
      items: [
        {
          nodeId: "kline_node",
          nodeType: "klineNode",
          nodeName: "K线节点",
          nodeDescription: "获取K线数据",
          nodeColor: "from-[#4776E6]/20 to-[#8E54E9]/20 hover:from-[#4776E6]/30 hover:to-[#8E54E9]/30",
        } as NodeItemProps
      ]
    },
    {
      title: "技术指标",
      icon: Sigma,
      color: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
      items: [
        {
          nodeId: "indicator_node",
          nodeType: "indicatorNode",
          nodeName: "指标节点",
          nodeDescription: "技术分析指标",
          nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        } as NodeItemProps
      ]
    },
    {
      title: "条件",
      icon: ChevronsUpDown,
      color: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
      items: [
        {
          nodeId: "if_else_node",
          nodeType: "ifElseNode",
          nodeName: "条件节点",
          nodeDescription: "条件节点",
          nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        } as NodeItemProps
      ]
    },
    {
      title: "买卖操作",
      icon: ChevronsUpDown,
      color: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
      items: [
        {
          nodeId: "order_node",
          nodeType: "orderNode",
          nodeName: "订单节点",
          nodeDescription: "订单节点",
          nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        } as NodeItemProps,
      ]
    },
    {
      title: "仓位管理",
      icon: ChevronsUpDown,
      color: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
      items: [
        {
          nodeId: "position_node",
          nodeType: "positionNode",
          nodeName: "仓位管理节点",
          nodeDescription: "仓位管理节点",
          nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        } as NodeItemProps
      ]
    },
    {
      title: "获取变量节点",
      icon: ChevronsUpDown,
      color: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
      items: [
        {
          nodeId: "get_variable_node",
          nodeType: "getVariableNode",
          nodeName: "获取变量节点",
          nodeDescription: "获取变量节点",
          nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        } as NodeItemProps,
        {
          nodeId: "example_node",
          nodeType: "exampleNode",
          nodeName: "示例节点",
          nodeDescription: "示例节点",
          nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        } as NodeItemProps,

      ]
    },
  ];