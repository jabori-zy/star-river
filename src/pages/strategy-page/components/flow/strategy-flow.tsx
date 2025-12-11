import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	//   Controls,
	Background,
	type Connection,
	type Edge,
	MiniMap,
	type Node,
	type NodeMouseHandler,
	NodeToolbar,
	type OnBeforeDelete,
	type OnConnect,
	type OnEdgesChange,
	type OnNodeDrag,
	// type OnEdgesDelete,
	type OnNodesChange,
	type OnNodesDelete,
	ReactFlow,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import { isEqual, omit } from "lodash-es";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DevTools } from "@/components/flow/devtools"; // Developer tools
import ControlPanel from "@/components/flow/node-controllor";
import NodePanel from "@/components/flow/node-panel";
import edgeTypes from "@/constants/edgeTypes";
import { nodeTypes } from "@/constants/nodeTypes";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { createDefaultFuturesOrderNodeData } from "@/hooks/node-config/futures-order-node";
import { createDefaultIfElseNodeData } from "@/hooks/node-config/if-else-node";
import { createDefaultIndicatorNodeData } from "@/hooks/node-config/indicator-node";
import { createDefaultKlineNodeData } from "@/hooks/node-config/kline-node";
import { createDefaultPositionNodeData } from "@/hooks/node-config/position-node";
import { createDefaultStartNodeData } from "@/hooks/node-config/start-node";
import { createDefaultVariableNodeData } from "@/hooks/node-config/variable-node";
import { createDefaultOperationGroupNodeData } from "@/hooks/node-config/operation-group";
import { createDefaultOperationStartNodeData } from "@/hooks/node-config/operation-start-node";
import { createDefaultOperationNodeData } from "@/hooks/node-config/operation-node";
import { useDndNodeStore } from "@/store/use-dnd-node-store";
import { NodeType } from "@/types/node";
import type { Strategy } from "@/types/strategy";
import type { OperationGroupData } from "@/types/node/group/operation-group";

interface StrategyFlowProps {
	strategy: Strategy;
	onSaveStatusChange: (saveStatus: "saved" | "unsaved" | "saving") => void;
}

export default function StrategyFlow({
	strategy,
	onSaveStatusChange,
}: StrategyFlowProps) {
	const [nodes, setNodes] = useNodesState<Node>([]);
	const [edges, setEdges] = useEdgesState<Edge>([]);
	// Currently dragging node
	const { dragNodeItem, setDragNodeItem} = useDndNodeStore();
	const { screenToFlowPosition, getNodeConnections, updateNodeData, getIntersectingNodes } =
		useReactFlow();
	const { t } = useTranslation();
	const { checkIsValidConnection } = useStrategyWorkflow();

	const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(
		undefined,
	);

	// Create a unique key for forcing re-render, includes strategy ID and trading mode
	const flowKey = useMemo(() => {
		return `${strategy.id}-${strategy.tradeMode}`;
	}, [strategy.id, strategy.tradeMode]);

	// Update nodes and edges when strategy data changes
	useEffect(() => {
		// Clear existing nodes and edges to ensure complete re-render when mode switches
		setNodes([]);
		setEdges([]);

		if (strategy.nodes?.length > 0) {
			// Add delay to ensure clear operation completes
			setTimeout(() => {
				setNodes(strategy.nodes);
				setEdges(strategy.edges || []);
			}, 0);
		}
		// If there are no nodes and edges, create a start node
		else {
			setTimeout(() => {
				const startNodeData = createDefaultStartNodeData(
					strategy.id,
					strategy.name,
					t,
				);
				const startNode: Node = {
					id: "start_node",
					type: "startNode",
					position: { x: 0, y: 0 },
					data: startNodeData,
				};
				setNodes([startNode]);
			}, 0);
		}
	}, [strategy.id, strategy, setNodes, setEdges, t]);

	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();

			// console.log("nodeItemType", dragNodeItem);

			if (!dragNodeItem) return;

			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			// Use functional state update, generate unique ID based on timestamp and random number
			setNodes((currentNodes) => {
				// Generate unique ID: node type + random number
				const random = Math.random().toString(36).substring(2, 9);
				const uniqueId = `${dragNodeItem.nodeId}_${random}`;

				let defaultNodeData: Record<string, unknown>;
				switch (dragNodeItem.nodeType) {
					case NodeType.KlineNode:
						defaultNodeData = createDefaultKlineNodeData(
							strategy.id,
							strategy.name,
							t,
						);
						break;
					case NodeType.IndicatorNode:
						defaultNodeData = createDefaultIndicatorNodeData(
							strategy.id,
							strategy.name,
							t,
						);
						break;
					case NodeType.IfElseNode:
						defaultNodeData = createDefaultIfElseNodeData(
							strategy.id,
							strategy.name,
							uniqueId,
							t,
						);
						break;
					case NodeType.FuturesOrderNode:
						defaultNodeData = createDefaultFuturesOrderNodeData(
							strategy.id,
							strategy.name,
							t,
						);
						break;
					case NodeType.PositionNode:
						defaultNodeData = createDefaultPositionNodeData(
							strategy.id,
							strategy.name,
							t,
						);
						break;
					case NodeType.VariableNode:
						defaultNodeData = createDefaultVariableNodeData(
							strategy.id,
							strategy.name,
							t,
						);
						break;
					case NodeType.OperationGroup:
						defaultNodeData = createDefaultOperationGroupNodeData(
							strategy.id,
							strategy.name,
							t,
						);
						break;
					case NodeType.OperationStartNode:
						defaultNodeData = createDefaultOperationStartNodeData(
							strategy.id,
							strategy.name,
							t,
						);
						break;
					case NodeType.OperationNode:
						defaultNodeData = createDefaultOperationNodeData(
							strategy.id,
							strategy.name,
							t,
						);
						break;
					default:
						defaultNodeData = {};
						break;
				}
				console.log("defaultNodeData", defaultNodeData);

				if (dragNodeItem.nodeType === NodeType.OperationGroup) {
					const newNode = {
						id: uniqueId,
						type: dragNodeItem.nodeType,
						position,
						data: defaultNodeData,
					};
					const operationStartNodeData = createDefaultOperationStartNodeData(
						strategy.id,
						strategy.name,
						t,
					);


					const random = Math.random().toString(36).substring(2, 9);
					const operationStartNode = {
						id: `operation_start_node_${random}`,
						type: NodeType.OperationStartNode,
						position: { x: 40, y: 60 },  // Fixed position relative to group's top-left corner
						data: operationStartNodeData,
						draggable: false,
						selectable: false,
						parentId: uniqueId,
						extent: 'parent' as const,
					};
					return currentNodes.concat(newNode, operationStartNode);
				}

				const newNode = {
					id: uniqueId,
					type: dragNodeItem.nodeType,
					position,
					data: defaultNodeData,
				};
				console.log("newNode", newNode);

				return currentNodes.concat(newNode);
			});

			// Clear drag state
			setDragNodeItem(null);
		},
		[
			screenToFlowPosition,
			dragNodeItem,
			setNodes,
			strategy.id,
			strategy.name,
			setDragNodeItem,
			t,
		],
	);

	const onNodesChange: OnNodesChange = useCallback(
		(changes) => {
			setNodes((nds) => {
				const newNodes = applyNodeChanges(changes, nds);

				// Exclude 'selected', 'dragging' and nested 'data.nodeConfig.isHovered' fields from comparison
				const oldNodesFiltered = nds.map((node) =>
					omit(node, ["selected", "dragging", "data.nodeConfig.isHovered"]),
				);
				const newNodesFiltered = newNodes.map((node) =>
					omit(node, ["selected", "dragging", "data.nodeConfig.isHovered"]),
				);

				// Use lodash isEqual to compare nodes without selected, dragging and isHovered fields
				const areEqual = isEqual(oldNodesFiltered, newNodesFiltered);

				if (!areEqual) {
					// Set save status to unsaved when nodes have changed
					onSaveStatusChange("unsaved");
				}

				return newNodes;
			});
		},
		[setNodes, onSaveStatusChange],
	);

	const onEdgesChange: OnEdgesChange = useCallback(
		(changes) => {
			setEdges((eds) => {
				const newEdges = applyEdgeChanges(changes, eds);
				const oldEdgesFiltered = eds.map((edge) => omit(edge, ["selected"]));
				const newEdgesFiltered = newEdges.map((edge) =>
					omit(edge, ["selected"]),
				);
				const areEqual = isEqual(oldEdgesFiltered, newEdgesFiltered);
				if (!areEqual) {
					onSaveStatusChange("unsaved");
				}
				return newEdges;
			});
		},
		[setEdges, onSaveStatusChange],
	);

	const onNodeDrag: OnNodeDrag = useCallback((_event: React.MouseEvent, node: Node, _draggedNodes: Node[]) => {
		// If the node already has a parent, skip group detection
		if (node.parentId) return;

		// Get intersecting nodes using React Flow's built-in hook
		const intersectingNodes = getIntersectingNodes(node);
		// Filter out collapsed groups - only consider expanded groups for hover effect
		const intersectingGroupIds = intersectingNodes
			.filter((n) => {
				if (n.type !== NodeType.OperationGroup) return false;
				const groupData = n.data as OperationGroupData;
				return !groupData?.isCollapsed;
			})
			.map((n) => n.id);

		// Find all expanded OperationGroup nodes (excluding the dragged node itself)
		const groupNodes = nodes.filter(
			(n) => {
				if (n.type !== NodeType.OperationGroup || n.id === node.id) return false;
				const groupData = n.data as OperationGroupData;
				return !groupData?.isCollapsed;
			}
		);

		// Update isHovered state for each group node
		for (const groupNode of groupNodes) {
			const groupData = groupNode.data as OperationGroupData;
			const isOverlapping = intersectingGroupIds.includes(groupNode.id);

			if (groupData?.nodeConfig) {
				const currentIsHovered = groupData.nodeConfig.isHovered;
				if (isOverlapping && !currentIsHovered) {
					updateNodeData(groupNode.id, {
						nodeConfig: {
							...groupData.nodeConfig,
							isHovered: true,
						},
					});
				} else if (!isOverlapping && currentIsHovered) {
					updateNodeData(groupNode.id, {
						nodeConfig: {
							...groupData.nodeConfig,
							isHovered: false,
						},
					});
				}
			}
		}
	}, [nodes, updateNodeData, getIntersectingNodes]);

	const onNodeDragStop: OnNodeDrag = useCallback((_event: React.MouseEvent, draggedNode: Node, _draggedNodes: Node[]) => {
		// If the node already has a parent, skip group detection
		if (draggedNode.parentId) return;

		// Get intersecting nodes using React Flow's built-in hook
		const intersectingNodes = getIntersectingNodes(draggedNode);

		// Find all OperationGroup nodes (excluding the dragged node itself)
		const groupNodes = nodes.filter(
			(n) => n.type === NodeType.OperationGroup && n.id !== draggedNode.id
		);

		// Find the first intersecting expanded group node (skip collapsed groups)
		const targetGroupNode = intersectingNodes.find((n) => {
			if (n.type !== NodeType.OperationGroup) return false;
			const groupData = n.data as OperationGroupData;
			return !groupData?.isCollapsed;
		}) || null;

		// Reset isHovered state for all group nodes
		for (const groupNode of groupNodes) {
			const groupData = groupNode.data as OperationGroupData;
			if (groupData?.nodeConfig?.isHovered) {
				updateNodeData(groupNode.id, {
					nodeConfig: {
						...groupData.nodeConfig,
						isHovered: false,
					},
				});
			}
		}

		// If overlapping with an expanded group, add the dragged node to that group
		if (targetGroupNode) {
			const targetGroupId = targetGroupNode.id;

			// Calculate the relative position within the group
			const relativePosition = {
				x: draggedNode.position.x - targetGroupNode.position.x,
				y: draggedNode.position.y - targetGroupNode.position.y,
			};

			setNodes((nds) => {
				// Update the dragged node with parent info
				const updatedNodes = nds.map((n) => {
					if (n.id === draggedNode.id) {
						return {
							...n,
							position: relativePosition,
							parentId: targetGroupId,
							extent: 'parent' as const,
						};
					}
					return n;
				});

				// Sort nodes: parent nodes must come before their children
				// Nodes without parentId come first, then nodes with parentId
				return updatedNodes.sort((a, b) => {
					const aHasParent = a.parentId ? 1 : 0;
					const bHasParent = b.parentId ? 1 : 0;
					return aHasParent - bHasParent;
				});
			});
		}
	}, [nodes, updateNodeData, setNodes, getIntersectingNodes]);

	// When connecting nodes, onConnect event will be triggered
	const onConnect: OnConnect = useCallback(
		(conn: Connection) => {
			setEdges((eds) => {
				const customEdge: Edge = {
					...conn,
					id: `${conn.source}.${conn.sourceHandle || "default"}=>${conn.target}.${conn.targetHandle || "default"}`,
					sourceHandle: conn.sourceHandle || null,
					targetHandle: conn.targetHandle || null,
					source: conn.source,
					target: conn.target,
					type: "customEdge",
				};
				const newEdges = addEdge(customEdge, eds);
				return newEdges;
			});

			// If you need to perform some operations after connection is established, use useEffect
		},
		[setEdges],
	);

	const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
		if (node.selectable === false) return;
		setSelectedNodeId(node.id);
	}, []);

	const handleNodeDelete: OnNodesDelete = useCallback(
		(nodes: Node[]) => {
			setNodes((nds) => nds.filter((nd) => !nodes.includes(nd)));
			setSelectedNodeId(undefined);
			onSaveStatusChange("unsaved");
		},
		[setNodes, onSaveStatusChange],
	);

	const onPaneClick = useCallback((_event: React.MouseEvent) => {
		setSelectedNodeId(undefined);
	}, []);

	const onBeforeDeleteNode: OnBeforeDelete = useCallback(
		async ({ nodes, edges }) => {
			// Filter out start node, don't allow deleting start node
			const nodesToDelete = nodes.filter(
				(nd) => nd.type !== NodeType.StartNode,
			);

			// Check if there are start nodes in the deletion list
			const hasStartNode = nodes.length !== nodesToDelete.length;

			// If contains start node, show toast
			if (hasStartNode) {
				toast.error(t("strategy.workflow.cannotDeleteStartNode"));

				// If all nodes are start nodes, prevent deletion
				if (nodesToDelete.length === 0) {
					return false;
				}
			}

			// Return filtered node list, only delete non-start nodes
			return {
				nodes: nodesToDelete,
				edges,
			};
		},
		[t],
	);

	const onNodeMouseEnter: NodeMouseHandler = useCallback(
		(_event, node) => {
			const connections = getNodeConnections({ nodeId: node.id });
			connections.forEach((connection) => {
				setEdges((eds) =>
					eds.map((edge) => {
						if (
							edge.source === connection.source &&
							edge.target === connection.target
						) {
							return { ...edge, selected: true };
						}
						return edge;
					}),
				);
			});

			// Set node hover state - deep merge to preserve other properties in nodeConfig
			if (node.data?.nodeConfig) {
				updateNodeData(node.id, {
					nodeConfig: {
						...node.data.nodeConfig,
						isHovered: true,
					},
				});
			}
		},
		[getNodeConnections, setEdges, updateNodeData],
	);

	const onNodeMouseLeave: NodeMouseHandler = useCallback(
		(_event, node) => {
			const connections = getNodeConnections({ nodeId: node.id });
			connections.forEach((connection) => {
				setEdges((eds) =>
					eds.map((edge) => {
						if (
							edge.source === connection.source &&
							edge.target === connection.target
						) {
							return { ...edge, selected: false };
						}
						return edge;
					}),
				);
			});
			// Set node hover state - deep merge to preserve other properties in nodeConfig
			if (node.data?.nodeConfig) {
				updateNodeData(node.id, {
					nodeConfig: {
						...node.data.nodeConfig,
						isHovered: false,
					},
				});
			}
		},
		[getNodeConnections, setEdges, updateNodeData],
	);

	// Add useEffect to monitor edges changes
	useEffect(() => {
	console.log("Current nodes:", nodes);
	// console.log("Current edges:", edges);
	}, [nodes, edges]);

	return (
		<div className="flex-1 h-full w-full overflow-x-auto">
			<ReactFlow
				key={flowKey} // Use flowKey to force re-render, ensure component is completely reset when mode switches
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onNodeClick={onNodeClick}
				onNodeDrag={onNodeDrag}
				onNodeDragStop={onNodeDragStop}
				onNodesDelete={handleNodeDelete}
				onEdgesChange={onEdgesChange}
				onNodeMouseEnter={onNodeMouseEnter}
				onNodeMouseLeave={onNodeMouseLeave}
				onConnect={onConnect}
				onPaneClick={onPaneClick}
				onBeforeDelete={onBeforeDeleteNode}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onDragOver={onDragOver}
				onDrop={onDrop}
				// onEdgesDelete={onEdgesDelete}
				isValidConnection={checkIsValidConnection}
				//   onConnectStart={onConnectStart}
				//   onConnectEnd={onConnectEnd}
				fitView
				fitViewOptions={{ padding: 0.1 }}
				selectNodesOnDrag={false}
				style={{ backgroundColor: "#F7F9FB", height: "100%" }}
			>
				{process.env.NODE_ENV === "development" && (
					<DevTools />
				)}
				<MiniMap position="bottom-left" />
				{/* Background */}
				<Background />
				<NodeToolbar />
				{/* Node panel */}

				{selectedNodeId && (
					<NodePanel
						selectedNodeId={selectedNodeId}
						setSelectedNodeId={setSelectedNodeId}
					/>
				)}
				{/* Node control panel */}
				<ControlPanel />
			</ReactFlow>
		</div>
	);
}
