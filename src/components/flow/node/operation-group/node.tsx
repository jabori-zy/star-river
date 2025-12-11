import type { NodeProps } from "@xyflow/react";
import { NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

import type {
	OperationGroup as OperationGroupType,
	OperationGroupData,
} from "@/types/node/group/operation-group";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import BaseNode from "@/components/flow/base/BaseNode";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import {
	getNodeDefaultColor,
	getNodeDefaultInputHandleId,
	getNodeDefaultOutputHandleId,
	NodeType,
} from "@/types/node/index";
import type { IconName } from "lucide-react/dynamic";

// Collapsed node dimensions
const COLLAPSED_WIDTH = 180;
const COLLAPSED_HEIGHT = 60;

const OperationGroup: React.FC<NodeProps<OperationGroupType>> = ({
	id,
	selected,
	width,
	height,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const { setNodes, updateNodeData, updateNode } = useReactFlow();
	const operationGroupData = getNodeData(id) as OperationGroupData;
	const nodeName = operationGroupData.nodeName || "Operation Group";
	const isCollapsed = operationGroupData.isCollapsed ?? false;
	const handleColor =
		operationGroupData?.nodeConfig?.handleColor ||
		getNodeDefaultColor(NodeType.OperationGroup);

	const defaultInputHandle: BaseHandleProps = {
		type: "target",
		position: Position.Left,
		id: getNodeDefaultInputHandleId(id, NodeType.OperationGroup),
		handleColor: handleColor,
		className: "!w-1.5 !h-3.5 !left-[-3px]",
	};

	const defaultOutputHandle: BaseHandleProps = {
		type: "source",
		position: Position.Right,
		id: getNodeDefaultOutputHandleId(id, NodeType.OperationGroup),
		handleColor: handleColor,
		className: "!w-1.5 !h-3.5 !right-[-3px]",
	};

	// Toggle collapse state and hide/show child nodes
	const handleToggleCollapse = useCallback(
		(collapse: boolean) => {
			if (collapse) {
				// Collapsing: store current dimensions and set to collapsed size
				updateNodeData(id, {
					isCollapsed: true,
					expandedWidth: width,
					expandedHeight: height,
				});
				updateNode(id, {
					width: COLLAPSED_WIDTH,
					height: COLLAPSED_HEIGHT,
					style: {
						width: `${COLLAPSED_WIDTH}px`,
						height: `${COLLAPSED_HEIGHT}px`,
						minWidth: `${COLLAPSED_WIDTH}px`,
						minHeight: `${COLLAPSED_HEIGHT}px`,
					},
				});
			} else {
				// Expanding: restore original dimensions
				const expandedWidth = operationGroupData.expandedWidth;
				const expandedHeight = operationGroupData.expandedHeight;
				updateNodeData(id, { isCollapsed: false });
				if (expandedWidth && expandedHeight) {
					updateNode(id, {
						width: expandedWidth,
						height: expandedHeight,
						style: {
							width: `${expandedWidth}px`,
							height: `${expandedHeight}px`,
							minWidth: undefined,
							minHeight: undefined,
						},
					});
				}
			}

			// Hide/show all child nodes (nodes with parentId === id)
			setNodes((nodes) =>
				nodes.map((node) => {
					if (node.parentId === id) {
						return { ...node, hidden: collapse };
					}
					return node;
				}),
			);
		},
		[id, setNodes, updateNodeData, updateNode, width, height, operationGroupData],
	);

	return (
		<>
			<NodeToolbar isVisible={selected} position={Position.Top} align="start">
				<div className="flex gap-1 bg-white rounded-md shadow-md border border-gray-200 p-1">
					<button
						type="button"
						className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
						onClick={() => handleToggleCollapse(!isCollapsed)}
					>
						{isCollapsed ? "Expand" : "Collapse"}
					</button>
				</div>
			</NodeToolbar>

			<BaseNode
				id={id}
				nodeName={nodeName}
				iconName={operationGroupData.nodeConfig.iconName as IconName}
				iconBackgroundColor={operationGroupData.nodeConfig.iconBackgroundColor}
				selectedBorderColor={operationGroupData.nodeConfig.borderColor}
				borderColor={isCollapsed ? undefined : "#020617"}
				selected={selected}
				isHovered={operationGroupData.nodeConfig.isHovered}
				className={isCollapsed ? "bg-white" : "bg-transparent"}
				canResize={!isCollapsed}
				defaultInputHandle={defaultInputHandle}
				defaultOutputHandle={defaultOutputHandle}
			/>
		</>
	);
};

export default OperationGroup;