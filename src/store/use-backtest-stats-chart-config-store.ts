import { create } from "zustand";
import { defaultBacktestStrategyStatsChartConfig, type BacktestStrategyStatsChartConfig, type StrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import type { StrategyStatsName } from "@/types/statistics";

interface BacktestStatsChartConfigState {
	// 状态
	chartConfig: BacktestStrategyStatsChartConfig | null;
	isLoading: boolean;
	isSaving: boolean;

	// 基础操作
	setChartConfig: (config: BacktestStrategyStatsChartConfig) => void;
	getChartConfig: () => BacktestStrategyStatsChartConfig | null;
	getStatsChartConfig: (statsName: StrategyStatsName) => StrategyStatsChartConfig | undefined;
	
	// 统计图表可见性管理
	getStatsVisibility: (statsName: StrategyStatsName) => boolean;
	setStatsVisibility: (statsName: StrategyStatsName, visible: boolean) => void;
	toggleStatsVisibility: (statsName: StrategyStatsName) => void;
	
	// 统计图表删除管理
	removeStats: (statsName: StrategyStatsName) => void;
	
	// 统计图表配置编辑
	updateStatsColor: (statsName: StrategyStatsName, color: string) => void;
	
	// 重置配置
	reset: () => void;
}

const useBacktestStatsChartConfigStore = create<BacktestStatsChartConfigState>((set, get) => ({
	// 初始状态
	chartConfig: defaultBacktestStrategyStatsChartConfig,
	
	isLoading: false,
	isSaving: false,

	// 基础操作
	setChartConfig: (config: BacktestStrategyStatsChartConfig) => {
		set({ chartConfig: config });
	},

	getChartConfig: () => {
		const { chartConfig } = get();
		return chartConfig;
	},

	getStatsChartConfig: (statsName: StrategyStatsName) => {
		const { chartConfig } = get();
		return chartConfig?.statsChartConfigs.find(
			(config) => config.seriesConfigs.statsName === statsName
		);
	},

	// 统计图表可见性管理
	getStatsVisibility: (statsName: StrategyStatsName) => {
		const config = get().getStatsChartConfig(statsName);
		return config?.visible ?? true;
	},

	setStatsVisibility: (statsName: StrategyStatsName, visible: boolean) => {
		const { chartConfig } = get();
		if (!chartConfig) return;

		const newConfig = {
			...chartConfig,
			statsChartConfigs: chartConfig.statsChartConfigs.map((config) =>
				config.seriesConfigs.statsName === statsName
					? { ...config, visible }
					: config
			),
		};
		
		set({ chartConfig: newConfig });
	},

	toggleStatsVisibility: (statsName: StrategyStatsName) => {
		const currentVisibility = get().getStatsVisibility(statsName);
		get().setStatsVisibility(statsName, !currentVisibility);
	},

	// 统计图表删除管理（软删除 - 设置为不可见）
	removeStats: (statsName: StrategyStatsName) => {
		get().setStatsVisibility(statsName, false);
	},

	// 统计图表配置编辑
	updateStatsColor: (statsName: StrategyStatsName, color: string) => {
		const { chartConfig } = get();
		if (!chartConfig) return;

		const newConfig = {
			...chartConfig,
			statsChartConfigs: chartConfig.statsChartConfigs.map((config) =>
				config.seriesConfigs.statsName === statsName
					? {
						...config,
						seriesConfigs: {
							...config.seriesConfigs,
							color,
						},
					}
					: config
			),
		};
		
		set({ chartConfig: newConfig });
	},

	// 重置配置
	reset: () => {
		set({
			chartConfig: null,
			isLoading: false,
			isSaving: false,
		});
	},
}));

export { useBacktestStatsChartConfigStore };