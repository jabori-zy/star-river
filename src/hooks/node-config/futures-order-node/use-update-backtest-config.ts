import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import type {
	FuturesOrderNodeBacktestConfig,
	FuturesOrderNodeBacktestExchangeModeConfig,
} from "@/types/node/futures-order-node";
import type { FuturesOrderConfig } from "@/types/order";
import { BacktestDataSource, type TimeRange } from "@/types/strategy";

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

	// 监听 config 变化，同步到 ReactFlow
	useEffect(() => {
		if (config) {
			updateNodeData(id, {
				backtestConfig: config,
			});
		}
	}, [config, id, updateNodeData]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: FuturesOrderNodeBacktestConfig | undefined,
			) => FuturesOrderNodeBacktestConfig,
		) => {
			setConfig((prevConfig) => updater(prevConfig));
		},
		[],
	);

	// 默认配置值
	const getDefaultConfig = useCallback(
		(prev?: FuturesOrderNodeBacktestConfig): FuturesOrderNodeBacktestConfig => {
			const { backtestConfig: startNodeBacktestConfig } =
				useStartNodeDataStore.getState();
			const timeRange = startNodeBacktestConfig?.exchangeModeConfig?.timeRange;

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
