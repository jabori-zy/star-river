import { create } from "zustand";
import {
	type BacktestStrategyStatsChartConfig,
	defaultBacktestStrategyStatsChartConfig,
	type StrategyStatsChartConfig,
} from "@/types/chart/backtest-strategy-stats-chart";
import type { StrategyStatsName } from "@/types/statistics";

interface BacktestStatsChartConfigState {
	// State
	chartConfig: BacktestStrategyStatsChartConfig | null;
	isLoading: boolean;
	isSaving: boolean;

	// Basic operations
	setChartConfig: (config: BacktestStrategyStatsChartConfig) => void;
	getChartConfig: () => BacktestStrategyStatsChartConfig | null;
	getStatsChartConfig: (
		statsName: StrategyStatsName,
	) => StrategyStatsChartConfig | undefined;

	// Stats chart visibility management
	getStatsVisibility: (statsName: StrategyStatsName) => boolean;
	setStatsVisibility: (statsName: StrategyStatsName, visible: boolean) => void;
	toggleStatsVisibility: (statsName: StrategyStatsName) => void;

	// Stats chart add management
	addStats: (statsName: StrategyStatsName) => void;

	// Stats chart delete management
	removeStats: (statsName: StrategyStatsName) => void;

	// Stats chart config editing
	updateStatsColor: (statsName: StrategyStatsName, color: string) => void;

	// Reset config
	reset: () => void;
}

const useBacktestStatsChartConfigStore = create<BacktestStatsChartConfigState>(
	(set, get) => ({
		// Initial state
		chartConfig: defaultBacktestStrategyStatsChartConfig,

		isLoading: false,
		isSaving: false,

		// Basic operations
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
				(config) => config.seriesConfigs.statsName === statsName,
			);
		},

		// Stats chart visibility management
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
						: config,
				),
			};

			set({ chartConfig: newConfig });
		},

		toggleStatsVisibility: (statsName: StrategyStatsName) => {
			const currentVisibility = get().getStatsVisibility(statsName);
			get().setStatsVisibility(statsName, !currentVisibility);
		},

		// Stats chart add management, set isDelete to false
		addStats: (statsName: StrategyStatsName) => {
			const { chartConfig } = get();
			if (!chartConfig) return;

			const newConfig = {
				...chartConfig,
				statsChartConfigs: chartConfig.statsChartConfigs.map((config) =>
					config.seriesConfigs.statsName === statsName
						? { ...config, isDelete: false }
						: config,
				),
			};
			set({ chartConfig: newConfig });
		},

		// Stats chart delete management (soft delete - set to invisible)
		removeStats: (statsName: StrategyStatsName) => {
			const { chartConfig } = get();
			if (!chartConfig) return;

			const newConfig = {
				...chartConfig,
				statsChartConfigs: chartConfig.statsChartConfigs.map((config) =>
					config.seriesConfigs.statsName === statsName
						? { ...config, isDelete: true }
						: config,
				),
			};
			set({ chartConfig: newConfig });
		},

		// Stats chart config editing
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
						: config,
				),
			};

			set({ chartConfig: newConfig });
		},

		// Reset config
		reset: () => {
			set({
				chartConfig: null,
				isLoading: false,
				isSaving: false,
			});
		},
	}),
);

export { useBacktestStatsChartConfigStore };
