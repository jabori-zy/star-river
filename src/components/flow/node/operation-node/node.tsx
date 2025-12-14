import { type NodeProps, NodeToolbar, useReactFlow, useStore, getConnectedEdges } from "@xyflow/react";
import { useCallback } from "react";

import type { OperationNode as OperationNodeType, OperationNodeData } from "@/types/node/operation-node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useSyncSourceNode } from "@/hooks/node-config/operation-node";
import BaseNode from "@/components/flow/base/BaseNode";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { getNodeDefaultColor, getNodeDefaultInputHandleId, getNodeDefaultOutputHandleId } from "@/types/node/index";
import { NodeType } from "@/types/node/index";
import type { IconName } from "lucide-react/dynamic";
import ConfirmBox from "@/components/confirm-box";


const OperationNode: React.FC<NodeProps<OperationNodeType>> = ({
	id,
	selected,
	parentId,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const { setNodes, setEdges, getNodes, getEdges, getInternalNode } = useReactFlow();
	const operationNodeData = getNodeData(id) as OperationNodeData;

	// Sync inputs when parent Group's inputConfigs change
	useSyncSourceNode({ id });
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

	const handleDetach = useCallback(() => {
		// Get the absolute position of current node using internal node
		const currentInternalNode = getInternalNode(id);
		const absolutePosition = currentInternalNode?.internals.positionAbsolute;

		if (!absolutePosition) return;

		// Get current node and find all connected edges
		const currentNode = getNodes().find((n) => n.id === id);
		if (currentNode) {
			const connectedEdges = getConnectedEdges([currentNode], getEdges());
			const connectedEdgeIds = new Set(connectedEdges.map((e) => e.id));

			// Remove all connected edges
			setEdges((edges) => edges.filter((e) => !connectedEdgeIds.has(e.id)));
		}

		setNodes((nodes) =>
			nodes.map((node) => {
				if (node.id === id) {
					return {
						...node,
						parentId: undefined,
						extent: undefined,
						position: absolutePosition,
					};
				}
				return node;
			}),
		);
	}, [id, setNodes, setEdges, getNodes, getEdges, getInternalNode]);

	// Get the number of connected edges for current node (reactive to edge changes)
	const connectedEdgeCount = useStore((state) => {
		const currentNode = state.nodes.find((n) => n.id === id);
		if (!currentNode) return 0;
		return getConnectedEdges([currentNode], state.edges).length;
	});

	// Detach button component
	const detachButton = (
		<button
			type="button"
			className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
			onClick={connectedEdgeCount === 0 ? handleDetach : undefined}
		>
			Detach
		</button>
	);

    return (
        <>
            <NodeToolbar isVisible={selected && !!parentId} position={Position.Top} align="start">
                    <div className="flex gap-1 bg-white rounded-md shadow-md border border-gray-200 p-1">
                        {connectedEdgeCount > 0 ? (
							<ConfirmBox
								title="Detach Node"
								description="This node has connections. Detaching will remove all connected edges. Are you sure?"
								confirmText="Detach"
								cancelText="Cancel"
								onConfirm={handleDetach}
							>
								{detachButton}
							</ConfirmBox>
						) : (
							detachButton
						)}
                    </div>
            </NodeToolbar>
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
        </>
    );
};

export default OperationNode;