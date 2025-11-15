import { createDefaultPositionBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";

/**
 * Create default position management node data
 */
export const createDefaultPositionManagementNodeData = (
	strategyId: number,
	strategyName: string,
	nodeName: string,
) => {
	return {
		strategyId,
		strategyName,
		nodeName,
		liveConfig: null,
		simulateConfig: null,
		backtestConfig: createDefaultPositionBacktestConfig(),
	};
};
