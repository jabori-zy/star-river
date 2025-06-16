import { NodeProps } from "@xyflow/react";
import BaseNode from "@/components/flow/base/BaseNode";
import { Play } from "lucide-react";
import { type IndicatorNode } from "@/types/node/indicator-node";
import { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";


const IndicatorNode: React.FC<NodeProps<IndicatorNode>> = ({id, data, selected}) => {
    const nodeName = data?.nodeName || "指标节点";



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