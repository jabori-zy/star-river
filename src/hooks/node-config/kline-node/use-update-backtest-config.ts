import { useReactFlow } from "@xyflow/react";
import dayjs from "dayjs";
import { produce } from "immer";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { Exchange } from "@/types/market";
import type {
	KlineNodeBacktestConfig,
	KlineNodeBacktestExchangeModeConfig,
	KlineNodeBacktestFileModeConfig,
	KlineNodeData,
	SelectedSymbol,
} from "@/types/node/kline-node";
import type { SelectedAccount, TimeRange } from "@/types/strategy";
import { BacktestDataSource } from "@/types/strategy";

/**
 * Create default K-line node backtest configuration
 */
export const createDefaultKlineBacktestConfig = (): KlineNodeBacktestConfig => {
	return {
		dataSource: BacktestDataSource.EXCHANGE,
		exchangeModeConfig: {
			selectedAccount: null,
			selectedSymbols: [],
			timeRange: {
				startDate: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
				endDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
			},
		},
		fileModeConfig: null,
		seriesLength: 200,
	};
};

interface UseBacktestConfigProps {
	id: string; // Node ID
}

export const useBacktestConfig = ({ id }: UseBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as KlineNodeData;
	const backtestConfig = nodeData?.backtestConfig ?? null;

	/**
	 * Generic update function: Use Immer to simplify nested updates
	 */
	const updateConfig = useCallback(
		(updater: (draft: KlineNodeBacktestConfig) => void) => {
			const currentConfig =
				backtestConfig ?? createDefaultKlineBacktestConfig();
			const newConfig = produce(currentConfig, updater);

			updateNodeData(id, { backtestConfig: newConfig });
		},
		[backtestConfig, id, updateNodeData],
	);

	// ==================== Basic Configuration Update ====================

	const setDefaultBacktestConfig = useCallback(() => {
		const defaultConfig = createDefaultKlineBacktestConfig();
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

	// ==================== File Mode Configuration Update ====================

	const updateFileModeConfig = useCallback(
		(fileModeConfig: KlineNodeBacktestFileModeConfig) => {
			updateConfig((draft) => {
				draft.fileModeConfig = fileModeConfig;
			});
		},
		[updateConfig],
	);

	const updateFilePath = useCallback(
		(filePath: string) => {
			updateConfig((draft) => {
				draft.fileModeConfig = {
					filePath,
				};
			});
		},
		[updateConfig],
	);

	// ==================== Exchange Mode Configuration Update ====================

	const updateExchangeModeConfig = useCallback(
		(exchangeModeConfig: KlineNodeBacktestExchangeModeConfig) => {
			updateConfig((draft) => {
				draft.exchangeModeConfig = exchangeModeConfig;
			});
		},
		[updateConfig],
	);

	const updateSelectedAccount = useCallback(
		(selectedAccount: SelectedAccount | null) => {
			updateConfig((draft) => {
				if (!draft.exchangeModeConfig) {
					draft.exchangeModeConfig = {
						selectedAccount,
						selectedSymbols: [],
						timeRange: {
							startDate: "",
							endDate: "",
						},
					};
				} else {
					draft.exchangeModeConfig.selectedAccount = selectedAccount;
				}
			});
		},
		[updateConfig],
	);

	const updateSelectedSymbols = useCallback(
		(selectedSymbols: SelectedSymbol[]) => {
			updateConfig((draft) => {
				// Add handleId

				if (!draft.exchangeModeConfig) {
					draft.exchangeModeConfig = {
						selectedAccount: {
							id: 0,
							exchange: Exchange.BINANCE,
							accountName: "",
						},
						selectedSymbols: selectedSymbols,
						timeRange: {
							startDate: "",
							endDate: "",
						},
					};
				} else {
					draft.exchangeModeConfig.selectedSymbols = selectedSymbols;
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
						selectedAccount: {
							id: 0,
							exchange: Exchange.BINANCE,
							accountName: "",
						},
						selectedSymbols: [],
						timeRange,
					};
				} else {
					draft.exchangeModeConfig.timeRange = timeRange;
				}
			});
		},
		[updateConfig],
	);

	const updateSeriesLength = useCallback(
		(seriesLength: number) => {
			updateConfig((draft) => {
				draft.seriesLength = seriesLength;
			});
		},
		[updateConfig],
	);

	return {
		backtestConfig,
		setDefaultBacktestConfig,
		updateDataSource,
		updateFileModeConfig,
		updateFilePath,
		updateExchangeModeConfig,
		updateSelectedAccount,
		updateSelectedSymbols,
		updateTimeRange,
		updateSeriesLength,
	};
};
