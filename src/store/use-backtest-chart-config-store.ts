import { toast } from "sonner";
import { create } from "zustand";
import {
	getBacktestStrategyChartConfig,
	getStrategyCacheKeys,
	updateBacktestStrategyChartConfig,
} from "@/service/strategy";
import type { IndicatorChartConfig, LayoutMode } from "@/types/chart";
import type {
	BacktestChartConfig,
	BacktestStrategyChartConfig,
} from "@/types/chart/backtest-chart";
import type {
	IndicatorKey,
	IndicatorKeyStr,
	KlineKey,
	KlineKeyStr,
} from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

interface BacktestChartConfigState {
	// State
	chartConfig: BacktestStrategyChartConfig;
	isLoading: boolean;
	isSaving: boolean;
	configLoaded: boolean;
	strategyId: number | null;

	// Basic operations
	setStrategyId: (strategyId: number | null) => void;
	setChartConfig: (config: BacktestStrategyChartConfig) => void;
	getChartConfig: (chartId: number) => BacktestChartConfig | undefined;
	setLoading: (loading: boolean) => void;
	setSaving: (saving: boolean) => void;
	setConfigLoaded: (loaded: boolean) => void;

	// Chart config operations
	loadChartConfig: (strategyId: number) => Promise<void>;
	saveChartConfig: () => Promise<void>;
	createDefaultChart: () => Promise<void>;

	// Chart management
	addChart: (klineKeyStr: string) => void;
	deleteChart: (chartId: number) => void;
	updateChart: (
		chartId: number,
		klineKeyStr: string,
		chartName: string,
	) => void;
	updateLayout: (layout: LayoutMode) => void;

	// Indicator management
	addIndicator: (
		chartId: number,
		indicatorChartConfig: IndicatorChartConfig,
	) => void;

	removeIndicator: (chartId: number, indicatorKeyStr: IndicatorKeyStr) => void;

	changeKline: (chartId: number, klineKeyStr: KlineKeyStr) => void;

	toggleIndicatorVisibility: (
		chartId: number,
		indicatorKeyStr: IndicatorKeyStr,
	) => void;

	getIndicatorVisibility: (
		chartId: number,
		indicatorKeyStr: IndicatorKeyStr,
	) => boolean;

	toggleKlineVisibility: (chartId: number) => void;
	getKlineVisibility: (chartId: number) => boolean;

	// Helper methods
	getKeys: () => Promise<Record<string, KlineKey | IndicatorKey>>;
	getChartById: (chartId: number) => BacktestChartConfig | undefined;
	_updateChart: (
		chartId: number,
		chartUpdater: (chart: BacktestChartConfig) => BacktestChartConfig,
	) => void;
	_validateAndFixChartConfig: (
		chartConfig: BacktestStrategyChartConfig,
		klineKeys: string[],
		indicatorKeys: string[],
	) => BacktestStrategyChartConfig;
	reset: () => void;
}

const initialState = {
	chartConfig: {
		charts: [],
		layout: "vertical" as LayoutMode,
	},
	isLoading: false,
	isSaving: false,
	configLoaded: false,
	strategyId: null,
};

export const useBacktestChartConfigStore = create<BacktestChartConfigState>(
	(set, get) => ({
		...initialState,

		// Basic operations
		setStrategyId: (strategyId) => set({ strategyId }),
		setChartConfig: (chartConfig) => set({ chartConfig }),
		setLoading: (isLoading) => set({ isLoading }),
		setSaving: (isSaving) => set({ isSaving }),
		setConfigLoaded: (configLoaded) => set({ configLoaded }),

		getChartConfig: (chartId) => {
			const { chartConfig } = get();
			return chartConfig.charts.find((chart) => chart.id === chartId);
		},

		// Get strategy cache keys
		getKeys: async () => {
			const { strategyId } = get();
			if (!strategyId) return {};

			try {
				const keys = await getStrategyCacheKeys(strategyId);
				const parsedKeyMap: Record<string, KlineKey | IndicatorKey> = {};

				keys.forEach((keyString) => {
					parsedKeyMap[keyString] = parseKey(keyString) as
						| KlineKey
						| IndicatorKey;
				});

				return parsedKeyMap;
			} catch (error) {
				console.error("Failed to get strategy cache keys:", error);
				return {};
			}
		},

		// Create default chart config
		createDefaultChart: async () => {
			const { getKeys } = get();

			try {
				const cacheKeys = await getKeys();
				if (cacheKeys && Object.keys(cacheKeys).length > 0) {
					// Filter out kline keys
					const klineKeys = Object.keys(cacheKeys).filter((key) => {
						const parsedKey = cacheKeys[key];
						return parsedKey.type === "kline";
					});

					if (klineKeys.length > 0) {
						// Create default chart using first kline key
						const firstKlineKey = klineKeys[0];
						const klineData = cacheKeys[firstKlineKey] as KlineKey;
						const defaultChart: BacktestChartConfig = {
							id: 1,
							chartName: `${klineData.symbol} ${klineData.interval}`,
							klineChartConfig: {
								klineKeyStr: firstKlineKey,
								upColor: "#FF0000",
								downColor: "#0000FF",
							},
							indicatorChartConfigs: [],
						};

						console.log("Creating default chart:", defaultChart);
						set({
							chartConfig: {
								charts: [defaultChart],
								layout: "horizontal" as LayoutMode,
							},
						});
						return;
					}
				}

				// No available kline key, use empty config
				console.log("No available data, using empty config");
				set({
					chartConfig: {
						charts: [],
						layout: "vertical",
					},
				});
			} catch (error) {
				console.error("Failed to create default chart:", error);
				// Use empty config when creation fails
				set({
					chartConfig: {
						charts: [],
						layout: "vertical",
					},
				});
			}
		},

		// Load chart config from backend
		loadChartConfig: async (strategyId: number) => {
			try {
				set({ isLoading: true, strategyId });
				const chartConfig = await getBacktestStrategyChartConfig(strategyId);

				const keys = await get().getKeys();
				// console.log("Retrieved cache keys:", keys);

				// Check if cache keys are empty
				if (keys && Object.keys(keys).length > 0) {
					// Separate kline and indicator keys in one loop
					const klineKeys: string[] = [];
					const indicatorKeys: string[] = [];

					Object.keys(keys).forEach((k) => {
						const parsedKey = keys[k];
						if (parsedKey.type === "kline") {
							klineKeys.push(k);
						} else if (parsedKey.type === "indicator") {
							indicatorKeys.push(k);
						}
					});

					// If chartConfig is not empty, validate and fix
					if (chartConfig) {
						// Check if backend returned config is valid
						// Does it have charts field, and is charts field an array, and is charts field length greater than 0
						const hasValidConfig =
							chartConfig.charts &&
							Array.isArray(chartConfig.charts) &&
							chartConfig.charts.length > 0;
						// console.log("Is backend returned chart config valid:", hasValidConfig);

						if (hasValidConfig) {
							// Use backend config, validate and fix config
							const { _validateAndFixChartConfig } = get();
							const validatedConfig = _validateAndFixChartConfig(
								chartConfig,
								klineKeys,
								indicatorKeys,
							);
							// console.log("Validated and fixed chart config: ", validatedConfig);
							set({ chartConfig: validatedConfig });
						}
					} else {
						// Backend config is invalid (null, empty array or non-existent), create default chart
						const { createDefaultChart } = get();
						await createDefaultChart();
					}
				} else {
					// Backend config is invalid (null, empty array or non-existent), create default chart
					const { createDefaultChart } = get();
					await createDefaultChart();
				}
				set({ configLoaded: true });
			} catch (error) {
				console.error("Failed to get chart config:", error);
				set({ configLoaded: true });
				// Try to create default chart when loading fails
				try {
					const { createDefaultChart } = get();
					await createDefaultChart();
				} catch (defaultError) {
					console.error("Failed to create default chart as well:", defaultError);
				}
				toast.error("Failed to get chart config", {
					description: "Using default config, you can re-add charts",
					duration: 4000,
				});
			} finally {
				set({ isLoading: false });
			}
		},

		// Save chart config to backend
		saveChartConfig: async () => {
			const { strategyId, chartConfig } = get();
			if (!strategyId) return;

			try {
				set({ isSaving: true });
				// Before saving, remove indicators with isDelete true from indicatorChartConfigs in chartConfig
				const updatedChartConfig = {
					...chartConfig,
					charts: chartConfig.charts.map((chart) => ({
						...chart,
						indicatorChartConfigs: chart.indicatorChartConfigs.filter(
							(config) => !config.isDelete,
						),
					})),
				};
				await updateBacktestStrategyChartConfig(strategyId, updatedChartConfig);
				toast.success("Chart config saved successfully");
			} catch (error) {
				console.error("Failed to save chart config:", error);
				toast.error("Failed to save chart config", {
					description: error instanceof Error ? error.message : "Unknown error",
					duration: 4000,
				});
			} finally {
				set({ isSaving: false });
			}
		},

		// Add chart
		addChart: (klineKeyStr) => {
			const { chartConfig } = get();
			const maxChartId = Math.max(
				...chartConfig.charts.map((chart) => chart.id),
				0,
			);

			const klineKey = parseKey(klineKeyStr) as KlineKey;
			const newChart: BacktestChartConfig = {
				id: maxChartId + 1,
				chartName: `${klineKey.symbol} ${klineKey.interval}`,
				klineChartConfig: {
					klineKeyStr: klineKeyStr,
					upColor: "#FF0000",
					downColor: "#0000FF",
				},
				indicatorChartConfigs: [],
			};

			set({
				chartConfig: {
					...chartConfig,
					charts: [...chartConfig.charts, newChart],
				},
			});
			console.log("Current chart config: ", get().chartConfig);
		},

		// Delete chart
		deleteChart: (chartId) => {
			const { chartConfig } = get();

			// Check if this is the last chart
			if (chartConfig.charts.length === 1) {
				toast.error("At least one chart must be kept");
				return;
			}

			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.filter((chart) => chart.id !== chartId),
				},
			});
		},

		// Update chart
		updateChart: (chartId, klineCacheKeyStr, chartName) => {
			const { chartConfig } = get();

			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.map((chart) =>
						chart.id === chartId
							? {
									...chart,
									chartName,
									klineChartConfig: {
										...chart.klineChartConfig,
										klineKeyStr: klineCacheKeyStr,
									},
								}
							: chart,
					),
				},
			});
		},

		// Update layout mode
		updateLayout: (layout) => {
			const { chartConfig } = get();
			set({
				chartConfig: {
					...chartConfig,
					layout,
				},
			});
		},

		// Generic chart update function
		_updateChart: (
			chartId: number,
			chartUpdater: (chart: BacktestChartConfig) => BacktestChartConfig,
		) => {
			const { chartConfig } = get();
			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.map((chart) =>
						chart.id === chartId ? chartUpdater(chart) : chart,
					),
				},
			});
		},

		// Add indicator
		addIndicator: (chartId, indicatorChartConfig) => {
			const indicatorKey = parseKey(
				indicatorChartConfig.indicatorKeyStr,
			) as IndicatorKey;
			const { chartConfig, _updateChart } = get();

			// Check if target chart exists
			const targetChart = chartConfig.charts.find(
				(chart) => chart.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return;
			}

			const { indicatorKeyStr } = indicatorChartConfig;
			const indicatorName = indicatorKey.indicatorType.toUpperCase();

			// Check if indicator already exists and is not deleted
			const existingIndicator = targetChart.indicatorChartConfigs.find(
				(config) =>
					config.indicatorKeyStr === indicatorKeyStr && !config.isDelete,
			);

			if (existingIndicator) {
				toast.warning(`${indicatorName} already exists`, { duration: 2000 });
				return;
			}

			// Check if a deleted indicator with the same name exists
			const deletedIndicator = targetChart.indicatorChartConfigs.find(
				(config) =>
					config.indicatorKeyStr === indicatorKeyStr && config.isDelete,
			);

			if (deletedIndicator) {
				// Restore deleted indicator
				_updateChart(chartId, (chart) => ({
					...chart,
					indicatorChartConfigs: chart.indicatorChartConfigs.map((config) =>
						config.indicatorKeyStr === indicatorKeyStr
							? { ...config, isDelete: false }
							: config,
					),
				}));
			} else {
				// Add new indicator
				_updateChart(chartId, (chart) => ({
					...chart,
					indicatorChartConfigs: [
						...chart.indicatorChartConfigs,
						indicatorChartConfig,
					],
				}));
			}

			toast.success(`${indicatorName} added successfully`, { duration: 2000 });
		},

		// Remove indicator
		removeIndicator: (chartId, indicatorKeyStr) => {
			const { _updateChart } = get();

			// Soft delete: only set isDelete to true, don't remove from array
			_updateChart(chartId, (chart) => ({
				...chart,
				indicatorChartConfigs: chart.indicatorChartConfigs.map((config) =>
					config.indicatorKeyStr === indicatorKeyStr
						? { ...config, isDelete: true }
						: config,
				),
			}));
			console.log("Current chart config: ", get().chartConfig);
		},

		// Switch kline, when switching kline, all indicators of the chart corresponding to chartId need to be deleted (soft delete)
		// The chart title corresponding to chartId also needs to be modified
		changeKline: (chartId, klineKeyStr) => {
			const { chartConfig } = get();
			// Delete all indicators
			chartConfig.charts.forEach((chart) => {
				if (chart.id === chartId) {
					chart.indicatorChartConfigs = chart.indicatorChartConfigs.map(
						(config) => ({ ...config, isDelete: true }),
					);
				}
			});
			const klineKey = parseKey(klineKeyStr) as KlineKey;
			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.map((chart) =>
						chart.id === chartId
							? {
									...chart,
									klineChartConfig: { ...chart.klineChartConfig, klineKeyStr },
									chartName: `${klineKey.symbol} ${klineKey.interval}`,
								}
							: chart,
					),
				},
			});
			console.log("Current chart config: ", get().chartConfig);
		},

		// Get chart by ID
		getChartById: (chartId) => {
			const { chartConfig } = get();
			return chartConfig.charts.find((chart) => chart.id === chartId);
		},

		// Validate and fix chart config
		_validateAndFixChartConfig: (chartConfig, klineKeys, indicatorKeys) => {
			const updatedCharts = chartConfig.charts.map((chart) => {
				const klineChartKey = chart.klineChartConfig.klineKeyStr;

				// Create new chart config object
				const updatedChart = { ...chart };

				// Check if klineChartKey is in klineKeys
				// If not, replace the chart's key with the first one in klineKeys
				if (!klineKeys.includes(klineChartKey)) {
					if (klineKeys.length === 0) {
						console.warn("klineKeys is empty, cannot fix missing klineKey");
					} else {
						const klineKey = parseKey(klineKeys[0]) as KlineKey;
						updatedChart.chartName = `${klineKey.symbol} ${klineKey.interval}`;
						updatedChart.klineChartConfig = {
							...chart.klineChartConfig,
							klineKeyStr: klineKeys[0],
						};
					}
				}

				// Process indicator config
				updatedChart.indicatorChartConfigs = chart.indicatorChartConfigs.map(
					(indicator_chart) => {
						const indicatorChartKey = indicator_chart.indicatorKeyStr;
						// Check if indicatorChartKey is in indicatorKeys
						if (!indicatorKeys.includes(indicatorChartKey)) {
							// If not, delete this indicator
							return { ...indicator_chart, isDelete: true };
						}
						return indicator_chart;
					},
				);

				return updatedChart;
			});

			return {
				charts: updatedCharts,
				layout: chartConfig.layout || "vertical",
			};
		},

		toggleKlineVisibility: (chartId) => {
			const { chartConfig } = get();
			const targetChart = chartConfig.charts.find(
				(chart) => chart.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return;
			}

			const updatedKlineChartConfig = {
				...targetChart.klineChartConfig,
				visible:
					targetChart.klineChartConfig.visible === undefined
						? false
						: !targetChart.klineChartConfig.visible,
			};

			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.map((chart) =>
						chart.id === chartId
							? { ...chart, klineChartConfig: updatedKlineChartConfig }
							: chart,
					),
				},
			});
		},

		getKlineVisibility: (chartId) => {
			const { chartConfig } = get();
			const targetChart = chartConfig.charts.find(
				(chart) => chart.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return false;
			}

			return (
				targetChart.klineChartConfig.visible === true ||
				targetChart.klineChartConfig.visible === undefined
			);
		},

		toggleIndicatorVisibility: (chartId, indicatorKeyStr) => {
			const { chartConfig } = get();
			const targetChart = chartConfig.charts.find(
				(chart) => chart.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return;
			}

			const indicatorChartConfig = targetChart.indicatorChartConfigs.find(
				(config) => config.indicatorKeyStr === indicatorKeyStr,
			);

			if (!indicatorChartConfig) {
				console.warn(`Indicator ${indicatorKeyStr} does not exist`);
				return;
			}

			const updatedIndicatorChartConfig = {
				...indicatorChartConfig,
				visible:
					indicatorChartConfig.visible === undefined
						? false
						: !indicatorChartConfig.visible, // If visible is undefined, default to not showing
			};

			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.map((chart) =>
						chart.id === chartId
							? {
									...chart,
									indicatorChartConfigs: chart.indicatorChartConfigs.map(
										(config) =>
											config.indicatorKeyStr === indicatorKeyStr
												? updatedIndicatorChartConfig
												: config,
									),
								}
							: chart,
					),
				},
			});
		},

		getIndicatorVisibility: (chartId, indicatorKeyStr) => {
			const { chartConfig } = get();
			const targetChart = chartConfig.charts.find(
				(chart) => chart.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return false;
			}

			const indicatorChartConfig = targetChart.indicatorChartConfigs.find(
				(config) => config.indicatorKeyStr === indicatorKeyStr,
			);

			if (!indicatorChartConfig) {
				console.warn(`Indicator ${indicatorKeyStr} does not exist`);
				return false;
			}

			return (
				indicatorChartConfig.visible === true ||
				indicatorChartConfig.visible === undefined
			);
		},

		// Reset state
		reset: () => set(initialState),
	}),
);
