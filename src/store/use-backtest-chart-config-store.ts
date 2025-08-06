import { create } from "zustand";
import { toast } from "sonner";
import type {
	IndicatorChartConfig,
	LayoutMode,
} from "@/types/chart";
import type {
	BacktestChartConfig,
	BacktestStrategyChartConfig,
} from "@/types/chart/backtest-chart";
import {
	getBacktestStrategyChartConfig,
	updateBacktestStrategyChartConfig,
	getStrategyCacheKeys,
} from "@/service/strategy";
import { parseKey } from "@/utils/parse-key";
import type { KlineKey, IndicatorKey } from "@/types/symbol-key";

interface BacktestChartConfigState {
	// 状态
	chartConfig: BacktestStrategyChartConfig;
	isLoading: boolean;
	isSaving: boolean;
	configLoaded: boolean;
	strategyId: number | null;

	// 基础操作
	setStrategyId: (strategyId: number | null) => void;
	setChartConfig: (config: BacktestStrategyChartConfig) => void;
	getChartConfig: (chartId: number) => BacktestChartConfig | undefined;
	setLoading: (loading: boolean) => void;
	setSaving: (saving: boolean) => void;
	setConfigLoaded: (loaded: boolean) => void;

	// 图表配置操作
	loadChartConfig: (strategyId: number) => Promise<void>;
	saveChartConfig: () => Promise<void>;
	createDefaultChart: () => Promise<void>;
	
	// 图表管理
	addChart: (klineCacheKeyStr: string, chartName: string) => void;
	deleteChart: (chartId: number) => void;
	updateChart: (
		chartId: number,
		klineCacheKeyStr: string,
		chartName: string,
	) => void;
	updateLayout: (layout: LayoutMode) => void;

	// 指标管理
	addIndicator: (
		chartId: number,
		indicatorChartConfig: IndicatorChartConfig,
	) => void;

	removeIndicator: (
		chartId: number,
		indicatorKeyStr: string,
	) => void;

	// 辅助方法
	fetchCacheKeys: () => Promise<Record<string, KlineKey | IndicatorKey>>;
	getChartById: (chartId: number) => BacktestChartConfig | undefined;
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

		// 基础操作
		setStrategyId: (strategyId) => set({ strategyId }),
		setChartConfig: (chartConfig) => set({ chartConfig }),
		setLoading: (isLoading) => set({ isLoading }),
		setSaving: (isSaving) => set({ isSaving }),
		setConfigLoaded: (configLoaded) => set({ configLoaded }),

		getChartConfig: (chartId) => {
			const { chartConfig } = get();
			return chartConfig.charts.find((chart) => chart.id === chartId);
		},

		// 获取策略缓存键
		fetchCacheKeys: async () => {
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
				console.error("获取策略缓存键失败:", error);
				return {};
			}
		},

		// 创建默认图表配置
		createDefaultChart: async () => {
			const { fetchCacheKeys } = get();

			try {
				const cacheKeys = await fetchCacheKeys();
				if (cacheKeys && Object.keys(cacheKeys).length > 0) {
					// 过滤出kline key
					const klineKeys = Object.keys(cacheKeys).filter((key) => {
						const parsedKey = cacheKeys[key];
						return !("indicatorType" in parsedKey);
					});

					if (klineKeys.length > 0) {
						// 使用第一个kline key创建默认图表
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

						console.log("创建默认图表:", defaultChart);
						set({
							chartConfig: {
								charts: [defaultChart],
								layout: "horizontal" as LayoutMode,
							},
						});
						return;
					}
				}

				// 没有可用的kline key，使用空配置
				console.log("没有可用的数据，使用空配置");
				set({
					chartConfig: {
						charts: [],
						layout: "vertical",
					},
				});
			} catch (error) {
				console.error("创建默认图表失败:", error);
				// 创建失败时使用空配置
				set({
					chartConfig: {
						charts: [],
						layout: "vertical",
					},
				});
			}
		},

		// 从后端加载图表配置
		loadChartConfig: async (strategyId: number) => {
			try {
				set({ isLoading: true, strategyId });
				const config = await getBacktestStrategyChartConfig(strategyId);
				console.log("后端返回的图表配置:", config);

				// 检查后端返回的配置是否有效
				const hasValidConfig = config?.charts &&
					Array.isArray(config.charts) &&
					config.charts.length > 0;

				if (hasValidConfig) {
					// 使用后端配置
					console.log("使用后端图表配置");
					set({
						chartConfig: {
							charts: config.charts,
							layout: config.layout || "vertical",
						},
					});
				} else {
					// 后端配置无效（null、空数组或不存在），创建默认图表
					console.log("后端配置无效，创建默认图表");
					const { createDefaultChart } = get();
					await createDefaultChart();
				}
				set({ configLoaded: true });
			} catch (error) {
				console.error("获取图表配置失败:", error);
				set({ configLoaded: true });
				// 加载失败时也尝试创建默认图表
				try {
					const { createDefaultChart } = get();
					await createDefaultChart();
				} catch (defaultError) {
					console.error("创建默认图表也失败:", defaultError);
				}
				toast.error("获取图表配置失败", {
					description: "已使用默认配置，您可以重新添加图表",
					duration: 4000,
				});
			} finally {
				set({ isLoading: false });
			}
		},

		// 保存图表配置到后端
		saveChartConfig: async () => {
			const { strategyId, chartConfig } = get();
			if (!strategyId) return;

			try {
				set({ isSaving: true });
				await updateBacktestStrategyChartConfig(strategyId, chartConfig);
				toast.success("图表配置保存成功");
			} catch (error) {
				console.error("保存图表配置失败:", error);
				toast.error("保存图表配置失败", {
					description: error instanceof Error ? error.message : "未知错误",
					duration: 4000,
				});
			} finally {
				set({ isSaving: false });
			}
		},

		// 添加图表
		addChart: (klineCacheKeyStr, chartName) => {
			const { chartConfig } = get();
			const maxChartId = Math.max(
				...chartConfig.charts.map((chart) => chart.id),
				0,
			);

			const newChart: BacktestChartConfig = {
				id: maxChartId + 1,
				chartName,
				klineChartConfig: {
					klineKeyStr: klineCacheKeyStr,
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
		},

		// 删除图表
		deleteChart: (chartId) => {
			const { chartConfig } = get();
			
			// 判断是否是最后一个图表
			if (chartConfig.charts.length === 1) {
				toast.error("至少保留一个图表");
				return;
			}

			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.filter((chart) => chart.id !== chartId),
				},
			});
		},

		// 更新图表
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

		// 更新布局模式
		updateLayout: (layout) => {
			const { chartConfig } = get();
			set({
				chartConfig: {
					...chartConfig,
					layout,
				},
			});
		},

		// 添加指标
		addIndicator: (chartId, indicatorChartConfig) => {
			const { chartConfig } = get();

			// 检查指标是否已存在
			const targetChart = chartConfig.charts.find((chart) => chart.id === chartId);
			if (!targetChart) {
				console.warn(`图表 ID ${chartId} 不存在`);
				return;
			}

			const existingIndicator = targetChart.indicatorChartConfigs.find(
				(config) => config.indicatorKeyStr === indicatorChartConfig.indicatorKeyStr
			);

			const indciatorKey = parseKey(indicatorChartConfig.indicatorKeyStr) as IndicatorKey;

			if (existingIndicator) {
				toast.warning(`${indciatorKey.indicatorType.toUpperCase()}已存在`, {
					duration: 2000,
				});
				return;
			}

			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.map((chart) =>
						chart.id === chartId
							? {
									...chart,
									indicatorChartConfigs: [
										...chart.indicatorChartConfigs,
										indicatorChartConfig,
									],
								}
							: chart,
					),
				},
			});

			toast.success(`${indciatorKey.indicatorType.toUpperCase()}添加成功`, {
				duration: 2000,
			});
		},

		// 移除指标
		removeIndicator: (chartId, indicatorKeyStr) => {
			const { chartConfig } = get();

			// 从数组中删除指标
			const targetChart = chartConfig.charts.find((chart) => chart.id === chartId);
			if (!targetChart) {
				console.warn(`图表 ID ${chartId} 不存在`);
				return;
			}

			const indciatorKey = parseKey(indicatorKeyStr) as IndicatorKey;

			const existingIndicator = targetChart.indicatorChartConfigs.find(
				(config) => config.indicatorKeyStr === indicatorKeyStr
			);

			if (!existingIndicator) {
				toast.warning(`${indciatorKey.indicatorType.toUpperCase()}不存在`, {
					duration: 2000,
				});
				return;
			}

			// 从数组中删除指标
			const updatedChartConfigs = targetChart.indicatorChartConfigs.filter(
				(config) => config.indicatorKeyStr !== indicatorKeyStr
			);

			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.map((chart) =>
						chart.id === chartId
							? { ...chart, indicatorChartConfigs: updatedChartConfigs }
							: chart,
					),
				},
			});

			// 软删除：只设置isDelete为true，不从数组中移除
			// set({
			// 	chartConfig: {
			// 		...chartConfig,
			// 		charts: chartConfig.charts.map((chart) =>
			// 			chart.id === chartId
			// 				? {
			// 						...chart,
			// 						indicatorChartConfigs: chart.indicatorChartConfigs.map((config) =>
			// 							config.indicatorKeyStr === indicatorKeyStr
			// 								? { ...config, isDelete: true }
			// 								: config
			// 						),
			// 					}
			// 				: chart,
			// 		),
			// 	},
			// });
		},

		// 根据ID获取图表
		getChartById: (chartId) => {
			const { chartConfig } = get();
			return chartConfig.charts.find((chart) => chart.id === chartId);
		},

		// 重置状态
		reset: () => set(initialState),
	}),
);
