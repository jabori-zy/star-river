import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type {
	CaseItem,
	IfElseNodeBacktestConfig,
	IfElseNodeData,
} from "@/types/node/if-else-node";
import { LogicalSymbol } from "@/types/node/if-else-node";

/**
 * Create default if-else node backtest config
 */
export const createDefaultIfElseBacktestConfig = (
	nodeId: string,
): IfElseNodeBacktestConfig => {
	return {
		cases: [
			{
				caseId: 1,
				logicalSymbol: LogicalSymbol.AND,
				conditions: [],
				outputHandleId: `${nodeId}_output_1`,
			},
		],
	};
};

interface UseBacktestConfigProps {
	id: string; // Node ID
}

export const useBacktestConfig = ({ id }: UseBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as IfElseNodeData;
	const backtestConfig = nodeData?.backtestConfig ?? null;

	/**
	 * Generic update function: use Immer to simplify nested updates
	 */
	const updateConfig = useCallback(
		(updater: (draft: IfElseNodeBacktestConfig) => void) => {
			const currentConfig =
				backtestConfig ?? createDefaultIfElseBacktestConfig(id);
			const newConfig = produce(currentConfig, updater);

			updateNodeData(id, { backtestConfig: newConfig });
		},
		[backtestConfig, id, updateNodeData],
	);

	// ==================== Basic Config Updates ====================

	const setDefaultBacktestConfig = useCallback(() => {
		const defaultConfig = createDefaultIfElseBacktestConfig(id);
		updateNodeData(id, { backtestConfig: defaultConfig });
	}, [id, updateNodeData]);

	// ==================== Cases Updates ====================

	const updateCases = useCallback(
		(cases: CaseItem[]) => {
			updateConfig((draft) => {
				draft.cases = cases;
			});
		},
		[updateConfig],
	);

	const updateCase = useCallback(
		(updatedCase: Partial<CaseItem>) => {
			updateConfig((draft) => {
				// If config is empty and updated case has complete info, add as new case
				if (draft.cases.length === 0 && updatedCase.caseId) {
					draft.cases = [updatedCase as CaseItem];
					return;
				}

				// Check if case exists
				const caseIndex = draft.cases.findIndex(
					(c) => c.caseId === updatedCase.caseId,
				);

				if (caseIndex === -1 && updatedCase.caseId) {
					// Case doesn't exist, add new case
					draft.cases.push(updatedCase as CaseItem);
				} else if (caseIndex !== -1) {
					// Case exists, update it
					draft.cases[caseIndex] = {
						...draft.cases[caseIndex],
						...updatedCase,
					};
				}
			});
		},
		[updateConfig],
	);

	const removeCase = useCallback(
		(caseId: number) => {
			updateConfig((draft) => {
				draft.cases = draft.cases.filter((c) => c.caseId !== caseId);
			});
		},
		[updateConfig],
	);


	const resetCases = useCallback(
		() => {
			let emptyCase: CaseItem = {
				caseId: 1,
				outputHandleId: `${id}_output_1`,
				logicalSymbol: LogicalSymbol.AND,
				conditions: [],
			};
			updateConfig((draft) => {
				draft.cases = [emptyCase];
			});
		},
		[updateConfig],
	);

	/**
	 * Reset a variable (left or right) in a specific condition
	 * Used when upstream node's config is deleted
	 */
	const resetConditionVariable = useCallback(
		(caseId: number, conditionId: number, side: 'left' | 'right') => {
			updateConfig((draft) => {
				// Find target case
				const targetCase = draft.cases.find(c => c.caseId === caseId);
				if (!targetCase) return;

				// Find target condition
				const targetCondition = targetCase.conditions.find(c => c.conditionId === conditionId);
				if (!targetCondition) return;

				// Reset the variable
				if (side === 'left') {
					// Reset left variable and comparison symbol (symbol depends on left variable type)
					targetCondition.left = null;
					targetCondition.comparisonSymbol = null;
				} else {
					// Only reset right variable
					targetCondition.right = null;
				}
			});
		},
		[updateConfig],
	);

	/**
	 * Update a variable's metadata (varName, varDisplayName, varValueType)
	 * Used when upstream variable node's config is modified
	 */
	const updateConditionVariableMetadata = useCallback(
		(
			caseId: number,
			conditionId: number,
			side: 'left' | 'right',
			varName: string,
			varDisplayName: string,
			varValueType: import('@/types/variable').VariableValueType
		) => {
			updateConfig((draft) => {
				// Find target case
				const targetCase = draft.cases.find(c => c.caseId === caseId);
				if (!targetCase) return;

				// Find target condition
				const targetCondition = targetCase.conditions.find(c => c.conditionId === conditionId);
				if (!targetCondition) return;

				// Update the variable metadata
				const targetVariable = side === 'left' ? targetCondition.left : targetCondition.right;
				if (targetVariable && 'nodeId' in targetVariable) {
					targetVariable.varName = varName;
					targetVariable.varDisplayName = varDisplayName;
					targetVariable.varValueType = varValueType;
				}
			});
		},
		[updateConfig],
	);

	return {
		backtestConfig,
		setDefaultBacktestConfig,
		updateCases,
		updateCase,
		removeCase,
		resetCases,
		resetConditionVariable,
		updateConditionVariableMetadata,
	};
};
