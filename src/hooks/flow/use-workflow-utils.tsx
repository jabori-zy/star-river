import { useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import type { StrategyFlowNode } from "@/types/node";
import type { StartNode } from "@/types/node/start-node";

/**
 * Hook for utility functions
 */
const useWorkflowUtils = () => {
	const { getEdges, setEdges } = useReactFlow();

	/**
	 * Get backtest mode time range
	 */
	const getBacktestTimeRange = useCallback(() => {
		const backtestConfig = useStartNodeDataStore.getState().backtestConfig;
		return backtestConfig?.exchangeModeConfig?.timeRange;
	}, []);

	/**
	 * Get all target node IDs connected from a specified node as source
	 * @param sourceNodeId Source node ID
	 * @returns Array of target node IDs
	 */
	const getTargetNodeIdsBySourceNodeId = useCallback(
		(sourceNodeId: string) => {
			const edges = getEdges();

			const targetIds = edges
				.filter((edge) => edge.source === sourceNodeId)
				.map((edge) => edge.target);

			return [...new Set(targetIds)];
		},
		[getEdges],
	);

	const getTargetNodeIdsBySourceHandleId = useCallback(
		(sourceHandleId: string) => {
			const edges = getEdges();
			return edges
				.filter((edge) => edge.sourceHandle === sourceHandleId)
				.map((edge) => edge.target);
		},
		[getEdges],
	);

	/**
	 * Delete all edges with the specified source handleId
	 * @param sourceHandleId Source node handleId
	 */
	const deleteEdgeBySourceHandleId = useCallback(
		(sourceHandleId: string) => {
			const edges = getEdges();

			// Filter out edges with the specified sourceHandle
			const remainingEdges = edges.filter(
				(edge) => edge.sourceHandle !== sourceHandleId,
			);

			// Update edge state
			setEdges(remainingEdges);
		},
		[getEdges, setEdges],
	);

	/**
	 * Delete all edges with the specified target handleId
	 * @param targetHandleId Target node handleId
	 */
	const deleteEdgesByTargetHandleId = useCallback(
		(targetHandleId: string) => {
			const edges = getEdges();
			const remainingEdges = edges.filter(
				(edge) => edge.targetHandle !== targetHandleId,
			);
			setEdges(remainingEdges);
		},
		[getEdges, setEdges],
	);

	const getStartNodeData = useCallback(() => {
		const startNode = useNodesData<StrategyFlowNode>("start_node") as StartNode;
		return startNode?.data;
	}, []);

	const getNodeData = useCallback((nodeId: string) => {
		const node = useNodesData<StrategyFlowNode>(nodeId);
		return node?.data;
	}, []);

	const getSourceNodes = useCallback((currentNodeId: string) => {
		const connections = useNodeConnections({
			id: currentNodeId,
			handleType: "target",
		});
		const nodes = useNodesData<StrategyFlowNode>(
			connections.map((connection) => connection.source),
		);
		return nodes;
	}, []);

	return {
		getBacktestTimeRange,
		getTargetNodeIds: getTargetNodeIdsBySourceNodeId,
		deleteEdgeBySourceHandleId,
		getTargetNodeIdsBySourceHandleId,
		deleteEdgesByTargetHandleId,
		getStartNodeData,
		getNodeData,
		getSourceNodes,
	};
};

export default useWorkflowUtils;
