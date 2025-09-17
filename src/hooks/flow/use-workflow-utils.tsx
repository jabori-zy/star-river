import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";

/**
 * 工具函数相关的hook
 */
const useWorkflowUtils = () => {
	const { getEdges } = useReactFlow();

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
	const getTargetNodeIds = useCallback((sourceNodeId: string) => {
		const edges = getEdges();

		return edges
			.filter(edge => edge.source === sourceNodeId)
			.map(edge => edge.target);
	}, [getEdges]);

	return {
		getBacktestTimeRange,
		getTargetNodeIds,
	};
};

export default useWorkflowUtils;