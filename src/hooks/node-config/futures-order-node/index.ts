import { createDefaultFuturesOrderBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";

/**
 * Create default futures order node data
 */
export const createDefaultFuturesOrderNodeData = (
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
		backtestConfig: createDefaultFuturesOrderBacktestConfig(),
	};
};
