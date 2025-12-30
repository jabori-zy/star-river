import {
	type Connection,
	type Edge,
	getOutgoers,
	type IsValidConnection,
	type Node,
	useReactFlow,
} from "@xyflow/react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { NodeType } from "@/types/node/index";

// Node connection support map - defines which node types each node type can connect to
const NodeSupportConnectionMap: Record<NodeType, NodeType[]> = {
	[NodeType.StartNode]: [NodeType.KlineNode, NodeType.VariableNode, NodeType.EventTestNode],
	[NodeType.KlineNode]: [
		NodeType.IndicatorNode,
		NodeType.IfElseNode,
		NodeType.VariableNode,
		NodeType.OperationGroup,
		NodeType.EventTestNode,
	],
	[NodeType.IndicatorNode]: [NodeType.IfElseNode, NodeType.VariableNode, NodeType.OperationGroup, NodeType.EventTestNode],
	[NodeType.IfElseNode]: [
		NodeType.FuturesOrderNode,
		NodeType.VariableNode,
		NodeType.PositionNode,
		NodeType.IfElseNode,
		NodeType.EventTestNode,
	],
	[NodeType.FuturesOrderNode]: [
		// NodeType.IfElseNode,
		// NodeType.PositionNode,
		// NodeType.VariableNode,
		NodeType.EventTestNode,
	],
	[NodeType.PositionNode]: [NodeType.IfElseNode, NodeType.VariableNode, NodeType.EventTestNode],
	[NodeType.VariableNode]: [NodeType.IfElseNode, NodeType.VariableNode, NodeType.OperationGroup, NodeType.EventTestNode],
	[NodeType.OperationGroup]: [NodeType.IfElseNode, NodeType.VariableNode, NodeType.OperationEndNode, NodeType.OperationGroup, NodeType.OperationNode, NodeType.EventTestNode],
	[NodeType.OperationStartNode]: [NodeType.OperationNode, NodeType.OperationGroup],
	[NodeType.OperationNode]: [NodeType.OperationNode, NodeType.OperationEndNode, NodeType.OperationGroup],
	[NodeType.OperationEndNode]: [],
	[NodeType.EventTestNode]: [],
};

// Node connection limit - defines the maximum number of incoming connections for each node type (-1 means unlimited)
// -1 means unlimited
const NodeSupportConnectionLimit: Record<NodeType, number> = {
	[NodeType.StartNode]: 0, // Start node cannot receive connections
	[NodeType.KlineNode]: 1, // Can only have one incoming connection
	[NodeType.IndicatorNode]: 1, // Can only have one incoming connection
	[NodeType.IfElseNode]: -1,
	[NodeType.FuturesOrderNode]: -1,
	[NodeType.PositionNode]: -1,
	[NodeType.VariableNode]: -1,
	[NodeType.OperationGroup]: -1,
	[NodeType.OperationStartNode]: -1,
	[NodeType.OperationNode]: -1,
	[NodeType.OperationEndNode]: -1,
	[NodeType.EventTestNode]: 1,
};

// Node types that must be inside a group and can only connect within the same group
const GroupInternalNodeTypes: NodeType[] = [
	NodeType.OperationStartNode,
	NodeType.OperationNode,
	NodeType.OperationEndNode,
];

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
// Throttle duration for toast warnings (5 seconds)
const TOAST_THROTTLE_MS = 5000;

const useNodeValidation = () => {
	// Get ReactFlow nodes and connections information
	const { getNode, getNodeConnections, getNodes, getEdges } = useReactFlow();

	// Track last toast time for throttling
	const lastGroupToastTimeRef = useRef<number>(0);

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

			// Check if nodes are group internal nodes that require same parent
			const isSourceGroupInternal = GroupInternalNodeTypes.includes(
				sourceNode.type as NodeType,
			);
			const isTargetGroupInternal = GroupInternalNodeTypes.includes(
				targetNode.type as NodeType,
			);

			// If either node is a group internal node, they must have the same parentId
			if (isSourceGroupInternal || isTargetGroupInternal) {
				// Both must have parentId and they must be the same
				if (
					!sourceNode.parentId ||
					!targetNode.parentId ||
					sourceNode.parentId !== targetNode.parentId
				) {
					// Show throttled toast warning
					const now = Date.now();
					if (now - lastGroupToastTimeRef.current > TOAST_THROTTLE_MS) {
						lastGroupToastTimeRef.current = now;
						toast.warning(
							"Only same group's Operation Node can be connected",
						);
					}
					return false;
				}
			}

			// If source is a nested OperationGroup (has parentId), it can only connect to nodes within the same parent group
			if (
				sourceNode.type === NodeType.OperationGroup &&
				sourceNode.parentId
			) {
				// Target must also have the same parentId
				if (sourceNode.parentId !== targetNode.parentId) {
					// Show throttled toast warning
					const now = Date.now();
					if (now - lastGroupToastTimeRef.current > TOAST_THROTTLE_MS) {
						lastGroupToastTimeRef.current = now;
						toast.warning(
							"Only same group's Operation Node can be connected",
						);
					}
					return false;
				}
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
