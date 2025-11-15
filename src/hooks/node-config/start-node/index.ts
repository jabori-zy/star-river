import {createDefaultBacktestConfig} from "./use-update-backtest-config";
export { useBacktestConfig } from "./use-update-backtest-config";

/**
 * 创建默认的开始节点配置
 */
export const createDefaultStartNodeData = (
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
		backtestConfig: createDefaultBacktestConfig(),
	};
};