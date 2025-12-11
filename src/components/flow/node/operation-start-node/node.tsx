import type { NodeProps } from "@xyflow/react";

import type { OperationStartNode as OperationStartNodeType, OperationStartNodeData } from "@/types/node/group/operation-group/operation-start-node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import BaseNode from "@/components/flow/base/BaseNode";
import BaseHandle, { type BaseHandleProps } from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { getNodeDefaultColor, getNodeDefaultInputHandleId, getNodeDefaultOutputHandleId } from "@/types/node/index";
import { NodeType } from "@/types/node/index";
import {Plug} from "lucide-react";



const OperationStartNode: React.FC<NodeProps<OperationStartNodeType>> = ({
	id,
	selected,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const operationStartNodeData = getNodeData(id) as OperationStartNodeData;
	const nodeName = operationStartNodeData.nodeName || "Operation Start Node";
    const handleColor =
		operationStartNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.OperationStartNode);
	



    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            iconName={operationStartNodeData.nodeConfig.iconName}
            iconBackgroundColor={operationStartNodeData.nodeConfig.iconBackgroundColor}
            selectedBorderColor={operationStartNodeData.nodeConfig.borderColor}
            selected={selected}
            isHovered={operationStartNodeData.nodeConfig.isHovered}
            className="!w-16 !h-16 !min-w-0 !min-h-0 !p-0 flex items-center justify-center"
            showTitle={false}
        >
            <div className="flex items-center justify-center rounded-full p-2" style={{ backgroundColor: handleColor }}>
                <Plug className="w-6 h-6 text-white" />
            </div>
            <BaseHandle
				id={getNodeDefaultOutputHandleId(id, NodeType.OperationStartNode)}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				heightPositionClassName="!top-1/2 !-translate-y-[2px]"
				className="!right-[-1px]"
			/>
        </BaseNode>
    );
};

export default OperationStartNode;