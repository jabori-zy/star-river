import useEdgeChangeHandlers from "./use-edge-change-handlers";
import useNodeChangeHandlers from "./use-node-change-handlers";
import useNodeValidation from "./use-node-validation";
import useNodeVariables from "./use-node-variables";
import useWorkflowUtils from "./use-workflow-utils";

// Re-export types to maintain consistent external interface
export type { VariableItem } from "./use-node-variables";

/**
 * Main strategy workflow hook - Integrates all related functionality
 *
 * Functional modules:
 * - Node connection validation
 * - Node variable management
 * - Node change handling
 * - Utility functions
 */
const useStrategyWorkflow = () => {
	// Node connection validation related
	const { checkIsValidConnection } = useNodeValidation();

	// Node variable management related
	const { getConnectedNodeVariables, getIfElseNodeCases } = useNodeVariables();

	// Node change handling related
	const { handleNodeChanges } = useNodeChangeHandlers();
	const { handleEdgeChanges } = useEdgeChangeHandlers();

	// Utility functions related
	const {
		getBacktestTimeRange,
		getTargetNodeIds,
		getTargetNodeIdsBySourceHandleId,
		deleteEdgeBySourceHandleId,
		deleteEdgesByTargetHandleId,
		getStartNodeData,
		getNodeData,
		getSourceNodes,
	} = useWorkflowUtils();

	return {
		// Node connection validation
		checkIsValidConnection,

		// Node variable management
		getConnectedNodeVariables,
		getIfElseNodeCases,
		// Node change handling
		handleNodeChanges,

		// Edge change handling
		handleEdgeChanges,
		// Utility functions
		getBacktestTimeRange,
		getTargetNodeIds,
		getTargetNodeIdsBySourceHandleId,
		deleteEdgeBySourceHandleId,
		deleteEdgesByTargetHandleId,
		getStartNodeData,
		getNodeData,
		getSourceNodes,
	};
};

export default useStrategyWorkflow;
