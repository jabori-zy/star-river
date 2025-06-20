import { NodeProps } from "@xyflow/react";
import { type FuturesOrderNode as FuturesOrderNodeType } from "@/types/node/futures-order-node";
import BaseNode from "@/components/flow/base/BaseNode";
import { Position } from "@xyflow/react";
import { Play } from "lucide-react";
import { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import { NodeDefaultInputHandleId } from "@/types/node/index";





const FuturesOrderNode: React.FC<NodeProps<FuturesOrderNodeType>> = ({id, data, selected}) => {
    const nodeName = "Futures Order";

    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            icon={Play}
            selected={selected}
        ></BaseNode>
    )
}

export default FuturesOrderNode;