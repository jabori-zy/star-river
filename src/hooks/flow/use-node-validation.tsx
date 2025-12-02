import {
	type Connection,
	type Edge,
	getOutgoers,
	type IsValidConnection,
	type Node,
	useReactFlow,
} from "@xyflow/react";
import { useCallback } from "react";
import { NodeType } from "@/types/node/index";

// 节点连接支持映射表 - 定义每种节点类型可以连接到哪些节点类型
const NodeSupportConnectionMap: Record<NodeType, NodeType[]> = {
	[NodeType.StartNode]: [NodeType.KlineNode, NodeType.VariableNode],
	[NodeType.KlineNode]: [
		NodeType.IndicatorNode,
		NodeType.IfElseNode,
		NodeType.VariableNode,
	],
	[NodeType.IndicatorNode]: [NodeType.IfElseNode, NodeType.VariableNode],
	[NodeType.IfElseNode]: [
		NodeType.FuturesOrderNode,
		NodeType.VariableNode,
		NodeType.PositionNode,
		NodeType.IfElseNode,
	],
	[NodeType.FuturesOrderNode]: [
		NodeType.IfElseNode,
		NodeType.PositionNode,
		NodeType.VariableNode,
	],
	[NodeType.PositionNode]: [NodeType.IfElseNode, NodeType.VariableNode],
	[NodeType.VariableNode]: [NodeType.IfElseNode, NodeType.VariableNode],
};

// 节点连接数量限制 - 定义每种节点类型最多可以被连接的次数（-1表示无限制）
const NodeSupportConnectionLimit: Record<NodeType, number> = {
	[NodeType.StartNode]: 0, // 开始节点不能连接
	[NodeType.KlineNode]: 1, // 只能有一个入口
	[NodeType.IndicatorNode]: 1, // 只能有一个入口
	[NodeType.IfElseNode]: -1, // -1代表不限制
	[NodeType.FuturesOrderNode]: -1, // -1代表不限制
	[NodeType.PositionNode]: -1, // -1代表不限制
	[NodeType.VariableNode]: -1, // -1代表不限制
};

/**
 * 检测是否会形成循环连接
 * 使用深度优先搜索(DFS)从目标节点向下遍历，检查是否能到达源节点
 *
 * @param sourceNodeId - 待连接的源节点ID
 * @param targetNode - 待连接的目标节点对象
 * @param nodes - 所有节点列表
 * @param edges - 所有边列表
 * @returns true 表示会形成循环，false 表示不会
 */
const hasCycle = (
	sourceNodeId: string,
	targetNode: Node,
	nodes: Node[],
	edges: Edge[],
): boolean => {
	const visited = new Set<string>();

	const dfs = (currentNode: Node): boolean => {
		if (visited.has(currentNode.id)) return false;
		visited.add(currentNode.id);

		for (const outgoer of getOutgoers(currentNode, nodes, edges)) {
			if (outgoer.id === sourceNodeId) return true;
			if (dfs(outgoer)) return true;
		}

		return false;
	};

	return dfs(targetNode);
};

/**
 * 节点连接验证相关的hook
 */
const useNodeValidation = () => {
	// 获取 ReactFlow 的节点和连接信息
	const { getNode, getNodeConnections, getNodes, getEdges } = useReactFlow();

	/**
	 * 检查连接是否有效
	 * 根据节点类型和连接限制来判断两个节点之间是否可以建立连接
	 */
	const checkIsValidConnection: IsValidConnection = useCallback(
		(connection: Connection | Edge): boolean => {
			const sourceNodeId = connection.source;
			const targetNodeId = connection.target;

			// 获取源节点和目标节点
			const sourceNode = getNode(sourceNodeId);
			const targetNode = getNode(targetNodeId);

			// 节点不存在则连接无效
			if (!sourceNode || !targetNode) {
				return false;
			}

			// 防止自循环 (A → A)
			if (sourceNode.id === targetNode.id) {
				return false;
			}

			// 检查源节点是否支持连接到目标节点类型
			const supportedConnections =
				NodeSupportConnectionMap[sourceNode.type as NodeType];
			if (
				!supportedConnections ||
				!supportedConnections.includes(targetNode.type as NodeType)
			) {
				return false;
			}

			// 检查目标节点的连接数量限制
			const targetNodeConnections = getNodeConnections({
				nodeId: targetNodeId,
				type: "target",
			});
			const targetNodeSupportConnectionLimit =
				NodeSupportConnectionLimit[targetNode.type as NodeType];

			// -1表示无限制，需要继续检查循环
			if (targetNodeSupportConnectionLimit !== -1) {
				// 检查是否超过连接数量限制
				const isOverLimit =
					targetNodeSupportConnectionLimit > targetNodeConnections.length;
				if (!isOverLimit) {
					return false;
				}
			}

			// 防止形成循环连接 (A → B → C → A)
			if (hasCycle(sourceNode.id, targetNode, getNodes(), getEdges())) {
				return false;
			}

			return true;
		},
		[getNode, getNodeConnections, getNodes, getEdges],
	);

	return {
		checkIsValidConnection,
	};
};

export default useNodeValidation;
