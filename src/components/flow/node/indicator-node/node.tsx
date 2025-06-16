import { NodeProps } from "@xyflow/react";
import BaseNode from "@/components/flow/base/BaseNode";
import { Play } from "lucide-react";
import { type IndicatorNode } from "@/types/node/indicator-node";
import { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { useNodeConnections } from "@xyflow/react";
import { useEffect } from "react";
import { KlineNodeData } from "@/types/node/kline-node";
import { useReactFlow } from "@xyflow/react";
const IndicatorNode: React.FC<NodeProps<IndicatorNode>> = ({id, data, selected}) => {
    const nodeName = data?.nodeName || "指标节点";
    const { getNode } = useReactFlow()

    const connections = useNodeConnections({id})

    useEffect(() => {
        if (connections.length === 1) {
            // 获取kline节点id
            const klineNodeId = connections[0].source
            const klineNode = getNode(klineNodeId)
            if (klineNode) {
                const klineNodeData = klineNode.data as KlineNodeData
                const klineNodeLiveConfig = klineNodeData.liveConfig
            }
        }
    }, [connections])



    const defaultInputHandle: BaseHandleProps = {
        id: 'kline_node_input',
        type: 'target',
        position: Position.Left,
        handleColor: '!bg-red-400',
    }

    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            icon={Play}
            selected={selected}
            defaultInputHandle={defaultInputHandle}
        />
    )
}


export default IndicatorNode;