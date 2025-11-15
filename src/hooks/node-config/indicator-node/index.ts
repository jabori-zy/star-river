import { createDefaultIndicatorBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";

/**
 * Create default indicator node data
 */
export const createDefaultIndicatorNodeData = (
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
		backtestConfig: createDefaultIndicatorBacktestConfig(),
	};
};
