import type { NodeProps } from "@xyflow/react";
import { useEffect } from "react";
import type { OperationStartNode as OperationStartNodeType, OperationStartNodeData } from "@/types/node/group/operation-group/operation-start-node";
import BaseNode from "@/components/flow/base/BaseNode";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { getNodeDefaultColor, getNodeDefaultOutputHandleId } from "@/types/node/index";
import { NodeType } from "@/types/node/index";
import { House } from "lucide-react";
import { useNodesData, useReactFlow } from "@xyflow/react";
import type { StrategyFlowNode } from "@/types/node/index";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { OperationGroupData } from "@/types/node/group/operation-group";



const OperationStartNode: React.FC<NodeProps<OperationStartNodeType>> = ({
	id,
	selected,
    parentId
}) => {

    const { updateNodeData } = useReactFlow();
    const operationStartNodeData = useNodesData<StrategyFlowNode>(id)?.data as OperationStartNodeData;

    const parentNodeData = useNodesData<StrategyFlowNode>(parentId ?? "")?.data as OperationGroupData | undefined;
	const nodeName = `${parentNodeData?.nodeName} Start Node`;
    const handleColor =
		operationStartNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.OperationStartNode);

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
            iconName={operationStartNodeData.nodeConfig.iconName}
            iconBackgroundColor={operationStartNodeData.nodeConfig.iconBackgroundColor}
            selectedBorderColor={operationStartNodeData.nodeConfig.borderColor}
            selected={selected}
            isHovered={operationStartNodeData.nodeConfig.isHovered}
            className="w-16! h-16! min-w-0! min-h-0! p-0! flex items-center justify-center"
            showTitle={false}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center justify-center rounded-full p-2" style={{ backgroundColor: handleColor }}>
                        <House className="w-6 h-6 text-white" />
                    </div>
                </TooltipTrigger>
                <TooltipContent>Start</TooltipContent>
            </Tooltip>
            <BaseHandle
				id={getNodeDefaultOutputHandleId(id, NodeType.OperationStartNode)}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				heightPositionClassName="!top-1/2 !-translate-y-[2px]"
				className="-right-px!"
			/>
        </BaseNode>
    );
};

export default OperationStartNode;