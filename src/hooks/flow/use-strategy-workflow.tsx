import { useReactFlow,IsValidConnection,Connection,Edge } from "@xyflow/react"
import { NodeType } from "@/types/node/index"



const NodeSupportConnectionMap: Record<NodeType, NodeType[]> = {
    [NodeType.StartNode]: [NodeType.KlineNode,NodeType.IfElseNode,NodeType.VariableNode],
    [NodeType.KlineNode]: [NodeType.IndicatorNode,NodeType.IfElseNode, NodeType.VariableNode],
    [NodeType.IndicatorNode]: [NodeType.IfElseNode, NodeType.VariableNode],
    [NodeType.IfElseNode]: [NodeType.FuturesOrderNode, NodeType.VariableNode],
    [NodeType.FuturesOrderNode]: [NodeType.IfElseNode,NodeType.PositionManagementNode, NodeType.VariableNode],
    [NodeType.PositionManagementNode]: [NodeType.IfElseNode, NodeType.VariableNode],
    [NodeType.VariableNode]: [NodeType.IfElseNode],
}

const NodeSupportConnectionLimit: Record<NodeType, number> = {
    [NodeType.StartNode]: 0,
    [NodeType.KlineNode]: 1,
    [NodeType.IndicatorNode]: 1,
    [NodeType.IfElseNode]: -1, // -1代表不限制
    [NodeType.FuturesOrderNode]: -1,
    [NodeType.PositionManagementNode]: -1,
    [NodeType.VariableNode]: -1,
}


const useStrategyWorkflow = () => {

    // 获取节点
    const {getNode, getNodeConnections} = useReactFlow()

    // 检查是否是有效连接
    const checkIsValidConnection: IsValidConnection = (connection: Connection | Edge): boolean => {
        const sourceNodeId = connection.source
        const targetNodeId = connection.target
        // console.log("sourceNodeId", sourceNodeId, "targetNodeId", targetNodeId)

        // 从传入的nodes数组中查找节点
        const sourceNode = getNode(sourceNodeId)
        const targetNode = getNode(targetNodeId)
        // console.log("sourceNode", sourceNode, "targetNode", targetNode)
        
        
        if (!sourceNode || !targetNode) {
            return false
        }

        // 判断是否是有效的连接
        // 根据源节点类型查找支持的连接列表
        const supportedConnections = NodeSupportConnectionMap[sourceNode.type as NodeType]
        // 如果，被连接的节点类型，在支持的连接列表中，则返回true
        if (supportedConnections && supportedConnections.includes(targetNode.type as NodeType)) {
            // 获取被连接的节点
            const targetNodeConnections = getNodeConnections({nodeId: targetNodeId})
            // 获取被连接的节点支持的连接数量
            const targetNodeSupportConnectionLimit = NodeSupportConnectionLimit[targetNode.type as NodeType]
            // 如果被连接的节点支持的连接数量大于0，则返回true
            if (targetNodeSupportConnectionLimit === -1) {
                return true
            }
            if (targetNodeSupportConnectionLimit > targetNodeConnections.length) {
                return true
            }
        }
        return false
    }


    return {
        checkIsValidConnection
    }



}


export default useStrategyWorkflow;