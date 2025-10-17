import useEdgeChangeHandlers from "./use-edge-change-handlers";
import useNodeChangeHandlers from "./use-node-change-handlers";
import useNodeValidation from "./use-node-validation";
import useNodeVariables from "./use-node-variables";
import useWorkflowUtils from "./use-workflow-utils";

// 重新导出类型，保持对外接口一致
export type { VariableItem } from "./use-node-variables";

/**
 * 策略工作流主hook - 整合所有相关功能
 *
 * 功能模块：
 * - 节点连接验证
 * - 节点变量管理
 * - 节点变更处理
 * - 工具函数
 */
const useStrategyWorkflow = () => {
	// 节点连接验证相关
	const { checkIsValidConnection } = useNodeValidation();

	// 节点变量管理相关
	const { getConnectedNodeVariables, getIfElseNodeCases } = useNodeVariables();

	// 节点变更处理相关
	const { handleNodeChanges } = useNodeChangeHandlers();
	const { handleEdgeChanges } = useEdgeChangeHandlers();

	// 工具函数相关
	const {
		getBacktestTimeRange,
		getTargetNodeIds,
		getTargetNodeIdsBySourceHandleId,
		deleteEdgeBySourceHandleId,
		deleteEdgesByTargetHandleId,
	} = useWorkflowUtils();

	return {
		// 节点连接验证
		checkIsValidConnection,

		// 节点变量管理
		getConnectedNodeVariables,
		getIfElseNodeCases,
		// 节点变更处理
		handleNodeChanges,

		// 边变更处理
		handleEdgeChanges,
		// 工具函数
		getBacktestTimeRange,
		getTargetNodeIds,
		getTargetNodeIdsBySourceHandleId,
		deleteEdgeBySourceHandleId,
		deleteEdgesByTargetHandleId,
	};
};

export default useStrategyWorkflow;
