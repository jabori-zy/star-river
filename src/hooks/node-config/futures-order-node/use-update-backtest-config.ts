import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { ConditionTrigger } from "@/types/condition-trigger";
import type {
	FuturesOrderNodeBacktestConfig,
	FuturesOrderNodeBacktestExchangeModeConfig,
	FuturesOrderNodeData,
} from "@/types/node/futures-order-node";
import type { FuturesOrderConfig } from "@/types/order";
import { BacktestDataSource, type TimeRange } from "@/types/strategy";

/**
 * Create default futures order node backtest config
 */
export const createDefaultFuturesOrderBacktestConfig =
	(): FuturesOrderNodeBacktestConfig => {
		return {
			dataSource: BacktestDataSource.EXCHANGE,
			exchangeModeConfig: {
				timeRange: {
					startDate: "",
					endDate: "",
				},
			},
			futuresOrderConfigs: [],
		};
	};

interface UseBacktestConfigProps {
	id: string; // Node ID
}

export const useBacktestConfig = ({ id }: UseBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as FuturesOrderNodeData;
	const backtestConfig = nodeData?.backtestConfig ?? null;

	/**
	 * Generic update function: use Immer to simplify nested updates
	 */
	const updateConfig = useCallback(
		(updater: (draft: FuturesOrderNodeBacktestConfig) => void) => {
			const currentConfig =
				backtestConfig ?? createDefaultFuturesOrderBacktestConfig();
			const newConfig = produce(currentConfig, updater);

			updateNodeData(id, { backtestConfig: newConfig });
		},
		[backtestConfig, id, updateNodeData],
	);

	// ==================== Basic Config Updates ====================

	const setDefaultBacktestConfig = useCallback(() => {
		const defaultConfig = createDefaultFuturesOrderBacktestConfig();
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
		(exchangeModeConfig: FuturesOrderNodeBacktestExchangeModeConfig) => {
			updateConfig((draft) => {
				draft.exchangeModeConfig = exchangeModeConfig;
			});
		},
		[updateConfig],
	);

	const updateTimeRange = useCallback(
		(timeRange: TimeRange) => {
			updateConfig((draft) => {
				if (!draft.exchangeModeConfig) {
					draft.exchangeModeConfig = {
						timeRange,
					};
				} else {
					draft.exchangeModeConfig.timeRange = timeRange;
				}
			});
		},
		[updateConfig],
	);

	// ==================== Futures Order Configs Updates ====================

	const updateFuturesOrderConfigs = useCallback(
		(futuresOrderConfigs: FuturesOrderConfig[]) => {
			updateConfig((draft) => {
				draft.futuresOrderConfigs = futuresOrderConfigs;
			});
		},
		[updateConfig],
	);

	const addFuturesOrderConfig = useCallback(
		(orderConfig: FuturesOrderConfig) => {
			updateConfig((draft) => {
				draft.futuresOrderConfigs.push(orderConfig);
			});
		},
		[updateConfig],
	);

	const updateFuturesOrderConfig = useCallback(
		(index: number, orderConfig: FuturesOrderConfig) => {
			updateConfig((draft) => {
				if (index >= 0 && index < draft.futuresOrderConfigs.length) {
					draft.futuresOrderConfigs[index] = orderConfig;
				}
			});
		},
		[updateConfig],
	);

	const removeFuturesOrderConfig = useCallback(
		(index: number) => {
			updateConfig((draft) => {
				// Remove the order at the specified index
				draft.futuresOrderConfigs.splice(index, 1);

				// Reassign IDs to maintain continuity (currently commented out)
				// draft.futuresOrderConfigs = draft.futuresOrderConfigs.map(
				// 	(order, newIndex) => ({
				// 		...order,
				// 		id: newIndex + 1,
				// 	}),
				// );
			});
		},
		[updateConfig],
	);

	const updateOrderTriggerConfigById = useCallback(
		(orderConfigId: number, triggerConfig: ConditionTrigger | null) => {
			updateConfig((draft) => {
				const orderConfig = draft.futuresOrderConfigs.find(
					(config) => config.orderConfigId === orderConfigId,
				);
				if (orderConfig) {
					orderConfig.triggerConfig = triggerConfig;
				}
			});
		},
		[updateConfig],
	);

	return {
		backtestConfig,
		setDefaultBacktestConfig,
		updateDataSource,
		updateTimeRange,
		updateExchangeModeConfig,
		updateFuturesOrderConfigs,
		addFuturesOrderConfig,
		updateFuturesOrderConfig,
		removeFuturesOrderConfig,
		updateOrderTriggerConfigById,
	};
};
