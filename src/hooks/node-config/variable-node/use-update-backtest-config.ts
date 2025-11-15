import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type {
	VariableConfig,
	VariableNodeBacktestConfig,
	VariableNodeBacktestExchangeModeConfig,
	VariableNodeData,
} from "@/types/node/variable-node";
import { BacktestDataSource, type SelectedAccount } from "@/types/strategy";

/**
 * Create default variable node backtest config
 */
export const createDefaultVariableBacktestConfig =
	(): VariableNodeBacktestConfig => {
		return {
			dataSource: BacktestDataSource.EXCHANGE,
			exchangeModeConfig: undefined,
			variableConfigs: [],
		};
	};

interface UseBacktestConfigProps {
	id: string; // Node ID
}

export const useBacktestConfig = ({ id }: UseBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as VariableNodeData;
	const backtestConfig = nodeData?.backtestConfig ?? null;

	/**
	 * Generic update function: use Immer to simplify nested updates
	 */
	const updateConfig = useCallback(
		(updater: (draft: VariableNodeBacktestConfig) => void) => {
			const currentConfig =
				backtestConfig ?? createDefaultVariableBacktestConfig();
			const newConfig = produce(currentConfig, updater);

			updateNodeData(id, { backtestConfig: newConfig });
		},
		[backtestConfig, id, updateNodeData],
	);

	// ==================== Basic Config Updates ====================

	const setDefaultBacktestConfig = useCallback(() => {
		const defaultConfig = createDefaultVariableBacktestConfig();
		updateNodeData(id, { backtestConfig: defaultConfig });
	}, [id, updateNodeData]);

	const updateDataSource = useCallback(
		(dataSource: BacktestDataSource) => {
			updateConfig((draft) => {
				draft.dataSource = dataSource;
			});
		},
		[updateConfig],
	);

	// ==================== Exchange Mode Config Updates ====================

	const updateExchangeModeConfig = useCallback(
		(exchangeModeConfig: VariableNodeBacktestExchangeModeConfig | undefined) => {
			updateConfig((draft) => {
				draft.exchangeModeConfig = exchangeModeConfig;
			});
		},
		[updateConfig],
	);

	const updateSelectedAccount = useCallback(
		(selectedAccount: SelectedAccount) => {
			updateConfig((draft) => {
				draft.exchangeModeConfig = {
					selectedAccount,
				};
			});
		},
		[updateConfig],
	);

	// ==================== Variable Configs Updates ====================

	const updateVariableConfigs = useCallback(
		(variableConfigs: VariableConfig[]) => {
			updateConfig((draft) => {
				draft.variableConfigs = variableConfigs;
			});
		},
		[updateConfig],
	);

	const addVariableConfig = useCallback(
		(variableConfig: Omit<VariableConfig, "configId">) => {
			updateConfig((draft) => {
				// Calculate new ID based on max existing ID
				const newId =
					draft.variableConfigs.length > 0
						? Math.max(...draft.variableConfigs.map((config) => config.configId)) +
						  1
						: 1;

				const newConfig = { ...variableConfig, configId: newId } as VariableConfig;
				draft.variableConfigs.push(newConfig);
			});
		},
		[updateConfig],
	);

	const updateVariableConfig = useCallback(
		(index: number, variableConfig: VariableConfig) => {
			updateConfig((draft) => {
				if (index >= 0 && index < draft.variableConfigs.length) {
					draft.variableConfigs[index] = variableConfig;
				}
			});
		},
		[updateConfig],
	);

	const removeVariableConfig = useCallback(
		(index: number) => {
			updateConfig((draft) => {
				if (index >= 0 && index < draft.variableConfigs.length) {
					draft.variableConfigs.splice(index, 1);
				}
			});
		},
		[updateConfig],
	);

	const removeVariableConfigById = useCallback(
		(configId: number) => {
			updateConfig((draft) => {
				draft.variableConfigs = draft.variableConfigs.filter(
					(config) => config.configId !== configId,
				);
			});
		},
		[updateConfig],
	);

	return {
		backtestConfig,
		setDefaultBacktestConfig,
		updateDataSource,
		updateExchangeModeConfig,
		updateSelectedAccount,
		updateVariableConfigs,
		addVariableConfig,
		updateVariableConfig,
		removeVariableConfig,
		removeVariableConfigById,
	};
};
