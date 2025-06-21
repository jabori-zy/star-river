import { NodeProps } from "@xyflow/react";
import { type PositionManagementNode as PositionManagementNodeType } from "@/types/node/position-management-node";
import BaseNode from "@/components/flow/base/BaseNode";
import { Play } from "lucide-react";


const PositionManagementNode: React.FC<NodeProps<PositionManagementNodeType>> = ({ id, data, selected }) => {
    const nodeName = data.nodeName || "仓位管理节点";

    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            icon={Play}
            selected={selected}
            selectedBorderColor="border-red-400"
        />
    )
}

export default PositionManagementNode;