import { useCallback, useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import {
	FuturesOrderNodeBacktestConfig,
	FuturesOrderNodeBacktestExchangeModeConfig,
} from "@/types/node/futures-order-node";
import { FuturesOrderConfig } from "@/types/order";
import { BacktestDataSource, TimeRange } from "@/types/strategy";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";

interface UseUpdateBacktestConfigProps {
	id: string;
	initialConfig?: FuturesOrderNodeBacktestConfig;
}

export const useUpdateBacktestConfig = ({
	id,
	initialConfig,
}: UseUpdateBacktestConfigProps) => {
	const { updateNodeData, getNode } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<
		FuturesOrderNodeBacktestConfig | undefined
	>(initialConfig);

	// 同步节点数据到本地状态
	useEffect(() => {
		const node = getNode(id);
		if (node?.data?.backtestConfig) {
			setConfig(node.data.backtestConfig as FuturesOrderNodeBacktestConfig);
		}
	}, [id, getNode]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: FuturesOrderNodeBacktestConfig | undefined,
			) => FuturesOrderNodeBacktestConfig,
		) => {
			// 获取最新的节点数据，而不是依赖可能过时的state
			const currentNode = getNode(id);
			const currentConfig = currentNode?.data?.backtestConfig as
				| FuturesOrderNodeBacktestConfig
				| undefined;

			const newConfig = updater(currentConfig);

			// 更新节点数据
			updateNodeData(id, {
				backtestConfig: newConfig,
			});

			// 更新本地状态
			setConfig(newConfig);
		},
		[id, updateNodeData, getNode],
	);

	// 默认配置值
	const getDefaultConfig = useCallback(
		(prev?: FuturesOrderNodeBacktestConfig): FuturesOrderNodeBacktestConfig => {
			const { backtestConfig: startNodeBacktestConfig } =
				useStartNodeDataStore.getState();
			const timeRange = startNodeBacktestConfig?.exchangeModeConfig?.timeRange;
			console.log("获取默认配置", timeRange);

			return {
				dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
				exchangeModeConfig: {
					...prev?.exchangeModeConfig,
					timeRange: timeRange || { startDate: "", endDate: "" },
				},
				futuresOrderConfigs: prev?.futuresOrderConfigs || [],
			};
		},
		[],
	);

	// 通用的字段更新方法
	const updateField = useCallback(
		<K extends keyof FuturesOrderNodeBacktestConfig>(
			field: K,
			value: FuturesOrderNodeBacktestConfig[K],
		) => {
			updateConfig((prev) => ({
				...prev,
				dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
				futuresOrderConfigs: prev?.futuresOrderConfigs || [],
				[field]: value,
			}));
		},
		[updateConfig],
	);

	// 设置默认回测配置
	const setDefaultBacktestConfig = useCallback(() => {
		updateConfig((prev) => getDefaultConfig(prev));
	}, [updateConfig, getDefaultConfig]);

	// 更新数据源
	const updateDataSource = useCallback(
		(dataSource: BacktestDataSource) => {
			updateField("dataSource", dataSource);
		},
		[updateField],
	);

	// 更新时间范围 - 只更新timeRange，保留所有其他数据
	const updateTimeRange = useCallback(
		(timeRange: TimeRange) => {
			updateConfig((prev) => ({
				...prev,
				dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
				futuresOrderConfigs: prev?.futuresOrderConfigs || [],
				exchangeModeConfig: {
					...prev?.exchangeModeConfig,
					timeRange: timeRange,
				},
			}));
		},
		[updateConfig],
	);

	// 更新交易所配置
	const updateExchangeModeConfig = useCallback(
		(exchangeModeConfig: FuturesOrderNodeBacktestExchangeModeConfig) => {
			updateField("exchangeModeConfig", exchangeModeConfig);
		},
		[updateField],
	);

	// 更新订单配置列表
	const updateFuturesOrderConfigs = useCallback(
		(futuresOrderConfigs: FuturesOrderConfig[]) => {
			updateField("futuresOrderConfigs", futuresOrderConfigs);
		},
		[updateField],
	);

	// 添加订单配置
	const addFuturesOrderConfig = useCallback(
		(orderConfig: FuturesOrderConfig) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.futuresOrderConfigs || [];
				return {
					...prev,
					dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
					futuresOrderConfigs: [...currentConfigs, orderConfig],
				};
			});
		},
		[updateConfig],
	);

	// 更新指定订单配置
	const updateFuturesOrderConfig = useCallback(
		(index: number, orderConfig: FuturesOrderConfig) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.futuresOrderConfigs || [];
				const updatedConfigs = [...currentConfigs];
				updatedConfigs[index] = orderConfig;

				return {
					...prev,
					dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
					futuresOrderConfigs: updatedConfigs,
				};
			});
		},
		[updateConfig],
	);

	// 删除订单配置
	const removeFuturesOrderConfig = useCallback(
		(index: number) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.futuresOrderConfigs || [];
				const updatedConfigs = currentConfigs
					.filter((_, i) => i !== index)
					.map((order, newIndex) => ({
						...order,
						id: newIndex + 1, // 重新分配id，保持连续性
					}));

				return {
					...prev,
					dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
					futuresOrderConfigs: updatedConfigs,
				};
			});
		},
		[updateConfig],
	);

	return {
		// 状态
		config,

		// 基础配置方法
		setDefaultBacktestConfig,
		updateDataSource,
		updateTimeRange,
		updateExchangeModeConfig,
		updateFuturesOrderConfigs,

		// 订单配置管理方法
		addFuturesOrderConfig,
		updateFuturesOrderConfig,
		removeFuturesOrderConfig,
	};
};
