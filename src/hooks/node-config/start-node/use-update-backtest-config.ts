import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import {
	BacktestDataSource,
	type SelectedAccount,
	type StrategyBacktestConfig,
	type StrategyVariable,
	type TimeRange,
} from "@/types/strategy";

interface UseBacktestConfigProps {
	initialConfig?: StrategyBacktestConfig;
	nodeId?: string; // 节点ID，用于同步节点数据
}

const defaultBacktestConfig: StrategyBacktestConfig = {
	dataSource: BacktestDataSource.EXCHANGE,
	exchangeModeConfig: null,
	fileModeConfig: null,
	initialBalance: 10000,
	leverage: 1,
	feeRate: 0.001,
	playSpeed: 1,
	variables: [],
};

export const useBacktestConfig = ({
	initialConfig,
	nodeId,
}: UseBacktestConfigProps) => {
	// 获取ReactFlow实例
	const { setNodes } = useReactFlow();

	// 获取全局状态store的方法和数据
	const {
		backtestConfig: config,
		setBacktestConfig: setGlobalBacktestConfig,
		setDefaultBacktestConfig: setGlobalDefaultBacktestConfig,
		updateInitialBalance: updateGlobalInitialBalance,
		updateLeverage: updateGlobalLeverage,
		updateFeeRate: updateGlobalFeeRate,
		updatePlaySpeed: updateGlobalPlaySpeed,
		updateDataSource: updateGlobalDataSource,
		updateBacktestAccounts: updateGlobalBacktestAccounts,
		updateTimeRange: updateGlobalTimeRange,
		updateBacktestVariables: updateGlobalBacktestVariables,
	} = useStartNodeDataStore();

	// 初始化配置（仅在首次使用时设置）
	useEffect(() => {
		if (!config && initialConfig) {
			setGlobalBacktestConfig(initialConfig);
		}
	}, [config, initialConfig, setGlobalBacktestConfig]);

	// 设置默认回测配置
	const setDefaultBacktestConfig = useCallback(() => {
		setGlobalDefaultBacktestConfig();
	}, [setGlobalDefaultBacktestConfig]);

	// 监听全局配置变化，同步到节点
	useEffect(() => {
		if (nodeId && config) {
			setNodes((nodes) =>
				nodes.map((node) =>
					node.id === nodeId
						? {
								...node,
								data: {
									...node.data,
									backtestConfig: config,
								},
							}
						: node,
				),
			);
		}
	}, [config, nodeId, setNodes]);

	// 辅助函数：同步节点数据（现在只是一个占位符，实际同步通过 useEffect）
	const syncToNode = useCallback(
		(_updateFn: (config: StrategyBacktestConfig) => StrategyBacktestConfig) => {
			// 同步现在通过 useEffect 自动完成
		},
		[],
	);

	// 具体的更新方法 - 直接调用全局状态方法并同步节点
	const updateInitialBalance = useCallback(
		(initialBalance: number) => {
			updateGlobalInitialBalance(initialBalance);
			syncToNode((config) => ({ ...config, initialBalance }));
		},
		[updateGlobalInitialBalance, syncToNode],
	);

	const updateLeverage = useCallback(
		(leverage: number) => {
			updateGlobalLeverage(leverage);
			syncToNode((config) => ({ ...config, leverage }));
		},
		[updateGlobalLeverage, syncToNode],
	);

	const updateFeeRate = useCallback(
		(feeRate: number) => {
			updateGlobalFeeRate(feeRate);
			syncToNode((config) => ({ ...config, feeRate }));
		},
		[updateGlobalFeeRate, syncToNode],
	);

	const updatePlaySpeed = useCallback(
		(playSpeed: number) => {
			updateGlobalPlaySpeed(playSpeed);
			syncToNode((config) => ({ ...config, playSpeed }));
		},
		[updateGlobalPlaySpeed, syncToNode],
	);

	const updateDataSource = useCallback(
		(dataSource: BacktestDataSource) => {
			updateGlobalDataSource(dataSource);
			syncToNode((config) => ({ ...config, dataSource }));
		},
		[updateGlobalDataSource, syncToNode],
	);

	const updateVariables = useCallback(
		(variables: StrategyVariable[]) => {
			updateGlobalBacktestVariables(variables);
			syncToNode((config) => ({ ...config, variables }));
		},
		[updateGlobalBacktestVariables, syncToNode],
	);

	const updateSelectedAccounts = useCallback(
		(accounts: SelectedAccount[]) => {
			updateGlobalBacktestAccounts(accounts);
			syncToNode((config) => ({
				...config,
				exchangeModeConfig: {
					selectedAccounts: accounts,
					timeRange: config.exchangeModeConfig?.timeRange || {
						startDate: "",
						endDate: "",
					},
				},
			}));
		},
		[updateGlobalBacktestAccounts, syncToNode],
	);

	const updateTimeRange = useCallback(
		(timeRange: TimeRange) => {
			updateGlobalTimeRange(timeRange);
			syncToNode((config) => ({
				...config,
				exchangeModeConfig: {
					selectedAccounts: config.exchangeModeConfig?.selectedAccounts || [],
					timeRange,
				},
			}));
		},
		[updateGlobalTimeRange, syncToNode],
	);

	return {
		config,
		setDefaultBacktestConfig,
		updateInitialBalance,
		updateLeverage,
		updateFeeRate,
		updatePlaySpeed,
		updateDataSource,
		updateSelectedAccounts,
		updateTimeRange,
		updateVariables,
	};
};
