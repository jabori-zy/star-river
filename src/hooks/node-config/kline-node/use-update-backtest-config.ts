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
 * 创建默认的 K线节点回测配置
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
	};
};

interface UseBacktestConfigProps {
	id: string; // 节点ID
}

export const useBacktestConfig = ({ id }: UseBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as KlineNodeData;
	const backtestConfig = nodeData?.backtestConfig ?? null;

	/**
	 * 通用更新函数：使用 Immer 简化嵌套更新
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

	// ==================== 基础配置更新 ====================

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

	// ==================== 文件模式配置更新 ====================

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

	// ==================== 交易所模式配置更新 ====================

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
				// 添加 handleId

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
	};
};
