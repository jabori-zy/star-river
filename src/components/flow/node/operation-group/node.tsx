import type { NodeProps } from "@xyflow/react";
import { NodeToolbar, Position, useReactFlow, useStore, getConnectedEdges } from "@xyflow/react";
import { useCallback } from "react";
import ConfirmBox from "@/components/confirm-box";

import type {
	OperationGroup as OperationGroupType,
	OperationGroupData,
} from "@/types/node/group/operation-group";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useSyncSourceNode } from "@/hooks/node-config/operation-group";
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
	parentId,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const { setNodes, setEdges, getNodes, getEdges, updateNodeData, updateNode, getInternalNode } = useReactFlow();
	const operationGroupData = getNodeData(id) as OperationGroupData;
	const nodeName = operationGroupData.nodeName || "Operation Group";
	const isCollapsed = operationGroupData.isCollapsed ?? false;

	// Sync source node configurations (e.g., Kline Symbol changes)
	useSyncSourceNode({ id, currentNodeData: operationGroupData });
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

	// Detach from parent group
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

			// Hide/show all descendant nodes (including nested children)
			setNodes((nodes) => {
				// Get all descendant IDs recursively
				const getDescendantIds = (parentId: string): Set<string> => {
					const descendants = new Set<string>();
					for (const node of nodes) {
						if (node.parentId === parentId) {
							descendants.add(node.id);
							// Recursively get descendants of this node
							const childDescendants = getDescendantIds(node.id);
							for (const childId of childDescendants) {
								descendants.add(childId);
							}
						}
					}
					return descendants;
				};

				const descendantIds = getDescendantIds(id);

				return nodes.map((node) => {
					// Handle direct children and all descendants
					if (descendantIds.has(node.id)) {
						if (collapse) {
							// When collapsing, hide all descendants
							// Also collapse nested groups and store their dimensions
							if (node.type === NodeType.OperationGroup) {
								const groupData = node.data as OperationGroupData;
								if (!groupData.isCollapsed) {
									return {
										...node,
										hidden: true,
										data: {
											...groupData,
											isCollapsed: true,
											expandedWidth: node.width,
											expandedHeight: node.height,
										},
										width: COLLAPSED_WIDTH,
										height: COLLAPSED_HEIGHT,
										style: {
											...node.style,
											width: `${COLLAPSED_WIDTH}px`,
											height: `${COLLAPSED_HEIGHT}px`,
											minWidth: `${COLLAPSED_WIDTH}px`,
											minHeight: `${COLLAPSED_HEIGHT}px`,
										},
									};
								}
							}
							return { ...node, hidden: true };
						}
						// When expanding, only show direct children (not nested collapsed group's children)
						if (node.parentId === id) {
							return { ...node, hidden: false };
						}
						// For nested nodes, keep them hidden if their parent group is collapsed
						const parentNode = nodes.find((n) => n.id === node.parentId);
						if (parentNode?.type === NodeType.OperationGroup) {
							const parentData = parentNode.data as OperationGroupData;
							if (parentData.isCollapsed) {
								return { ...node, hidden: true };
							}
						}
						return { ...node, hidden: false };
					}
					return node;
				});
			});
		},
		[id, setNodes, updateNodeData, updateNode, width, height, operationGroupData],
	);

	return (
		<>
			<NodeToolbar isVisible={selected} position={Position.Top} align="start">
				<div className="flex gap-1 bg-white rounded-md shadow-md border border-gray-200 p-1">
					{parentId && (
						connectedEdgeCount > 0 ? (
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
						)
					)}
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