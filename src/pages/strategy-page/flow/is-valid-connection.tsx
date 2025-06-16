import { Connection, Edge, Node } from "@xyflow/react";
import { type IsValidConnection } from "@xyflow/react";

const NodeSupportConnectionMap: Record<string, string[]> = {
    startNode: ['klineNode'],
    klineNode: ['indicatorNode'],
}

// 创建一个高阶函数，接收nodes作为参数
export const createValidConnection = (nodes: Node[]): IsValidConnection => {
    return (connection: Connection | Edge) => {
        const sourceNodeId = connection.source
        const targetNodeId = connection.target

        // 从传入的nodes数组中查找节点
        const sourceNode = nodes.find(node => node.id === sourceNodeId)
        const targetNode = nodes.find(node => node.id === targetNodeId)
        // console.log("sourceNode", sourceNode, "targetNode", targetNode)
        if (!sourceNode || !targetNode) {
            return false
        }


        // 判断是否是有效的连接
        // 根据源节点类型查找支持的连接列表
        const supportedConnections = NodeSupportConnectionMap[sourceNode.type!]
        if (supportedConnections && supportedConnections.includes(targetNode.type!)) {
            return true
        }
        return false
    }
}

export default createValidConnection;