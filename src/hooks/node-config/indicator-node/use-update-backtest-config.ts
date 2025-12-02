import { useReactFlow } from "@xyflow/react";
import dayjs from "dayjs";
import { produce } from "immer";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { Exchange } from "@/types/market";
import type {
	IndicatorNodeBacktestConfig,
	IndicatorNodeBacktestExchangeModeConfig,
	IndicatorNodeBacktestFileConfig,
	IndicatorNodeData,
	SelectedIndicator,
} from "@/types/node/indicator-node";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type { SelectedAccount, TimeRange } from "@/types/strategy";
import { BacktestDataSource } from "@/types/strategy";

/**
 * Create default indicator node backtest config
 */
export const createDefaultIndicatorBacktestConfig =
	(): IndicatorNodeBacktestConfig => {
		return {
			dataSource: BacktestDataSource.EXCHANGE,
			exchangeModeConfig: {
				selectedAccount: null,
				selectedSymbol: null,
				selectedIndicators: [],
				timeRange: {
					startDate: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
					endDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
				},
			},
			fileModeConfig: null,
		};
	};

interface UseBacktestConfigProps {
	id: string; // Node ID
}

export const useBacktestConfig = ({ id }: UseBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as IndicatorNodeData;
	const backtestConfig = nodeData?.backtestConfig ?? null;

	/**
	 * Generic update function: use Immer to simplify nested updates
	 */
	const updateConfig = useCallback(
		(updater: (draft: IndicatorNodeBacktestConfig) => void) => {
			const currentConfig =
				backtestConfig ?? createDefaultIndicatorBacktestConfig();
			const newConfig = produce(currentConfig, updater);

			updateNodeData(id, { backtestConfig: newConfig });
		},
		[backtestConfig, id, updateNodeData],
	);

	// ==================== Basic Config Updates ====================

	const setDefaultBacktestConfig = useCallback(() => {
		const defaultConfig = createDefaultIndicatorBacktestConfig();
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

	// ==================== File Mode Config Updates ====================

	const updateFileModeConfig = useCallback(
		(fileModeConfig: IndicatorNodeBacktestFileConfig) => {
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

	// ==================== Exchange Mode Config Updates ====================

	const updateExchangeModeConfig = useCallback(
		(exchangeModeConfig: IndicatorNodeBacktestExchangeModeConfig) => {
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
						selectedSymbol: null,
						selectedIndicators: [],
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

	const updateSelectedSymbol = useCallback(
		(selectedSymbol: SelectedSymbol | null) => {
			updateConfig((draft) => {
				if (!draft.exchangeModeConfig) {
					draft.exchangeModeConfig = {
						selectedAccount: {
							id: 0,
							exchange: Exchange.BINANCE,
							accountName: "",
						},
						selectedSymbol,
						selectedIndicators: [],
						timeRange: {
							startDate: "",
							endDate: "",
						},
					};
				} else {
					draft.exchangeModeConfig.selectedSymbol = selectedSymbol;
				}
			});
		},
		[updateConfig],
	);

	const updateSelectedIndicators = useCallback(
		(selectedIndicators: SelectedIndicator[]) => {
			updateConfig((draft) => {
				if (!draft.exchangeModeConfig) {
					draft.exchangeModeConfig = {
						selectedAccount: {
							id: 0,
							exchange: Exchange.BINANCE,
							accountName: "",
						},
						selectedSymbol: null,
						selectedIndicators,
						timeRange: {
							startDate: "",
							endDate: "",
						},
					};
				} else {
					draft.exchangeModeConfig.selectedIndicators = selectedIndicators;
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
						selectedSymbol: null,
						selectedIndicators: [],
						timeRange,
					};
				} else {
					draft.exchangeModeConfig.timeRange = timeRange;
				}
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
		updateSelectedSymbol,
		updateSelectedIndicators,
		updateTimeRange,
	};
};
