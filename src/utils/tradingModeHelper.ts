import { TradeMode } from "@/types/node";
import { StrategyLiveConfig, StrategySimulateConfig } from "@/types/strategy";

/**
 * 安全获取实盘交易配置中的账户列表
 * @param config - 实盘交易配置
 * @returns 账户列表或空数组
 */
export function getSafeLiveAccounts(config: StrategyLiveConfig) {
	if (config && config.liveAccounts && Array.isArray(config.liveAccounts)) {
		return config.liveAccounts;
	}
	return [];
}

/**
 * 安全获取模拟交易配置中的账户列表
 * @param config - 模拟交易配置
 * @returns 账户列表或空数组
 */
export function getSafeSimulateAccounts(config: StrategySimulateConfig) {
	if (
		config &&
		config.simulateAccounts &&
		Array.isArray(config.simulateAccounts)
	) {
		return config.simulateAccounts;
	}
	return [];
}

/**
 * 获取交易模式名称
 * @param mode - 交易模式
 * @returns 交易模式的中文名称
 */
export function getTradingModeName(mode: TradeMode) {
	switch (mode) {
		case TradeMode.LIVE:
			return "实盘交易";
		case TradeMode.SIMULATE:
			return "模拟交易";
		case TradeMode.BACKTEST:
			return "回测交易";
		default:
			return "未知模式";
	}
}

/**
 * 获取交易模式颜色
 * @param mode - 交易模式
 * @returns 交易模式对应的CSS类名
 */
export function getTradingModeColor(mode: TradeMode) {
	switch (mode) {
		case TradeMode.LIVE:
			return "bg-green-100 text-green-800";
		case TradeMode.SIMULATE:
			return "bg-blue-100 text-blue-800";
		case TradeMode.BACKTEST:
			return "bg-purple-100 text-purple-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
}

/**
 * 获取交易模式描述
 * @param mode - 交易模式
 * @returns 交易模式的详细描述
 */
export function getTradingModeDescription(mode: TradeMode) {
	switch (mode) {
		case TradeMode.LIVE:
			return "使用真实资金进行交易";
		case TradeMode.SIMULATE:
			return "使用虚拟资金进行模拟交易，使用实时行情数据";
		case TradeMode.BACKTEST:
			return "使用历史数据进行快速迭代策略测试";
		default:
			return "";
	}
}
