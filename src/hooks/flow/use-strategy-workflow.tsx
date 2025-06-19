import { useReactFlow,IsValidConnection,Connection,Edge } from "@xyflow/react"
import { NodeType } from "@/types/node/index"



const NodeSupportConnectionMap: Record<NodeType, NodeType[]> = {
    [NodeType.StartNode]: [NodeType.KlineNode,NodeType.IfElseNode],
    [NodeType.KlineNode]: [NodeType.IndicatorNode,NodeType.IfElseNode],
    [NodeType.IndicatorNode]: [NodeType.IfElseNode],
    [NodeType.IfElseNode]: [],
}


const useStrategyWorkflow = () => {

    const {getNode} = useReactFlow()


    const checkIsValidConnection: IsValidConnection = (connection: Connection | Edge): boolean => {
        const sourceNodeId = connection.source
        const targetNodeId = connection.target

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
        if (supportedConnections && supportedConnections.includes(targetNode.type as NodeType)) {
            return true
        }
        return true
    }


    return {
        checkIsValidConnection
    }



}


export default useStrategyWorkflow;