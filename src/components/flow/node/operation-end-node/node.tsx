import type { NodeProps } from "@xyflow/react";
import { useEffect } from "react";
import type { OperationEndNode as OperationEndNodeType, OperationEndNodeData } from "@/types/node/group/operation-group/operation-end-node";
import BaseNode from "@/components/flow/base/BaseNode";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { getNodeDefaultColor, getNodeDefaultInputHandleId } from "@/types/node/index";
import { NodeType } from "@/types/node/index";
import {MoveRight} from "lucide-react";
import { useNodesData, useReactFlow } from "@xyflow/react";
import type { StrategyFlowNode } from "@/types/node/index";
import type { OperationGroupData } from "@/types/node/group/operation-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";



const OperationEndNode: React.FC<NodeProps<OperationEndNodeType>> = ({
	id,
	selected,
    parentId
}) => {

    const { updateNodeData } = useReactFlow();
    const operationEndNodeData = useNodesData<StrategyFlowNode>(id)?.data as OperationEndNodeData;

    const parentNodeData = useNodesData<StrategyFlowNode>(parentId ?? "")?.data as OperationGroupData | undefined;
	const nodeName = `${parentNodeData?.nodeName} End Node`;
    const handleColor =
		operationEndNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.OperationEndNode);

    useEffect(() => {
        if (!nodeName) return;
        updateNodeData(id, {
            nodeName: nodeName,
        });
    }, [nodeName, id, updateNodeData]);
	



    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            iconName={operationEndNodeData.nodeConfig.iconName}
            iconBackgroundColor={operationEndNodeData.nodeConfig.iconBackgroundColor}
            selectedBorderColor={operationEndNodeData.nodeConfig.borderColor}
            selected={selected}
            isHovered={operationEndNodeData.nodeConfig.isHovered}
            className="w-16! h-16! min-w-0! min-h-0! p-0! flex items-center justify-center"
            showTitle={false}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center justify-center rounded-full p-2" style={{ backgroundColor: handleColor }}>
                        <MoveRight className="w-6 h-6 text-white" />
                    </div>
                </TooltipTrigger>
                <TooltipContent>End</TooltipContent>
            </Tooltip>
            <BaseHandle
				id={getNodeDefaultInputHandleId(id, NodeType.OperationEndNode)}
				type="target"
				position={Position.Left}
				handleColor={handleColor}
				heightPositionClassName="!top-1/2 !-translate-y-[2px]"
				className="-left-px!"
			/>
        </BaseNode>
    );
};

export default OperationEndNode;