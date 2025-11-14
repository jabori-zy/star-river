import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	//   Controls,
	Background,
	type Connection,
	type Edge,
	type EdgeChange,
	MiniMap,
	type Node,
	type NodeChange,
	type NodeSelectionChange,
	NodeToolbar,
	type OnConnect,
	type OnEdgesChange,
	// type OnEdgesDelete,
	type OnNodesChange,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import { useReactFlow } from "@xyflow/react";
import { DevTools } from "@/components/flow/devtools"; // 开发者工具
import ControlPanel from "@/components/flow/node-controllor";
import NodePanel from "@/components/flow/node-panel";
import edgeTypes from "@/constants/edgeTypes";
import { nodeTypes } from "@/constants/nodeTypes";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useDndNodeStore } from "@/store/use-dnd-node-store";
import type { Strategy } from "@/types/strategy";

export default function StrategyFlow({ strategy }: { strategy: Strategy }) {
	const [nodes, setNodes] = useNodesState<Node>([]);
	const [edges, setEdges] = useEdgesState<Edge>([]);
	// 正在拖拽的节点
	const { dragNodeItem, setDragNodeItem } = useDndNodeStore();
	const { screenToFlowPosition } = useReactFlow();

	const { checkIsValidConnection, handleNodeChanges, handleEdgeChanges } = useStrategyWorkflow();


	const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);

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
				const startNode: Node = {
					id: "start_node",
					type: "startNode",
					position: { x: 0, y: 0 },
					data: {
						strategyId: strategy.id,
						nodeName: "策略起点",
					},
				};
				// 设置默认实盘配置

				setNodes([startNode]);
			}, 0);
		}
	}, [strategy.id, strategy.nodes, strategy.edges, setNodes, setEdges]);

	useEffect(() => {
		console.log("selectedNodeId", selectedNodeId);
	}, [selectedNodeId]);

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
			// 生成唯一ID：节点类型 + 时间戳 + 随机数
			const timestamp = Date.now();
			const random = Math.random().toString(36).substring(2, 9);
			const uniqueId = `${dragNodeItem.nodeId}_${timestamp}_${random}`;

				const newNode = {
					id: uniqueId,
					type: dragNodeItem.nodeType,
					position,
					data: {
						...dragNodeItem.nodeData,
						strategyId: strategy.id,
						nodeName: `${dragNodeItem.nodeName}`,
					},
				};

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
			setDragNodeItem,
		],
	);

	// 当拖动或者选择节点时，将会触发onNodesChange事件
	const onNodesChange: OnNodesChange = useCallback(
		(changes: NodeChange[]) => {
			// 先应用变化，获取更新后的节点状态
			console.log("changes", changes);
			const selectedChange = changes.find((change) => change.type === 'select' && change.selected) as NodeSelectionChange;
			const deselectedChange = changes.find((change) => change.type === 'select' && !change.selected) as NodeSelectionChange;

			// 如果有节点被选中，更新selectedNodeId
			if (selectedChange) {
				console.log("selectedChange.id", selectedChange.id);
				setSelectedNodeId(selectedChange.id);
			}
			// 如果有节点被取消选中，且正好是当前选中的节点，则清空selectedNodeId
			else if (deselectedChange && deselectedChange.id === selectedNodeId) {
				console.log("deselectedChange.id", deselectedChange.id);
				setSelectedNodeId(undefined);
			}

			setNodes((oldNodes: Node[]) => {
				// 先应用变化，获取自动更新后的节点状态
				const newNodes = applyNodeChanges(changes, oldNodes);

				// 手动处理节点变化
				const updatedNodes = handleNodeChanges(
					changes,
					oldNodes,
					newNodes,
					edges,
				);

				// 返回更新后的节点
				return updatedNodes;
			});
		},
		[setNodes, edges, handleNodeChanges, selectedNodeId],
	);

	// 当拖动或者选择边时，将会触发onEdgesChange事件
	const onEdgesChange: OnEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			setEdges((oldEdges) => {
				const newEdges = applyEdgeChanges(changes, oldEdges);
				// 如果changes中都是replace或select类型，则不处理
				const isAllReplaceOrSelect = changes.every(
					(change) => change.type === "replace" || change.type === "select",
				);
				if (!isAllReplaceOrSelect) {
					const [_, updatedNodes] = handleEdgeChanges(
						changes,
						oldEdges,
						newEdges,
					);
					// 更新节点
					setNodes(updatedNodes);
				}

				return newEdges;
			});
		},
		[setEdges, handleEdgeChanges, setNodes],
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

	// const onEdgesDelete: OnEdgesDelete = useCallback((edges: Edge[]) => {
	// 	// setEdges((eds) => eds.filter((edge) => !edges.includes(edge)));
	// 	console.log("边已删除", edges);
	// }, []);

	// 添加 useEffect 来监听 edges 的变化
	useEffect(() => {
		// console.log("Current nodes:", nodes);
		// console.log("Current edges:", edges);
	}, [nodes, edges]);

	return (
		<div className="flex-1 h-full w-full overflow-x-auto">
			<ReactFlow
				key={flowKey} // 使用 flowKey 强制重新渲染，确保模式切换时组件完全重置
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				nodeTypes={nodeTypes} // 临时使用 any 类型来解决类型兼容性问题
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
				{/* <Controls /> */}
				{/* 背景颜色：深灰色 */}
				<Background />
				<NodeToolbar />
				{/* 节点面板 */}
				<NodePanel selectedNodeId={selectedNodeId} setSelectedNodeId={setSelectedNodeId} />
				{/* 节点控制面板 */}
				<ControlPanel />
			</ReactFlow>
		</div>
	);
}
