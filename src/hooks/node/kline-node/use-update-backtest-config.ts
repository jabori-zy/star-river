import { useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import { Exchange } from "@/types/market";
import type {
	KlineNodeBacktestConfig,
	KlineNodeBacktestExchangeModeConfig,
	KlineNodeBacktestFileModeConfig,
	SelectedSymbol,
} from "@/types/node/kline-node";
import type { SelectedAccount, TimeRange } from "@/types/strategy";
import { BacktestDataSource } from "@/types/strategy";

interface UseUpdateBacktestConfigProps {
	id: string;
	initialBacktestConfig?: KlineNodeBacktestConfig;
}

export const useUpdateBacktestConfig = ({
	id,
	initialBacktestConfig,
}: UseUpdateBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<KlineNodeBacktestConfig | undefined>(
		initialBacktestConfig,
	);

	// 生成 handleId 的辅助函数
	const generateHandleId = useCallback(
		(index: number) => {
			return `${id}_output_${index}`;
		},
		[id],
	);

	// 为交易对数组添加 handleId
	const addHandleIds = useCallback(
		(symbols: SelectedSymbol[]): SelectedSymbol[] => {
			return symbols.map((symbol, index) => ({
				...symbol,
				handleId: generateHandleId(index + 1),
			}));
		},
		[generateHandleId],
	);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: KlineNodeBacktestConfig | undefined,
			) => KlineNodeBacktestConfig,
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
		(prev?: KlineNodeBacktestConfig): KlineNodeBacktestConfig => {
			const { backtestConfig: startNodeBacktestConfig } =
				useStartNodeDataStore.getState();
			const timeRange = startNodeBacktestConfig?.exchangeModeConfig?.timeRange;
			return {
				dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
				fileModeConfig: prev?.fileModeConfig,
				exchangeModeConfig: {
					selectedAccount: prev?.exchangeModeConfig?.selectedAccount || null,
					selectedSymbols: prev?.exchangeModeConfig?.selectedSymbols || [],
					timeRange: timeRange || { startDate: "", endDate: "" },
				},
			};
		},
		[],
	);

	// 通用的字段更新方法
	const updateField = useCallback(
		<K extends keyof KlineNodeBacktestConfig>(
			field: K,
			value: KlineNodeBacktestConfig[K],
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
		updateField("dataSource", defaultConfig.dataSource);
		updateField("fileModeConfig", defaultConfig.fileModeConfig);
		updateField("exchangeModeConfig", defaultConfig.exchangeModeConfig);
	}, [updateField, getDefaultConfig]);

	// 具体的更新方法
	const updateDataSource = useCallback(
		(dataSource: BacktestDataSource) => {
			updateField("dataSource", dataSource);
		},
		[updateField],
	);

	// 更新文件配置
	const updateFileModeConfig = useCallback(
		(fileModeConfig: KlineNodeBacktestFileModeConfig) => {
			updateField("fileModeConfig", fileModeConfig);
		},
		[updateField],
	);

	const updateFilePath = useCallback(
		(filePath: string) => {
			updateConfig((prev) => ({
				...getDefaultConfig(prev),
				fileModeConfig: {
					filePath,
				},
			}));
		},
		[updateConfig, getDefaultConfig],
	);

	// 更新交易所配置
	const updateExchangeModeConfig = useCallback(
		(exchangeModeConfig: KlineNodeBacktestExchangeModeConfig) => {
			updateField("exchangeModeConfig", exchangeModeConfig);
		},
		[updateField],
	);

	const updateSelectedAccount = useCallback(
		(selectedAccount: SelectedAccount | null) => {
			updateConfig((prev) => ({
				...getDefaultConfig(prev),
				exchangeModeConfig: {
					...prev?.exchangeModeConfig,
					selectedAccount: selectedAccount,
					selectedSymbols: prev?.exchangeModeConfig?.selectedSymbols || [],
					timeRange: prev?.exchangeModeConfig?.timeRange || {
						startDate: "",
						endDate: "",
					},
				},
			}));
		},
		[updateConfig, getDefaultConfig],
	);

	const updateSelectedSymbols = useCallback(
		(selectedSymbols: SelectedSymbol[]) => {

			updateConfig((prev) => ({
				...getDefaultConfig(prev),
				exchangeModeConfig: {
					...prev?.exchangeModeConfig,
					selectedAccount: prev?.exchangeModeConfig?.selectedAccount || {
						id: 0,
						exchange: Exchange.BINANCE,
						accountName: "",
					},
					selectedSymbols: selectedSymbols,
					timeRange: prev?.exchangeModeConfig?.timeRange || {
						startDate: "",
						endDate: "",
					},
				},
			}));
		},
		[updateConfig, getDefaultConfig],
	);

	const updateTimeRange = useCallback(
		(timeRange: TimeRange) => {
			updateConfig((prev) => ({
				...getDefaultConfig(prev),
				exchangeModeConfig: {
					...prev?.exchangeModeConfig,
					selectedAccount: prev?.exchangeModeConfig?.selectedAccount || {
						id: 0,
						exchange: Exchange.BINANCE,
						accountName: "",
					},
					selectedSymbols: prev?.exchangeModeConfig?.selectedSymbols || [],
					timeRange,
				},
			}));
		},
		[updateConfig, getDefaultConfig],
	);

	return {
		config,
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
