import { create } from "zustand";
import {
	LiveTradeConfig,
	SimulateTradeConfig,
	BacktestTradeConfig,
} from "@/types/start_node";

interface TradingConfigState {
	// 实盘交易配置
	liveModeConfig: LiveTradeConfig | null;
	// 设置实盘交易配置
	setLiveModeConfig: (config: LiveTradeConfig) => void;

	// 模拟交易配置
	simulateModeConfig: SimulateTradeConfig | null;
	// 设置模拟交易配置
	setSimulateModeConfig: (config: SimulateTradeConfig) => void;

	// 回测交易配置
	backtestModeConfig: BacktestTradeConfig | null;
	// 设置回测交易配置
	setBacktestModeConfig: (config: BacktestTradeConfig) => void;
}

// 创建全局状态管理
const useTradingConfigStore = create<TradingConfigState>((set) => ({
	// 实盘交易配置默认为null
	liveModeConfig: null,
	// 设置实盘交易配置
	setLiveModeConfig: (config: LiveTradeConfig) =>
		set({
			liveModeConfig: config,
		}),

	// 模拟交易配置默认为null
	simulateModeConfig: null,
	// 设置模拟交易配置
	setSimulateModeConfig: (config: SimulateTradeConfig) =>
		set({
			simulateModeConfig: config,
		}),

	// 回测交易配置默认为null
	backtestModeConfig: null,
	// 设置回测交易配置
	setBacktestModeConfig: (config: BacktestTradeConfig) =>
		set({
			backtestModeConfig: config,
		}),
}));

export default useTradingConfigStore;
