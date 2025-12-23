import { produce } from "immer";
import { toast } from "sonner";
import { create } from "zustand";
import {
	getBacktestStrategyChartConfig,
	getStrategyCacheKeys,
	updateBacktestStrategyChartConfig,
} from "@/service/strategy";
import type {
	IndicatorChartConfig,
	LayoutMode,
	OperationChartConfig,
} from "@/types/chart";
import type {
	BacktestChartConfig,
	BacktestStrategyChartConfig,
} from "@/types/chart/backtest-chart";
import type {
	IndicatorKey,
	IndicatorKeyStr,
	KlineKey,
	KlineKeyStr,
	OperationKey,
	OperationKeyStr,
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

	// Operation management
	addOperation: (
		chartId: number,
		operationChartConfig: OperationChartConfig,
	) => void;
	removeOperation: (chartId: number, operationKeyStr: OperationKeyStr) => void;
	toggleOperationVisibility: (
		chartId: number,
		operationKeyStr: OperationKeyStr,
	) => void;
	getOperationVisibility: (
		chartId: number,
		operationKeyStr: OperationKeyStr,
	) => boolean;

	// Kline visibility
	toggleKlineVisibility: (chartId: number) => void;
	getKlineVisibility: (chartId: number) => boolean;

	// Helper methods
	getKeys: () => Promise<
		Record<string, KlineKey | IndicatorKey | OperationKey>
	>;
	getChartById: (chartId: number) => BacktestChartConfig | undefined;
	_updateChartConfig: (
		updater: (draft: BacktestStrategyChartConfig) => void,
	) => void;
	_validateAndFixChartConfig: (
		chartConfig: BacktestStrategyChartConfig,
		klineKeys: string[],
		indicatorKeys: string[],
		operationKeys: string[],
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
			return get().chartConfig.charts.find((chart) => chart.id === chartId);
		},

		// Generic chart config update function using immer
		_updateChartConfig: (updater) => {
			set({ chartConfig: produce(get().chartConfig, updater) });
		},

		// Get strategy cache keys
		getKeys: async () => {
			const { strategyId } = get();
			if (!strategyId) return {};

			try {
				const keys = await getStrategyCacheKeys(strategyId);
				const parsedKeyMap: Record<
					string,
					KlineKey | IndicatorKey | OperationKey
				> = {};

				for (const keyString of keys) {
					parsedKeyMap[keyString] = parseKey(keyString) as
						| KlineKey
						| IndicatorKey
						| OperationKey;
				}

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
					const klineKeys = Object.keys(cacheKeys).filter(
						(key) => cacheKeys[key].type === "kline",
					);

					if (klineKeys.length > 0) {
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
							operationChartConfigs: [],
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

				console.log("No available data, using empty config");
				set({ chartConfig: { charts: [], layout: "vertical" } });
			} catch (error) {
				console.error("Failed to create default chart:", error);
				set({ chartConfig: { charts: [], layout: "vertical" } });
			}
		},

		// Load chart config from backend
		loadChartConfig: async (strategyId: number) => {
			try {
				set({ isLoading: true, strategyId });
				const chartConfig = await getBacktestStrategyChartConfig(strategyId);
				const keys = await get().getKeys();

				if (keys && Object.keys(keys).length > 0) {
					const klineKeys: string[] = [];
					const indicatorKeys: string[] = [];
					const operationKeys: string[] = [];

					for (const k of Object.keys(keys)) {
						const parsedKey = keys[k];
						if (parsedKey.type === "kline") {
							klineKeys.push(k);
						} else if (parsedKey.type === "indicator") {
							indicatorKeys.push(k);
						} else if (parsedKey.type === "operation") {
							operationKeys.push(k);
						}
					}

					if (chartConfig) {
						const hasValidConfig =
							chartConfig.charts &&
							Array.isArray(chartConfig.charts) &&
							chartConfig.charts.length > 0;

						if (hasValidConfig) {
							const validatedConfig = get()._validateAndFixChartConfig(
								chartConfig,
								klineKeys,
								indicatorKeys,
								operationKeys,
							);
							set({ chartConfig: validatedConfig });
						}
					} else {
						await get().createDefaultChart();
					}
				} else {
					await get().createDefaultChart();
				}
				set({ configLoaded: true });
			} catch (error) {
				console.error("Failed to get chart config:", error);
				set({ configLoaded: true });
				try {
					await get().createDefaultChart();
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
				// Before saving, remove indicators and operations with isDelete true
				const updatedChartConfig = produce(chartConfig, (draft) => {
					for (const chart of draft.charts) {
						chart.indicatorChartConfigs = chart.indicatorChartConfigs.filter(
							(config) => !config.isDelete,
						);
						chart.operationChartConfigs = chart.operationChartConfigs.filter(
							(config) => !config.isDelete,
						);
					}
				});
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
			const klineKey = parseKey(klineKeyStr) as KlineKey;

			get()._updateChartConfig((draft) => {
				const maxChartId = Math.max(...draft.charts.map((c) => c.id), 0);
				draft.charts.push({
					id: maxChartId + 1,
					chartName: `${klineKey.symbol} ${klineKey.interval}`,
					klineChartConfig: {
						klineKeyStr,
						upColor: "#FF0000",
						downColor: "#0000FF",
					},
					indicatorChartConfigs: [],
					operationChartConfigs: [],
				});
			});
			console.log("Current chart config: ", get().chartConfig);
		},

		// Delete chart
		deleteChart: (chartId) => {
			const { chartConfig, _updateChartConfig } = get();

			if (chartConfig.charts.length === 1) {
				toast.error("At least one chart must be kept");
				return;
			}

			_updateChartConfig((draft) => {
				const index = draft.charts.findIndex((c) => c.id === chartId);
				if (index !== -1) {
					draft.charts.splice(index, 1);
				}
			});
		},

		// Update chart
		updateChart: (chartId, klineCacheKeyStr, chartName) => {
			get()._updateChartConfig((draft) => {
				const chart = draft.charts.find((c) => c.id === chartId);
				if (chart) {
					chart.chartName = chartName;
					chart.klineChartConfig.klineKeyStr = klineCacheKeyStr;
				}
			});
		},

		// Update layout mode
		updateLayout: (layout) => {
			get()._updateChartConfig((draft) => {
				draft.layout = layout;
			});
		},

		// Add indicator
		addIndicator: (chartId, indicatorChartConfig) => {
			const { chartConfig, _updateChartConfig } = get();
			const targetChart = chartConfig.charts.find((c) => c.id === chartId);

			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return;
			}

			const { indicatorKeyStr } = indicatorChartConfig;
			const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
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

			_updateChartConfig((draft) => {
				const chart = draft.charts.find((c) => c.id === chartId);
				if (!chart) return;

				if (deletedIndicator) {
					// Restore deleted indicator
					const config = chart.indicatorChartConfigs.find(
						(c) => c.indicatorKeyStr === indicatorKeyStr,
					);
					if (config) config.isDelete = false;
				} else {
					// Add new indicator
					chart.indicatorChartConfigs.push(indicatorChartConfig);
				}
			});

			toast.success(`${indicatorName} added successfully`, { duration: 2000 });
		},

		// Remove indicator
		removeIndicator: (chartId, indicatorKeyStr) => {
			get()._updateChartConfig((draft) => {
				const chart = draft.charts.find((c) => c.id === chartId);
				if (!chart) return;

				const config = chart.indicatorChartConfigs.find(
					(c) => c.indicatorKeyStr === indicatorKeyStr,
				);
				if (config) config.isDelete = true;
			});
			console.log("Current chart config: ", get().chartConfig);
		},

		// Switch kline
		changeKline: (chartId, klineKeyStr) => {
			const klineKey = parseKey(klineKeyStr) as KlineKey;

			get()._updateChartConfig((draft) => {
				const chart = draft.charts.find((c) => c.id === chartId);
				if (!chart) return;

				// Soft delete all indicators and operations
				for (const config of chart.indicatorChartConfigs) {
					config.isDelete = true;
				}
				for (const config of chart.operationChartConfigs) {
					config.isDelete = true;
				}

				// Update kline and chart name
				chart.klineChartConfig.klineKeyStr = klineKeyStr;
				chart.chartName = `${klineKey.symbol} ${klineKey.interval}`;
			});
			console.log("Current chart config: ", get().chartConfig);
		},

		// Get chart by ID
		getChartById: (chartId) => {
			return get().chartConfig.charts.find((chart) => chart.id === chartId);
		},

		// Validate and fix chart config
		_validateAndFixChartConfig: (
			chartConfig,
			klineKeys,
			indicatorKeys,
			operationKeys,
		) => {
			return produce(chartConfig, (draft) => {
				for (const chart of draft.charts) {
					const klineChartKey = chart.klineChartConfig.klineKeyStr;

					// Fix invalid kline key
					if (!klineKeys.includes(klineChartKey)) {
						if (klineKeys.length === 0) {
							console.warn("klineKeys is empty, cannot fix missing klineKey");
						} else {
							const klineKey = parseKey(klineKeys[0]) as KlineKey;
							chart.chartName = `${klineKey.symbol} ${klineKey.interval}`;
							chart.klineChartConfig.klineKeyStr = klineKeys[0];
						}
					}

					// Mark invalid indicators as deleted
					for (const indicator of chart.indicatorChartConfigs) {
						if (!indicatorKeys.includes(indicator.indicatorKeyStr)) {
							indicator.isDelete = true;
						}
					}

					// Mark invalid operations as deleted
					for (const operation of chart.operationChartConfigs) {
						if (!operationKeys.includes(operation.operationKeyStr)) {
							operation.isDelete = true;
						}
					}
				}

				if (!draft.layout) {
					draft.layout = "vertical";
				}
			});
		},

		// Toggle kline visibility
		toggleKlineVisibility: (chartId) => {
			const targetChart = get().chartConfig.charts.find(
				(c) => c.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return;
			}

			get()._updateChartConfig((draft) => {
				const chart = draft.charts.find((c) => c.id === chartId);
				if (!chart) return;

				chart.klineChartConfig.visible =
					chart.klineChartConfig.visible === undefined
						? false
						: !chart.klineChartConfig.visible;
			});
		},

		// Get kline visibility
		getKlineVisibility: (chartId) => {
			const targetChart = get().chartConfig.charts.find(
				(c) => c.id === chartId,
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

		// Toggle indicator visibility
		toggleIndicatorVisibility: (chartId, indicatorKeyStr) => {
			const targetChart = get().chartConfig.charts.find(
				(c) => c.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return;
			}

			const indicatorConfig = targetChart.indicatorChartConfigs.find(
				(c) => c.indicatorKeyStr === indicatorKeyStr,
			);
			if (!indicatorConfig) {
				console.warn(`Indicator ${indicatorKeyStr} does not exist`);
				return;
			}

			get()._updateChartConfig((draft) => {
				const chart = draft.charts.find((c) => c.id === chartId);
				if (!chart) return;

				const config = chart.indicatorChartConfigs.find(
					(c) => c.indicatorKeyStr === indicatorKeyStr,
				);
				if (config) {
					config.visible =
						config.visible === undefined ? false : !config.visible;
				}
			});
		},

		// Get indicator visibility
		getIndicatorVisibility: (chartId, indicatorKeyStr) => {
			const targetChart = get().chartConfig.charts.find(
				(c) => c.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return false;
			}

			const indicatorConfig = targetChart.indicatorChartConfigs.find(
				(c) => c.indicatorKeyStr === indicatorKeyStr,
			);
			if (!indicatorConfig) {
				console.warn(`Indicator ${indicatorKeyStr} does not exist`);
				return false;
			}

			return (
				indicatorConfig.visible === true ||
				indicatorConfig.visible === undefined
			);
		},

		// Add operation
		addOperation: (chartId, operationChartConfig) => {
			const { chartConfig, _updateChartConfig } = get();
			const targetChart = chartConfig.charts.find((c) => c.id === chartId);

			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return;
			}

			const { operationKeyStr } = operationChartConfig;
			const operationKey = parseKey(operationKeyStr) as OperationKey;
			const operationName = operationKey.name.toUpperCase();

			// Check if operation already exists and is not deleted
			const existingOperation = targetChart.operationChartConfigs.find(
				(config) =>
					config.operationKeyStr === operationKeyStr && !config.isDelete,
			);

			if (existingOperation) {
				toast.warning(`${operationName} already exists`, { duration: 2000 });
				return;
			}

			// Check if a deleted operation with the same name exists
			const deletedOperation = targetChart.operationChartConfigs.find(
				(config) =>
					config.operationKeyStr === operationKeyStr && config.isDelete,
			);

			_updateChartConfig((draft) => {
				const chart = draft.charts.find((c) => c.id === chartId);
				if (!chart) return;

				if (deletedOperation) {
					// Restore deleted operation and update with new config
					const config = chart.operationChartConfigs.find(
						(c) => c.operationKeyStr === operationKeyStr,
					);
					if (config) {
						config.isDelete = false;
						config.isInMainChart = operationChartConfig.isInMainChart;
						config.visible = operationChartConfig.visible;
						config.seriesConfigs = operationChartConfig.seriesConfigs;
					}
				} else {
					// Add new operation
					chart.operationChartConfigs.push(operationChartConfig);
				}
			});

			toast.success(`${operationName} added successfully`, { duration: 2000 });
		},

		// Remove operation
		removeOperation: (chartId, operationKeyStr) => {
			get()._updateChartConfig((draft) => {
				const chart = draft.charts.find((c) => c.id === chartId);
				if (!chart) return;

				const config = chart.operationChartConfigs.find(
					(c) => c.operationKeyStr === operationKeyStr,
				);
				if (config) config.isDelete = true;
			});
			console.log("Current chart config: ", get().chartConfig);
		},

		// Toggle operation visibility
		toggleOperationVisibility: (chartId, operationKeyStr) => {
			const targetChart = get().chartConfig.charts.find(
				(c) => c.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return;
			}

			const operationConfig = targetChart.operationChartConfigs.find(
				(c) => c.operationKeyStr === operationKeyStr,
			);
			if (!operationConfig) {
				console.warn(`Operation ${operationKeyStr} does not exist`);
				return;
			}

			get()._updateChartConfig((draft) => {
				const chart = draft.charts.find((c) => c.id === chartId);
				if (!chart) return;

				const config = chart.operationChartConfigs.find(
					(c) => c.operationKeyStr === operationKeyStr,
				);
				if (config) {
					config.visible =
						config.visible === undefined ? false : !config.visible;
				}
			});
		},

		// Get operation visibility
		getOperationVisibility: (chartId, operationKeyStr) => {
			const targetChart = get().chartConfig.charts.find(
				(c) => c.id === chartId,
			);
			if (!targetChart) {
				console.warn(`Chart ID ${chartId} does not exist`);
				return false;
			}

			const operationConfig = targetChart.operationChartConfigs.find(
				(c) => c.operationKeyStr === operationKeyStr,
			);
			if (!operationConfig) {
				console.warn(`Operation ${operationKeyStr} does not exist`);
				return false;
			}

			return (
				operationConfig.visible === true ||
				operationConfig.visible === undefined
			);
		},

		// Reset state
		reset: () => set(initialState),
	}),
);
