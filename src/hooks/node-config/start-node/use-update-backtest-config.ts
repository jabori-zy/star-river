import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { DateTime } from "luxon";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { StartNodeData } from "@/types/node/start-node";
import type {
	BacktestDataSource,
	SelectedAccount,
	StrategyBacktestConfig,
	TimeRange,
} from "@/types/strategy";
import { BacktestDataSource as BacktestDataSourceEnum } from "@/types/strategy";
import type { CustomVariable } from "@/types/variable";

/**
 * Create default backtest configuration
 */
export const createDefaultBacktestConfig = (): StrategyBacktestConfig => {
	return {
		dataSource: BacktestDataSourceEnum.EXCHANGE,
		exchangeModeConfig: {
			selectedAccounts: [],
			timeRange: {
				startDate: DateTime.now()
					.minus({ days: 2 })
					.startOf("day")
					.toFormat("yyyy-MM-dd HH:mm:ss ZZ"),
				endDate: DateTime.now()
					.minus({ days: 1 })
					.startOf("day")
					.toFormat("yyyy-MM-dd HH:mm:ss ZZ"),
			},
		},
		fileModeConfig: null,
		initialBalance: 10000,
		leverage: 5,
		feeRate: 0.001,
		playSpeed: 20,
		customVariables: [],
	};
};

interface UseBacktestConfigProps {
	id: string; // Node ID
}

export const useBacktestConfig = ({ id }: UseBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as StartNodeData;
	const backtestConfig = nodeData?.backtestConfig ?? null;

	/**
	 * Generic update function: Use Immer to simplify nested updates
	 */
	const updateConfig = useCallback(
		(updater: (draft: StrategyBacktestConfig) => void) => {
			const currentConfig = backtestConfig ?? createDefaultBacktestConfig();
			const newConfig = produce(currentConfig, updater);

			updateNodeData(id, { backtestConfig: newConfig });
		},
		[backtestConfig, id, updateNodeData],
	);

	// ==================== Basic Configuration Update ====================

	const updateInitialBalance = useCallback(
		(initialBalance: number) => {
			updateConfig((draft) => {
				draft.initialBalance = initialBalance;
			});
		},
		[updateConfig],
	);

	const updateLeverage = useCallback(
		(leverage: number) => {
			updateConfig((draft) => {
				draft.leverage = leverage;
			});
		},
		[updateConfig],
	);

	const updateFeeRate = useCallback(
		(feeRate: number) => {
			updateConfig((draft) => {
				draft.feeRate = feeRate;
			});
		},
		[updateConfig],
	);

	const updatePlaySpeed = useCallback(
		(playSpeed: number) => {
			updateConfig((draft) => {
				draft.playSpeed = playSpeed;
			});
		},
		[updateConfig],
	);

	const updateDataSource = useCallback(
		(dataSource: BacktestDataSource) => {
			updateConfig((draft) => {
				draft.dataSource = dataSource;
			});
		},
		[updateConfig],
	);

	// ==================== Exchange Mode Configuration Update ====================

	const updateBacktestAccounts = useCallback(
		(accounts: SelectedAccount[]) => {
			updateConfig((draft) => {
				if (!draft.exchangeModeConfig) {
					draft.exchangeModeConfig = {
						selectedAccounts: accounts,
						timeRange: {
							startDate: "",
							endDate: "",
						},
					};
				} else {
					draft.exchangeModeConfig.selectedAccounts = accounts;
				}
			});
		},
		[updateConfig],
	);

	const updateTimeRange = useCallback(
		(timeRange: TimeRange) => {
			updateConfig((draft) => {
				if (!draft.exchangeModeConfig) {
					draft.exchangeModeConfig = {
						selectedAccounts: [],
						timeRange,
					};
				} else {
					draft.exchangeModeConfig.timeRange = timeRange;
				}
			});
		},
		[updateConfig],
	);

	// ==================== Custom Variable Update ====================

	const updateBacktestVariables = useCallback(
		(variables: CustomVariable[]) => {
			updateConfig((draft) => {
				draft.customVariables = variables;
			});
		},
		[updateConfig],
	);

	return {
		backtestConfig,
		updateInitialBalance,
		updateLeverage,
		updateFeeRate,
		updatePlaySpeed,
		updateDataSource,
		updateBacktestAccounts,
		updateTimeRange,
		updateBacktestVariables,
	};
};
