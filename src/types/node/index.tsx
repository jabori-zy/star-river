import { StartNodeData } from "./start-node";
import { KlineNodeData } from "./kline-node";
import { IndicatorNodeData } from "./indicator-node";
import { IfElseNodeData } from "./if-else-node";




export enum NodeType {
    StartNode = "startNode",
    KlineNode = "klineNode",
    IndicatorNode = "indicatorNode",
    IfElseNode = "ifElseNode",
    FuturesOrderNode = "futuresOrderNode",
}


export enum NodeDefaultInputHandleId {
    StartNodeInput = 'start_node_input',
    KlineNodeInput = 'kline_node_input',
    IndicatorNodeInput = 'indicator_node_input',
    IfElseNodeInput = 'if_else_node_input'
}

export enum NodeDefaultOutputHandleId {
    StartNodeOutput = 'start_node_output',
    KlineNodeOutput = 'kline_node_output',
    IndicatorNodeOutput = 'indicator_node_output',
    IfElseNodeOutput = 'if_else_node_else_output',
}




// 所有节点的数据类型的联合类型
export type NodeData = StartNodeData | KlineNodeData | IndicatorNodeData | IfElseNodeData;







