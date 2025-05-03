import { Boxes, Sigma, ChevronsUpDown } from "lucide-react";
import { NodeItemProps } from "@/types/nodeCategory";

export const nodeCategories = [
    {
      title: "数据输入",
      icon: Boxes,
      color: "from-[#4776E6]/20 to-[#8E54E9]/20 hover:from-[#4776E6]/30 hover:to-[#8E54E9]/30",
      items: [
        {
          nodeId: "live_data_node",
          nodeType: "liveDataNode",
          nodeName: "实时数据",
          nodeDescription: "实时数据流",
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
          nodeName: "技术指标",
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
          nodeName: "条件",
          nodeDescription: "条件",
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

        {
          nodeId: "get_position_number_node",
          nodeType: "getPositionNumberNode",
          nodeName: "获取仓位数量节点",
          nodeDescription: "获取仓位数量节点",
          nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        } as NodeItemProps
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
          nodeName: "仓位管理",
          nodeDescription: "仓位管理",
          nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        } as NodeItemProps
      ]
    }
    
  
  ];