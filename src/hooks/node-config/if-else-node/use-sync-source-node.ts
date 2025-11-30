import { useEffect } from "react";
import type { IfElseNodeBacktestConfig, CaseItem } from "@/types/node/if-else-node";
import type { StrategyFlowNode } from "@/types/node";
import { NodeType } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import type { KlineNodeData } from "@/types/node/kline-node";
import type { VariableNodeData } from "@/types/node/variable-node/variable-config-types";
import { useBacktestConfig } from "./use-update-backtest-config";
import { useUpdateIsNested } from "./index";

/**
 * Sync indicator node conditions
 * Checks if indicator configurations referenced in conditions still exist
 * Resets condition variables when indicator configs are deleted
 *
 * @param nodeId - Source indicator node ID
 * @param nodeData - Indicator node data
 * @param caseConfig - Cases that reference this indicator node
 * @param resetConditionVariable - Callback to reset condition variable
 */
function syncIndicatorNodeConditions(
	nodeId: string,
	nodeData: IndicatorNodeData,
	caseConfig: CaseItem[],
	resetConditionVariable: (caseId: number, conditionId: number, side: 'left' | 'right') => void
) {
	const snBacktestConfig = nodeData.backtestConfig?.exchangeModeConfig;
	const selectedIndicators = snBacktestConfig?.selectedIndicators ?? [];

	// Check each case that references this indicator node
	caseConfig.forEach((cc) => {
		cc.conditions.forEach((condition) => {
			// Check left variable
			// Only check if varConfigId is not null (null means user is still configuring)
			if (condition.left?.nodeId === nodeId && condition.left?.varConfigId !== null) {
				const configExists = selectedIndicators.some(
					si => si.configId === condition.left?.varConfigId
				);
				if (!configExists) {
					// Config has been deleted, reset left variable
					console.warn(
						`Indicator config ${condition.left?.varConfigId} not found, resetting condition ${condition.conditionId} left variable`
					);
					resetConditionVariable(cc.caseId, condition.conditionId, 'left');
				}
			}

			// Check right variable (skip if it's a constant)
			// Only check if varConfigId is not null (null means user is still configuring)
			if (condition.right && 'nodeId' in condition.right && condition.right.nodeId === nodeId && condition.right.varConfigId !== null) {
				const rightVarConfigId = condition.right.varConfigId;
				const configExists = selectedIndicators.some(
					si => si.configId === rightVarConfigId
				);
				if (!configExists) {
					// Config has been deleted, reset right variable
					console.warn(
						`Indicator config ${rightVarConfigId} not found, resetting condition ${condition.conditionId} right variable`
					);
					resetConditionVariable(cc.caseId, condition.conditionId, 'right');
				}
			}
		});
	});
}

/**
 * Sync kline node conditions
 * Checks if kline configurations referenced in conditions still exist
 * Resets condition variables when kline configs are deleted
 *
 * @param nodeId - Source kline node ID
 * @param nodeData - Kline node data
 * @param caseConfig - Cases that reference this kline node
 * @param resetConditionVariable - Callback to reset condition variable
 */
function syncKlineNodeConditions(
	nodeId: string,
	nodeData: KlineNodeData,
	caseConfig: CaseItem[],
	resetConditionVariable: (caseId: number, conditionId: number, side: 'left' | 'right') => void
) {
	const klineBacktestConfig = nodeData.backtestConfig?.exchangeModeConfig;
	const selectedSymbols = klineBacktestConfig?.selectedSymbols ?? [];

	// Check each case that references this kline node
	caseConfig.forEach((cc) => {
		cc.conditions.forEach((condition) => {
			// Check left variable
			// Only check if varConfigId is not null (null means user is still configuring)
			if (condition.left?.nodeId === nodeId && condition.left?.varConfigId !== null) {
				const configExists = selectedSymbols.some(
					ss => ss.configId === condition.left?.varConfigId
				);
				if (!configExists) {
					// Config has been deleted, reset left variable
					console.warn(
						`Kline config ${condition.left?.varConfigId} not found, resetting condition ${condition.conditionId} left variable`
					);
					resetConditionVariable(cc.caseId, condition.conditionId, 'left');
				}
			}

			// Check right variable (skip if it's a constant)
			// Only check if varConfigId is not null (null means user is still configuring)
			if (condition.right && 'nodeId' in condition.right && condition.right.nodeId === nodeId && condition.right.varConfigId !== null) {
				const rightVarConfigId = condition.right.varConfigId;
				const configExists = selectedSymbols.some(
					ss => ss.configId === rightVarConfigId
				);
				if (!configExists) {
					// Config has been deleted, reset right variable
					console.warn(
						`Kline config ${rightVarConfigId} not found, resetting condition ${condition.conditionId} right variable`
					);
					resetConditionVariable(cc.caseId, condition.conditionId, 'right');
				}
			}
		});
	});
}

/**
 * Sync variable node conditions
 * Checks if variable configurations referenced in conditions still exist or have been modified
 * Resets condition variables when variable configs are deleted
 * Updates condition variable metadata when variable configs are modified
 *
 * @param nodeId - Source variable node ID
 * @param nodeData - Variable node data
 * @param caseConfig - Cases that reference this variable node
 * @param resetConditionVariable - Callback to reset condition variable
 * @param updateConditionVariableMetadata - Callback to update condition variable metadata
 */
function syncVariableNodeConditions(
	nodeId: string,
	nodeData: VariableNodeData,
	caseConfig: CaseItem[],
	resetConditionVariable: (caseId: number, conditionId: number, side: 'left' | 'right') => void,
	updateConditionVariableMetadata: (
		caseId: number,
		conditionId: number,
		side: 'left' | 'right',
		varName: string,
		varDisplayName: string,
		varValueType: import('@/types/variable').VariableValueType
	) => void
) {
	const variableConfigs = nodeData.backtestConfig?.variableConfigs ?? [];

	// Check each case that references this variable node
	caseConfig.forEach((cc) => {
		cc.conditions.forEach((condition) => {
			// Check left variable
			// Only check if varConfigId is not null (null means user is still configuring)
			if (condition.left?.nodeId === nodeId && condition.left?.varConfigId !== null) {
				const matchedConfig = variableConfigs.find(
					vc => vc.configId === condition.left?.varConfigId
				);

				if (!matchedConfig) {
					// Config has been deleted, reset left variable
					console.warn(
						`Variable config ${condition.left?.varConfigId} not found, resetting condition ${condition.conditionId} left variable`
					);
					resetConditionVariable(cc.caseId, condition.conditionId, 'left');
				} else {
					// Config exists, check if metadata changed
					const needsUpdate =
						matchedConfig.varName !== condition.left.varName ||
						matchedConfig.varDisplayName !== condition.left.varDisplayName ||
						matchedConfig.varValueType !== condition.left.varValueType;

					if (needsUpdate) {
						console.warn(
							`Variable config ${condition.left?.varConfigId} metadata changed, updating condition ${condition.conditionId} left variable`
						);
						updateConditionVariableMetadata(
							cc.caseId,
							condition.conditionId,
							'left',
							matchedConfig.varName,
							matchedConfig.varDisplayName,
							matchedConfig.varValueType
						);
					}
				}
			}

			// Check right variable (skip if it's a constant)
			// Only check if varConfigId is not null (null means user is still configuring)
			if (condition.right && 'nodeId' in condition.right && condition.right.nodeId === nodeId && condition.right.varConfigId !== null) {
				const rightVarConfigId = condition.right.varConfigId;
				const matchedConfig = variableConfigs.find(
					vc => vc.configId === rightVarConfigId
				);

				if (!matchedConfig) {
					// Config has been deleted, reset right variable
					console.warn(
						`Variable config ${rightVarConfigId} not found, resetting condition ${condition.conditionId} right variable`
					);
					resetConditionVariable(cc.caseId, condition.conditionId, 'right');
				} else {
					// Config exists, check if metadata changed
					const needsUpdate =
						matchedConfig.varName !== condition.right.varName ||
						matchedConfig.varDisplayName !== condition.right.varDisplayName ||
						matchedConfig.varValueType !== condition.right.varValueType;

					if (needsUpdate) {
						console.warn(
							`Variable config ${rightVarConfigId} metadata changed, updating condition ${condition.conditionId} right variable`
						);
						updateConditionVariableMetadata(
							cc.caseId,
							condition.conditionId,
							'right',
							matchedConfig.varName,
							matchedConfig.varDisplayName,
							matchedConfig.varValueType
						);
					}
				}
			}
		});
	});
}

/**
 * Cleanup orphan conditions that reference disconnected nodes
 * This handles the case where a node is disconnected but its configurations remain
 *
 * @param sourceNodes - Currently connected source nodes
 * @param backtestConfig - Current backtest configuration
 * @param resetConditionVariable - Callback to reset condition variable
 */
function cleanupOrphanConditions(
	sourceNodes: Pick<StrategyFlowNode, "id" | "data" | "type">[],
	backtestConfig: IfElseNodeBacktestConfig,
	resetConditionVariable: (caseId: number, conditionId: number, side: 'left' | 'right') => void
) {
	const sourceNodeIds = new Set(sourceNodes.map(sn => sn.id));

	backtestConfig.cases.forEach((cc) => {
		cc.conditions.forEach((condition) => {
			// Check left variable references a disconnected node
			if (condition.left?.nodeId && !sourceNodeIds.has(condition.left.nodeId)) {
				console.warn(
					`Node ${condition.left.nodeId} is disconnected, resetting condition ${condition.conditionId} left variable`
				);
				resetConditionVariable(cc.caseId, condition.conditionId, 'left');
			}

			// Check right variable references a disconnected node (skip constants)
			if (condition.right && 'nodeId' in condition.right && condition.right.nodeId && !sourceNodeIds.has(condition.right.nodeId)) {
				console.warn(
					`Node ${condition.right.nodeId} is disconnected, resetting condition ${condition.conditionId} right variable`
				);
				resetConditionVariable(cc.caseId, condition.conditionId, 'right');
			}
		});
	});
}

/**
 * Sync if-else node conditions with source nodes' configurations
 *
 * Responsibilities:
 * 1. Monitor source node connection changes
 * 2. Validate and sync indicator/kline/variable configurations
 * 3. Reset cases when all source nodes are disconnected
 * 4. Reset condition variables when source configs are deleted
 * 5. Update condition variable metadata when source variable configs are modified
 *
 * @param id - If-else node ID
 * @param currentNodeData - Current node data (passed from parent to avoid duplicate fetch)
 * @param sourceNodes - Source nodes connected to this if-else node
 * @param backtestConfig - Current backtest configuration
 */
export const useSyncSourceNode = ({
	id,
	sourceNodes,
	backtestConfig,
}: {
	id: string;
	sourceNodes: Pick<StrategyFlowNode, "id" | "data" | "type">[];
	backtestConfig: IfElseNodeBacktestConfig | null;
}) => {
	const { resetCases: resetBacktestCases, resetConditionVariable, updateConditionVariableMetadata } = useBacktestConfig({ id });
	const { updateIsNested } = useUpdateIsNested({ id });

	// biome-ignore lint/correctness/useExhaustiveDependencies: backtestConfig is intentionally omitted to prevent infinite loops. This effect should only run when sourceNodes change.
	useEffect(() => {
		// No source nodes: reset cases and isNested
		if (sourceNodes.length === 0 && backtestConfig?.cases?.length !== 0) {
			resetBacktestCases();
			updateIsNested(false);
		}
		// Has source nodes: check if nested and sync configurations
		else if (backtestConfig?.cases && sourceNodes.length > 0 && backtestConfig?.cases?.length > 0) {
			// Check if any source node is IfElseNode type
			const hasIfElseSource = sourceNodes.some(sn => sn.type === NodeType.IfElseNode);
			updateIsNested(hasIfElseSource);

			// Sync configurations for all non-IfElseNode source nodes
			sourceNodes.forEach((sn) => {
				// Skip IfElseNode types as they don't need config sync
				if (sn.type === NodeType.IfElseNode) {
					return;
				}

				const nodeId = sn.id;
				// Filter caseConfig related to the source node
				const caseConfig = backtestConfig?.cases?.filter((c) => c.conditions.some((condition) => {
					const leftMatches = condition.left?.nodeId === nodeId;
					const rightMatches = condition.right && 'nodeId' in condition.right && condition.right.nodeId === nodeId;
					return leftMatches || rightMatches;
				}));

				// If no case references this node, skip
				if (caseConfig.length === 0) {
					return;
				}

				// Sync conditions based on node type
				switch (sn.type) {
					case NodeType.IndicatorNode:
						syncIndicatorNodeConditions(nodeId, sn.data as IndicatorNodeData, caseConfig, resetConditionVariable);
						break;

					case NodeType.KlineNode:
						syncKlineNodeConditions(nodeId, sn.data as KlineNodeData, caseConfig, resetConditionVariable);
						break;

					case NodeType.VariableNode:
						syncVariableNodeConditions(nodeId, sn.data as VariableNodeData, caseConfig, resetConditionVariable, updateConditionVariableMetadata);
						break;
				}
			});

		// Cleanup orphan conditions that reference disconnected nodes
		cleanupOrphanConditions(sourceNodes, backtestConfig, resetConditionVariable);
	}
}, [id, sourceNodes]);
};
