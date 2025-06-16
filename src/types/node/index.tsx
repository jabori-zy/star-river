import { StartNodeData } from "./start-node";
import { KlineNodeData } from "./kline-node";
import { IndicatorNodeData } from "./indicator-node";




export enum NodeType {
    StartNode = "startNode",
    KlineNode = "klineNode",
    IndicatorNode = "indicatorNode",
}




// 所有节点的数据类型的联合类型
export type NodeData = StartNodeData | KlineNodeData | IndicatorNodeData;







