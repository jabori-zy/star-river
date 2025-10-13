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
	addChart: (klineKeyStr: string) => void;
	deleteChart: (chartId: number) => void;
	updateChart: (
		chartId: number,
		klineKeyStr: string,
		chartName: string,
	) => void;
	updateLayout: (layout: LayoutMode) => void;

	// 指标管理
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

	// 辅助方法
	getKeys: () => Promise<Record<string, KlineKey | IndicatorKey>>;
	getChartById: (chartId: number) => BacktestChartConfig | undefined;
	_updateChart: (chartId: number, chartUpdater: (chart: BacktestChartConfig) => BacktestChartConfig) => void;
	_validateAndFixChartConfig: (chartConfig: BacktestStrategyChartConfig, klineKeys: string[], indicatorKeys: string[]) => BacktestStrategyChartConfig;
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
				console.error("获取策略缓存键失败:", error);
				return {};
			}
		},

		// 创建默认图表配置
		createDefaultChart: async () => {
			const { getKeys } = get();

			try {
				const cacheKeys = await getKeys();
				if (cacheKeys && Object.keys(cacheKeys).length > 0) {
					// 过滤出kline key
					const klineKeys = Object.keys(cacheKeys).filter((key) => {
						const parsedKey = cacheKeys[key];
						return (parsedKey.type === "kline");
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
				const chartConfig = await getBacktestStrategyChartConfig(strategyId);
				console.log("后端返回的图表配置:", chartConfig);

				const keys = await get().getKeys();
				// console.log("获取的缓存键:", keys);

				// 判断缓存键是否为空
				if (keys && Object.keys(keys).length > 0) {
					// 在一个循环中分离 kline 和 indicator keys
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

					// 如果chartConfig不为空，则进行验证和修复
					if (chartConfig) {
						// 检查后端返回的配置是否有效
						// 是否有charts字段，并且charts字段是否为数组，并且charts字段的长度是否大于0
						const hasValidConfig = chartConfig.charts && Array.isArray(chartConfig.charts) && chartConfig.charts.length > 0;
						// console.log("后端返回的图表配置是否有效:", hasValidConfig);

						if (hasValidConfig) {
							// 使用后端配置，验证并修复配置
							const { _validateAndFixChartConfig } = get();
							const validatedConfig = _validateAndFixChartConfig(chartConfig, klineKeys, indicatorKeys);
							// console.log("验证并修复后的图表配置: ", validatedConfig);
							set({ chartConfig: validatedConfig });
						}

					} else {
						// 后端配置无效（null、空数组或不存在），创建默认图表
						const { createDefaultChart } = get();
						await createDefaultChart();
					}
					
				} else {
					// 后端配置无效（null、空数组或不存在），创建默认图表
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
				// 保存前，将chartConfig中的indicatorChartConfigs中的isDelete为true的指标删除
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
			console.log("当前的图表配置: ", get().chartConfig);
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

		// 通用的图表更新函数
		_updateChart: (chartId: number, chartUpdater: (chart: BacktestChartConfig) => BacktestChartConfig) => {
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

		// 添加指标
		addIndicator: (chartId, indicatorChartConfig) => {
			const indicatorKey = parseKey(
				indicatorChartConfig.indicatorKeyStr,
			) as IndicatorKey;
			const { chartConfig, _updateChart } = get();

			// 检查目标图表是否存在
			const targetChart = chartConfig.charts.find(
				(chart) => chart.id === chartId,
			);
			if (!targetChart) {
				console.warn(`图表 ID ${chartId} 不存在`);
				return;
			}

			const { indicatorKeyStr } = indicatorChartConfig;
			const indicatorName = indicatorKey.indicatorType.toUpperCase();

			// 检查指标是否已存在且未被删除
			const existingIndicator = targetChart.indicatorChartConfigs.find(
				(config) =>
					config.indicatorKeyStr === indicatorKeyStr && !config.isDelete,
			);

			if (existingIndicator) {
				toast.warning(`${indicatorName}已存在`, { duration: 2000 });
				return;
			}

			// 检查是否存在已删除的同名指标
			const deletedIndicator = targetChart.indicatorChartConfigs.find(
				(config) =>
					config.indicatorKeyStr === indicatorKeyStr && config.isDelete,
			);

			if (deletedIndicator) {
				// 恢复已删除的指标
				_updateChart(chartId, (chart) => ({
					...chart,
					indicatorChartConfigs: chart.indicatorChartConfigs.map((config) =>
						config.indicatorKeyStr === indicatorKeyStr
							? { ...config, isDelete: false }
							: config,
					),
				}));
			} else {
				// 添加新指标
				_updateChart(chartId, (chart) => ({
					...chart,
					indicatorChartConfigs: [
						...chart.indicatorChartConfigs,
						indicatorChartConfig,
					],
				}));
			}

			toast.success(`${indicatorName}添加成功`, { duration: 2000 });
		},

		// 移除指标
		removeIndicator: (chartId, indicatorKeyStr) => {
			const { _updateChart } = get();

			// 软删除：只设置isDelete为true，不从数组中移除
			_updateChart(chartId, (chart) => ({
				...chart,
				indicatorChartConfigs: chart.indicatorChartConfigs.map((config) =>
					config.indicatorKeyStr === indicatorKeyStr
						? { ...config, isDelete: true }
						: config,
				),
			}));
			console.log("当前的图表配置: ", get().chartConfig);
		},

		// 切换k线，切换k线需要将chartId对应的图表的所有的指标删除（软删除）
		// 对应的chartId的图表标题也要修改
		changeKline: (chartId, klineKeyStr) => {
			const { chartConfig } = get();
			// 将所有的指标删除
			chartConfig.charts.forEach((chart) => {
				if (chart.id === chartId) {
					chart.indicatorChartConfigs = chart.indicatorChartConfigs.map((config) => ({ ...config, isDelete: true }));
				}
			});
			const klineKey = parseKey(klineKeyStr) as KlineKey;
			set({
				chartConfig: {
					...chartConfig,
					charts: chartConfig.charts.map((chart) => chart.id === chartId ? { ...chart, klineChartConfig: { ...chart.klineChartConfig, klineKeyStr }, chartName: `${klineKey.symbol} ${klineKey.interval}` } : chart),
				},
			});
			console.log("当前的图表配置: ", get().chartConfig);
		},

		// 根据ID获取图表
		getChartById: (chartId) => {
			const { chartConfig } = get();
			return chartConfig.charts.find((chart) => chart.id === chartId);
		},

		// 验证并修复图表配置
		_validateAndFixChartConfig: (chartConfig, klineKeys, indicatorKeys) => {
			const updatedCharts = chartConfig.charts.map((chart) => {
				const klineChartKey = chart.klineChartConfig.klineKeyStr;

				// 创建新的图表配置对象
				const updatedChart = { ...chart };

				// 判断klineChartKey是否在klineKeys中
				// 如果不在，则将该图表的key替换为klineKeys中的第一个
                                if (!klineKeys.includes(klineChartKey)) {
                                        if (klineKeys.length === 0) {
                                                console.warn("klineKeys 为空，无法修复缺失的 klineKey");
                                        } else {
                                                const klineKey = parseKey(klineKeys[0]) as KlineKey;
                                                updatedChart.chartName = `${klineKey.symbol} ${klineKey.interval}`;
                                                updatedChart.klineChartConfig = {
                                                        ...chart.klineChartConfig,
                                                        klineKeyStr: klineKeys[0]
                                                };
                                        }
                                }

				// 处理指标配置
				updatedChart.indicatorChartConfigs = chart.indicatorChartConfigs.map((indicator_chart) => {
					const indicatorChartKey = indicator_chart.indicatorKeyStr;
					// 判断indicatorChartKey是否在indicatorKeys中
					if (!indicatorKeys.includes(indicatorChartKey)) {
						// 如果不在，则将该指标删除
						return { ...indicator_chart, isDelete: true };
					}
					return indicator_chart;
				});

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
				console.warn(`图表 ID ${chartId} 不存在`);
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
				console.warn(`图表 ID ${chartId} 不存在`);
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
				console.warn(`图表 ID ${chartId} 不存在`);
				return;
			}

			const indicatorChartConfig = targetChart.indicatorChartConfigs.find(
				(config) => config.indicatorKeyStr === indicatorKeyStr,
			);

			if (!indicatorChartConfig) {
				console.warn(`指标 ${indicatorKeyStr} 不存在`);
				return;
			}

			const updatedIndicatorChartConfig = {
				...indicatorChartConfig,
				visible:
					indicatorChartConfig.visible === undefined
						? false
						: !indicatorChartConfig.visible, // 如果visible未定义，则默认不显示
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
				console.warn(`图表 ID ${chartId} 不存在`);
				return false;
			}

			const indicatorChartConfig = targetChart.indicatorChartConfigs.find(
				(config) => config.indicatorKeyStr === indicatorKeyStr,
			);

			if (!indicatorChartConfig) {
				console.warn(`指标 ${indicatorKeyStr} 不存在`);
				return false;
			}

			return (
				indicatorChartConfig.visible === true ||
				indicatorChartConfig.visible === undefined
			);
		},

		// 重置状态
		reset: () => set(initialState),
	}),
);
