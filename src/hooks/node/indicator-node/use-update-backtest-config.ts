import { useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import type {
	IndicatorNodeBacktestConfig,
	IndicatorNodeBacktestExchangeModeConfig,
	SelectedIndicator,
} from "@/types/node/indicator-node";
import type { SelectedSymbol } from "@/types/node/kline-node";
import {
	BacktestDataSource,
	type SelectedAccount,
	type TimeRange,
} from "@/types/strategy";

interface UseUpdateBacktestConfigProps {
	id: string;
	initialConfig?: IndicatorNodeBacktestConfig;
}

export const useUpdateBacktestConfig = ({
	id,
	initialConfig,
}: UseUpdateBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<IndicatorNodeBacktestConfig | undefined>(
		initialConfig,
	);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: IndicatorNodeBacktestConfig | undefined,
			) => IndicatorNodeBacktestConfig,
		) => {
			setConfig((prevConfig) => {
				const newConfig = updater(prevConfig);

				// 更新节点数据
				updateNodeData(id, {
					backtestConfig: newConfig,
				});

				return newConfig;
			});
		},
		[id, updateNodeData],
	);

	// 默认配置值
	const getDefaultConfig = useCallback(
		(prev?: IndicatorNodeBacktestConfig): IndicatorNodeBacktestConfig => {
			const { backtestConfig: startNodeBacktestConfig } =
				useStartNodeDataStore.getState();
			const timeRange = startNodeBacktestConfig?.exchangeModeConfig?.timeRange;
			console.log("获取默认配置", timeRange);
			return {
				dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
				fileModeConfig: prev?.fileModeConfig,
				exchangeModeConfig: {
					selectedAccount: prev?.exchangeModeConfig?.selectedAccount || null,
					selectedSymbol: prev?.exchangeModeConfig?.selectedSymbol || null,
					selectedIndicators:
						prev?.exchangeModeConfig?.selectedIndicators || [],
					timeRange: timeRange || { startDate: "", endDate: "" },
				},
			};
		},
		[],
	);

	// 通用的字段更新方法
	const updateField = useCallback(
		<K extends keyof IndicatorNodeBacktestConfig>(
			field: K,
			value: IndicatorNodeBacktestConfig[K],
		) => {
			updateConfig((prev) => ({
				...getDefaultConfig(prev),
				[field]: value,
			}));
		},
		[updateConfig, getDefaultConfig],
	);

	const setDefaultBacktestConfig = useCallback(() => {
		const defaultConfig = getDefaultConfig();
		updateConfig(() => defaultConfig);
	}, [updateConfig, getDefaultConfig]);

	// 更新数据源
	const updateDataSource = useCallback(
		(dataSource: BacktestDataSource) => {
			updateField("dataSource", dataSource);
		},
		[updateField],
	);

	// 更新交易所配置
	const updateExchangeConfig = useCallback(
		(exchangeConfig: IndicatorNodeBacktestExchangeModeConfig) => {
			updateField("exchangeModeConfig", exchangeConfig);
		},
		[updateField],
	);

	// 更新选中的账户
	const updateSelectedAccount = useCallback(
		(selectedAccount: SelectedAccount | null) => {
			updateConfig((prev) => {
				const baseConfig = getDefaultConfig(prev);
				return {
					...baseConfig,
					exchangeModeConfig: {
						selectedAccount,
						selectedSymbol:
							baseConfig.exchangeModeConfig?.selectedSymbol || null,
						selectedIndicators:
							baseConfig.exchangeModeConfig?.selectedIndicators || [],
						timeRange: baseConfig.exchangeModeConfig?.timeRange || {
							startDate: "",
							endDate: "",
						},
					},
				};
			});
		},
		[updateConfig, getDefaultConfig],
	);

	// 更新选中的交易对
	const updateSelectedSymbol = useCallback(
		(selectedSymbol: SelectedSymbol | null) => {
			updateConfig((prev) => {
				const baseConfig = getDefaultConfig(prev);
				return {
					...baseConfig,
					exchangeModeConfig: {
						selectedAccount:
							baseConfig.exchangeModeConfig?.selectedAccount || null,
						selectedSymbol,
						selectedIndicators:
							baseConfig.exchangeModeConfig?.selectedIndicators || [],
						timeRange: baseConfig.exchangeModeConfig?.timeRange || {
							startDate: "",
							endDate: "",
						},
					},
				};
			});
		},
		[updateConfig, getDefaultConfig],
	);

	// 更新选中的指标
	const updateSelectedIndicators = useCallback(
		(selectedIndicators: SelectedIndicator[]) => {
			updateConfig((prev) => {
				const baseConfig = getDefaultConfig(prev);
				return {
					...baseConfig,
					exchangeModeConfig: {
						selectedAccount:
							baseConfig.exchangeModeConfig?.selectedAccount || null,
						selectedSymbol:
							baseConfig.exchangeModeConfig?.selectedSymbol || null,
						selectedIndicators,
						timeRange: baseConfig.exchangeModeConfig?.timeRange || {
							startDate: "",
							endDate: "",
						},
					},
				};
			});
		},
		[updateConfig, getDefaultConfig],
	);

	const updateTimeRange = useCallback(
		(timeRange: TimeRange) => {
			console.log("updateTimeRange", timeRange);
			updateConfig((prev) => {
				// 检查是否需要更新，避免无意义的重复更新
				const currentTimeRange = prev?.exchangeModeConfig?.timeRange;
				if (
					currentTimeRange &&
					currentTimeRange.startDate === timeRange.startDate &&
					currentTimeRange.endDate === timeRange.endDate
				) {
					return prev || getDefaultConfig();
				}

				const baseConfig = getDefaultConfig(prev);
				return {
					...baseConfig,
					exchangeModeConfig: {
						selectedAccount:
							baseConfig.exchangeModeConfig?.selectedAccount || null,
						selectedSymbol:
							baseConfig.exchangeModeConfig?.selectedSymbol || null,
						selectedIndicators:
							baseConfig.exchangeModeConfig?.selectedIndicators || [],
						timeRange,
					},
				};
			});
		},
		[updateConfig, getDefaultConfig],
	);

	return {
		// 状态
		config,
		setDefaultBacktestConfig,
		// 具体更新方法
		updateDataSource,
		updateExchangeConfig,
		updateSelectedAccount,
		updateSelectedSymbol,
		updateSelectedIndicators,
		updateTimeRange,
	};
};
