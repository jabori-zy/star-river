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

// Node connection support map - defines which node types each node type can connect to
const NodeSupportConnectionMap: Record<NodeType, NodeType[]> = {
	[NodeType.StartNode]: [NodeType.KlineNode, NodeType.VariableNode],
	[NodeType.KlineNode]: [
		NodeType.IndicatorNode,
		NodeType.IfElseNode,
		NodeType.VariableNode,
		NodeType.OperationGroup,
	],
	[NodeType.IndicatorNode]: [NodeType.IfElseNode, NodeType.VariableNode, NodeType.OperationGroup],
	[NodeType.IfElseNode]: [
		NodeType.FuturesOrderNode,
		NodeType.VariableNode,
		NodeType.PositionNode,
		NodeType.IfElseNode,
	],
	[NodeType.FuturesOrderNode]: [
		// NodeType.IfElseNode,
		// NodeType.PositionNode,
		// NodeType.VariableNode,
	],
	[NodeType.PositionNode]: [NodeType.IfElseNode, NodeType.VariableNode],
	[NodeType.VariableNode]: [NodeType.IfElseNode, NodeType.VariableNode, NodeType.OperationGroup],
	[NodeType.OperationGroup]: [NodeType.IfElseNode, NodeType.VariableNode],
	[NodeType.OperationStartNode]: [NodeType.OperationNode],
	[NodeType.OperationNode]: [NodeType.OperationNode, NodeType.OperationEndNode],
	[NodeType.OperationEndNode]: [],
};

// Node connection limit - defines the maximum number of incoming connections for each node type (-1 means unlimited)
const NodeSupportConnectionLimit: Record<NodeType, number> = {
	[NodeType.StartNode]: 0, // Start node cannot receive connections
	[NodeType.KlineNode]: 1, // Can only have one incoming connection
	[NodeType.IndicatorNode]: 1, // Can only have one incoming connection
	[NodeType.IfElseNode]: -1, // -1 means unlimited
	[NodeType.FuturesOrderNode]: -1, // -1 means unlimited
	[NodeType.PositionNode]: -1, // -1 means unlimited
	[NodeType.VariableNode]: -1, // -1 means unlimited
	[NodeType.OperationGroup]: -1, // -1 means unlimited
	[NodeType.OperationStartNode]: -1, // -1 means unlimited
	[NodeType.OperationNode]: -1, // -1 means unlimited
	[NodeType.OperationEndNode]: -1, // -1 means unlimited
};

/**
 * Detect if a circular connection will be formed
 * Uses depth-first search (DFS) to traverse from the target node downward and check if the source node can be reached
 *
 * @param sourceNodeId - Source node ID to be connected
 * @param targetNode - Target node object to be connected
 * @param nodes - List of all nodes
 * @param edges - List of all edges
 * @returns true indicates a cycle will be formed, false indicates it will not
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
 * Hook for node connection validation
 */
const useNodeValidation = () => {
	// Get ReactFlow nodes and connections information
	const { getNode, getNodeConnections, getNodes, getEdges } = useReactFlow();

	/**
	 * Check if connection is valid
	 * Determines whether a connection can be established between two nodes based on node types and connection limits
	 */
	const checkIsValidConnection: IsValidConnection = useCallback(
		(connection: Connection | Edge): boolean => {
			const sourceNodeId = connection.source;
			const targetNodeId = connection.target;

			// Get source and target nodes
			const sourceNode = getNode(sourceNodeId);
			const targetNode = getNode(targetNodeId);

			// Connection is invalid if nodes don't exist
			if (!sourceNode || !targetNode) {
				return false;
			}

			// Prevent self-loop (A → A)
			if (sourceNode.id === targetNode.id) {
				return false;
			}

			// Check if source node supports connection to target node type
			const supportedConnections =
				NodeSupportConnectionMap[sourceNode.type as NodeType];
			if (
				!supportedConnections ||
				!supportedConnections.includes(targetNode.type as NodeType)
			) {
				return false;
			}

			// Check target node's connection limit
			const targetNodeConnections = getNodeConnections({
				nodeId: targetNodeId,
				type: "target",
			});
			const targetNodeSupportConnectionLimit =
				NodeSupportConnectionLimit[targetNode.type as NodeType];

			// -1 means unlimited, continue to check for cycles
			if (targetNodeSupportConnectionLimit !== -1) {
				// Check if connection limit is exceeded
				const isOverLimit =
					targetNodeSupportConnectionLimit > targetNodeConnections.length;
				if (!isOverLimit) {
					return false;
				}
			}

			// Prevent circular connections (A → B → C → A)
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
