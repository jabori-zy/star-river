import { StartNodeData } from "./startNode";



export enum NodeType {
    StartNode = "startNode",
    IndicatorNode = "indicatorNode",
}




// 所有节点的数据类型的联合类型
export type NodeData = StartNodeData;







