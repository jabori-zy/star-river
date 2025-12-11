import type { NodeProps } from "@xyflow/react";

import type { OperationNode as OperationNodeType, OperationNodeData } from "@/types/node/operation-node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import BaseNode from "@/components/flow/base/BaseNode";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { getNodeDefaultColor, getNodeDefaultInputHandleId, getNodeDefaultOutputHandleId } from "@/types/node/index";
import { NodeType } from "@/types/node/index";
import type { IconName } from "lucide-react/dynamic";


const OperationNode: React.FC<NodeProps<OperationNodeType>> = ({
	id,
	selected,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const operationNodeData = getNodeData(id) as OperationNodeData;
	const nodeName = operationNodeData.nodeName || "Operation Node";
    const handleColor =
		operationNodeData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.OperationNode);


    const defaultInputHandle: BaseHandleProps = {
		type: "target",
		position: Position.Left,
		id: getNodeDefaultInputHandleId(id, NodeType.OperationNode),
		handleColor: handleColor,
        className: "!w-1.5 !h-3.5 !left-[-3px]",
	};

    const defaultOutputHandle: BaseHandleProps = {
		type: "source",
		position: Position.Right,
		id: getNodeDefaultOutputHandleId(id, NodeType.OperationNode),
		handleColor: handleColor,
        className: "!w-1.5 !h-3.5 !right-[-3px]",
	};
	



    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            iconName={operationNodeData.nodeConfig.iconName as IconName}
            iconBackgroundColor={operationNodeData.nodeConfig.iconBackgroundColor}
            selectedBorderColor={operationNodeData.nodeConfig.borderColor}
            selected={selected}
            isHovered={operationNodeData.nodeConfig.isHovered}
            defaultInputHandle={defaultInputHandle}
            defaultOutputHandle={defaultOutputHandle}
        >
        </BaseNode>
    );
};

export default OperationNode;