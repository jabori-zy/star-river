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
	// type OnEdgesDelete,
	type OnNodesChange,
	type OnNodesDelete,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import { useReactFlow } from "@xyflow/react";
import { isEqual, omit } from "lodash-es";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DevTools } from "@/components/flow/devtools"; // 开发者工具
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
import { useDndNodeStore } from "@/store/use-dnd-node-store";
import { NodeType } from "@/types/node";
import type { Strategy } from "@/types/strategy";

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
	// 正在拖拽的节点
	const { dragNodeItem, setDragNodeItem } = useDndNodeStore();
	const { screenToFlowPosition, getNodeConnections, updateNodeData } =
		useReactFlow();
	const { t } = useTranslation();
	const { checkIsValidConnection } = useStrategyWorkflow();

	const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(
		undefined,
	);

	// 创建一个唯一的 key 用于强制重新渲染，包含策略ID和交易模式
	const flowKey = useMemo(() => {
		return `${strategy.id}-${strategy.tradeMode}`;
	}, [strategy.id, strategy.tradeMode]);

	// 当策略数据变化时更新节点和边
	useEffect(() => {
		// 清空现有节点和边，确保模式切换时完全重新渲染
		setNodes([]);
		setEdges([]);

		if (strategy.nodes?.length > 0) {
			// 添加延迟确保清空操作完成
			setTimeout(() => {
				setNodes(strategy.nodes);
				setEdges(strategy.edges || []);
			}, 0);
		}
		// 如果没有节点和边，则创建一个开始节点
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

			// 使用函数式状态更新，基于时间戳和随机数生成唯一ID
			setNodes((currentNodes) => {
				// 生成唯一ID：节点类型 + 随机数
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
					default:
						defaultNodeData = {};
						break;
				}
				console.log("defaultNodeData", defaultNodeData);

				const newNode = {
					id: uniqueId,
					type: dragNodeItem.nodeType,
					position,
					data: defaultNodeData,
				};
				console.log("newNode", newNode);

				return currentNodes.concat(newNode);
			});

			// 清除拖拽状态
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

	// 当连接节点时，将会触发onConnect事件
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

			// 如果需要在连接建立后执行某些操作，使用 useEffect
		},
		[setEdges],
	);

	const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
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
			// 过滤掉 start node,不允许删除开始节点
			const nodesToDelete = nodes.filter(
				(nd) => nd.type !== NodeType.StartNode,
			);

			// 检查是否有 start node 在删除列表中
			const hasStartNode = nodes.length !== nodesToDelete.length;

			// 如果包含 start node,弹出提示
			if (hasStartNode) {
				toast.error(t("strategy.workflow.cannotDeleteStartNode"));

				// 如果所有节点都是 start node,则阻止删除
				if (nodesToDelete.length === 0) {
					return false;
				}
			}

			// 返回过滤后的节点列表,只删除非 start node 的节点
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

			// 设置节点悬停状态 - 深度合并以保留 nodeConfig 中的其他属性
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
			// 设置节点悬停状态 - 深度合并以保留 nodeConfig 中的其他属性
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

	// 添加 useEffect 来监听 edges 的变化
	// useEffect(() => {
	// console.log("Current nodes:", nodes);
	// console.log("Current edges:", edges);
	// }, [nodes, edges]);

	return (
		<div className="flex-1 h-full w-full overflow-x-auto">
			<ReactFlow
				key={flowKey} // 使用 flowKey 强制重新渲染，确保模式切换时组件完全重置
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onNodeClick={onNodeClick}
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
				style={{ backgroundColor: "#F7F9FB", height: "100%" }}
			>
				<DevTools />
				<MiniMap position="bottom-left" />
				{/* 背景颜色：深灰色 */}
				<Background />
				<NodeToolbar />
				{/* 节点面板 */}

				{selectedNodeId && (
					<NodePanel
						selectedNodeId={selectedNodeId}
						setSelectedNodeId={setSelectedNodeId}
					/>
				)}
				{/* 节点控制面板 */}
				<ControlPanel />
			</ReactFlow>
		</div>
	);
}
