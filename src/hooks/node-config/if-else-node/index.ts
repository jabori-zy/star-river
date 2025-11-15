import { createDefaultIfElseBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";

/**
 * Create default if-else node data
 */
export const createDefaultIfElseNodeData = (
	strategyId: number,
	strategyName: string,
	nodeName: string,
	nodeId: string,
) => {
	return {
		strategyId,
		strategyName,
		nodeName,
		liveConfig: null,
		simulateConfig: null,
		backtestConfig: createDefaultIfElseBacktestConfig(nodeId),
	};
};
