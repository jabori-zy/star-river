import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type {
	PositionBacktestConfig,
	PositionNodeData,
	PositionOperationConfig,
} from "@/types/node/position-management-node";
import type { SelectedAccount } from "@/types/strategy";

/**
 * Create default position management node backtest config
 */
export const createDefaultPositionBacktestConfig =
	(): PositionBacktestConfig => {
		return {
			selectedAccount: null,
			positionOperations: [],
		};
	};

interface UseBacktestConfigProps {
	id: string; // Node ID
}

export const useBacktestConfig = ({ id }: UseBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as PositionNodeData;
	const backtestConfig = nodeData?.backtestConfig ?? null;

	/**
	 * Generic update function: use Immer to simplify nested updates
	 */
	const updateConfig = useCallback(
		(updater: (draft: PositionBacktestConfig) => void) => {
			const currentConfig =
				backtestConfig ?? createDefaultPositionBacktestConfig();
			const newConfig = produce(currentConfig, updater);

			updateNodeData(id, { backtestConfig: newConfig });
		},
		[backtestConfig, id, updateNodeData],
	);

	// ==================== Basic Config Updates ====================

	const setDefaultBacktestConfig = useCallback(() => {
		const defaultConfig = createDefaultPositionBacktestConfig();
		updateNodeData(id, { backtestConfig: defaultConfig });
	}, [id, updateNodeData]);

	const updateSelectedAccount = useCallback(
		(selectedAccount: SelectedAccount | null) => {
			updateConfig((draft) => {
				draft.selectedAccount = selectedAccount;
			});
		},
		[updateConfig],
	);

	// ==================== Position Operations Updates ====================

	const updatePositionOperations = useCallback(
		(positionOperations: PositionOperationConfig[]) => {
			updateConfig((draft) => {
				draft.positionOperations = positionOperations;
			});
		},
		[updateConfig],
	);

	const addPositionOperation = useCallback(
		(operationConfig: PositionOperationConfig) => {
			updateConfig((draft) => {
				// Calculate new ID based on max existing ID
				const newId =
					draft.positionOperations.length > 0
						? Math.max(
								...draft.positionOperations.map(
									(op) => op.positionOperationId,
								),
						  ) + 1
						: 1;

				const newOperation = { ...operationConfig, positionOperationId: newId };
				draft.positionOperations.push(newOperation);
			});
		},
		[updateConfig],
	);

	const updatePositionOperation = useCallback(
		(index: number, operationConfig: PositionOperationConfig) => {
			updateConfig((draft) => {
				if (index >= 0 && index < draft.positionOperations.length) {
					draft.positionOperations[index] = operationConfig;
				}
			});
		},
		[updateConfig],
	);

	const removePositionOperation = useCallback(
		(index: number) => {
			updateConfig((draft) => {
				if (index >= 0 && index < draft.positionOperations.length) {
					draft.positionOperations.splice(index, 1);
				}
			});
		},
		[updateConfig],
	);

	const removePositionOperationById = useCallback(
		(operationId: number) => {
			updateConfig((draft) => {
				draft.positionOperations = draft.positionOperations.filter(
					(op) => op.positionOperationId !== operationId,
				);
			});
		},
		[updateConfig],
	);

	return {
		backtestConfig,
		setDefaultBacktestConfig,
		updateSelectedAccount,
		updatePositionOperations,
		addPositionOperation,
		updatePositionOperation,
		removePositionOperation,
		removePositionOperationById,
	};
};
