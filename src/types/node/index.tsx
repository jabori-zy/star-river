import { StartNodeData } from "./start-node";
import { KlineNodeData } from "./kline-node";
import { IndicatorNodeData } from "./indicator-node";
import { IfElseNodeData } from "./if-else-node";
import { PositionManagementNodeData } from "./position-management-node";




export enum NodeType {
    StartNode = "startNode",
    KlineNode = "klineNode",
    IndicatorNode = "indicatorNode",
    IfElseNode = "ifElseNode",
    FuturesOrderNode = "futuresOrderNode",
    PositionManagementNode = "positionManagementNode",
    VariableNode = "variableNode",
}

// 默认入口
export enum NodeDefaultInputHandleId {
    KlineNodeInput = 'kline_node_default_input',
    IndicatorNodeInput = 'indicator_node_default_input',
    IfElseNodeInput = 'if_else_node_default_input'
}

// 默认出口
export enum NodeDefaultOutputHandleId {
    StartNodeOutput = 'start_node_default_output',
    KlineNodeOutput = 'kline_node_default_output',
    IndicatorNodeOutput = 'indicator_node_default_output',
    IfElseNodeOutput = 'if_else_node_else_output', // 将else作为默认出口
}




// 所有节点的数据类型的联合类型
export type NodeData = StartNodeData | KlineNodeData | IndicatorNodeData | IfElseNodeData | PositionManagementNodeData;







