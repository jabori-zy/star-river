import { createDefaultKlineBacktestConfig } from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";

/**
 * 创建默认的 K线节点数据
 */
export const createDefaultKlineNodeData = (
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
		backtestConfig: createDefaultKlineBacktestConfig(),
	};
};
