import { useReactFlow, useNodesData, useNodeConnections } from "@xyflow/react";
import { useCallback } from "react";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import type { StrategyFlowNode } from "@/types/node";
import type { StartNode } from "@/types/node/start-node";
/**
 * 工具函数相关的hook
 */
const useWorkflowUtils = () => {
	const { getEdges, setEdges } = useReactFlow();

	/**
	 * 获取回测模式的时间范围
	 */
	const getBacktestTimeRange = useCallback(() => {
		const backtestConfig = useStartNodeDataStore.getState().backtestConfig;
		return backtestConfig?.exchangeModeConfig?.timeRange;
	}, []);

	/**
	 * 获取指定节点作为source连接的所有target节点ID
	 * @param sourceNodeId 源节点ID
	 * @returns 目标节点ID数组
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
	 * 删除指定的source handleId的所有的边
	 * @param sourceHandleId 源节点handleId
	 */
	const deleteEdgeBySourceHandleId = useCallback(
		(sourceHandleId: string) => {
			const edges = getEdges();

			// 过滤掉指定 sourceHandle 的边
			const remainingEdges = edges.filter(
				(edge) => edge.sourceHandle !== sourceHandleId,
			);

			// 更新边状态
			setEdges(remainingEdges);
		},
		[getEdges, setEdges],
	);

	/**
	 * 删除指定的target handleId的所有的边
	 * @param targetHandleId 目标节点handleId
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
		const nodes = useNodesData<StrategyFlowNode>(connections.map((connection) => connection.source));
		return nodes
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
