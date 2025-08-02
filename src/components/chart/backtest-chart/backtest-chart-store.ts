import type { IChartApi, Time, UTCTimestamp, CandlestickData, SingleValueData} from "lightweight-charts";
// import type { SeriesApiRef } from "lightweight-charts-react-components";
import type { Subscription } from "rxjs";
import { create } from "zustand";
import { createKlineStreamFromKey, createIndicatorStreamFromKey } from "@/hooks/obs/backtest-strategy-data-obs";
import { getInitialChartData } from "@/service/chart";
import type { Kline } from "@/types/kline";
import type { ChartId } from "@/types/chart";
import type { KeyStr, IndicatorKeyStr, KlineKeyStr } from "@/types/symbol-key";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import { parseKey } from "@/utils/parse-key";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import initIndicatorChart from "../stock-chart/indicator-chart/init-indicator-chart";

// export type Candlestick = {
// 	time: Time; // 使用 lightweight-charts 的 Time 类型
// 	open: number;
// 	high: number;
// 	low: number;
// 	close: number;
// };

interface BacktestChartStore {
	chartId: ChartId;
	chartConfig: BacktestChartConfig;
	klineData: Record<KlineKeyStr, CandlestickData[]>; // k线数据 和 指标数据 的集合
	indicatorData: Record<IndicatorKeyStr, Record<keyof IndicatorValueConfig, SingleValueData[]>>; // 指标数据
	// seriesRef: Record<KeyStr, SeriesApiRef<"Candlestick"> | SeriesApiRef<"Line"> | SeriesApiRef<"Area"> | SeriesApiRef<"Histogram"> | null>; // 图表数据引用集合
	// chartRef: IChartApi | null;
	subscriptions: Record<KeyStr, Subscription[]>; // 订阅集合
	isInitialized: boolean; // 标记是否已经初始化过数据

	initChartData: (playIndex: number) => void;

	setChartConfig: (chartConfig: BacktestChartConfig) => void;

	setKlineData: (keyStr: KeyStr, data: CandlestickData[]) => void;
	setIndicatorData: (keyStr: KeyStr, data: Record<keyof IndicatorValueConfig, SingleValueData[]>) => void;

	// getData: (keyStr: KeyStr) => CandlestickData[] | SingleValueData[];

	getLastKline: (keyStr: KeyStr) => CandlestickData | SingleValueData | null;

	// setChartRef: (chart: IChartApi) => void; // 设置chart引用

	// addSeriesRef: (keyStr: KeyStr, ref: SeriesApiRef<"Candlestick"> | SeriesApiRef<"Line"> | SeriesApiRef<"Area"> | SeriesApiRef<"Histogram">) => void; // 设置series引用

	// getSeriesRef: (keyStr: KeyStr) => SeriesApiRef<"Candlestick"> | SeriesApiRef<"Line"> | SeriesApiRef<"Area"> | SeriesApiRef<"Histogram"> | null;

	getKeyStr: () => KeyStr[];

	// Observer 相关方法
	initObserverSubscriptions: () => void;
	addObserverSubscription: (keyStr: KeyStr, subscription: Subscription) => void;
	cleanupSubscriptions: () => void;
	onNewKline: (klineKeyStr: KeyStr, kline: Kline) => void;
	onNewIndicator: (indicatorKeyStr: KeyStr, indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]>) => void;

	resetData: () => void;
}

// 创建单个图表store的工厂函数
const createBacktestChartStore = (chartConfig: BacktestChartConfig) => create<BacktestChartStore>((set, get) => ({
	chartId: chartConfig.id,
	chartConfig: chartConfig,
	klineData: {},
	indicatorData: {},
	// chartRef: null,
	subscriptions: {},
	isInitialized: false,

	setChartConfig: (chartConfig: BacktestChartConfig) => set({ chartConfig }),

	setKlineData: (keyStr: KeyStr, data: CandlestickData[]) => set(() => ({ klineData: { ...get().klineData, [keyStr]: data } })),

	setIndicatorData: (keyStr: KeyStr, data: Record<keyof IndicatorValueConfig, SingleValueData[]>) => {
		const state = get();
		const indicatorData = { ...state.indicatorData, [keyStr]: data };
		set(() => ({ indicatorData }));
	},


	getLastKline: (keyStr: KeyStr) => {
		const data = get().klineData[keyStr] || [];
		return data[data.length - 1] || null;
	},

	getLastIndicator: (keyStr: KeyStr, indicatorValueKey: keyof IndicatorValueConfig) => {
		const data = get().indicatorData[keyStr] || {};
		const indicatorData = data[indicatorValueKey] || [];
		return indicatorData[indicatorData.length - 1] || null;
	},

	// addSeriesRef: (keyStr: KeyStr, ref: SeriesApiRef<"Candlestick"> | SeriesApiRef<"Line"> | SeriesApiRef<"Area"> | SeriesApiRef<"Histogram">) => {
	// 	console.log("添加series引用: ", keyStr, ref);
	// 	set({ seriesRef: { ...get().seriesRef, [keyStr]: ref } });
	// 	console.log("seriesRef: ", get().seriesRef);
	// },

	// getSeriesRef: (keyStr: KeyStr) => get().seriesRef[keyStr] || null,


	// setChartRef: (chart: IChartApi) => set({ chartRef: chart }),

	getKeyStr: () => {
		const state = get();
		const chartConfig = state.chartConfig;
		const klineKeyStr = chartConfig.klineChartConfig.klineKeyStr;

		// 主图指标
		const mainChartIndicatorConfig = chartConfig.klineChartConfig.indicatorChartConfig;
		const mainChartIndicatorKeyStrs = Object.keys(mainChartIndicatorConfig);

		// 子图指标
		const subChartIndicatorConfigs = chartConfig.subChartConfigs.map((subChartConfig) => subChartConfig.indicatorChartConfigs);
		const subChartIndicatorKeyStrs = subChartIndicatorConfigs.flatMap((subChartIndicatorConfig) => Object.keys(subChartIndicatorConfig));

		const keyStrs = [klineKeyStr, ...mainChartIndicatorKeyStrs, ...subChartIndicatorKeyStrs];
		return keyStrs;
	},


	// Observer 相关方法
	initObserverSubscriptions: () => {
		const state = get();

		// 清理现有订阅
		state.cleanupSubscriptions();

		console.log("初始化 Observer 订阅，klineKeyStr:", state.getKeyStr());

		try {
			state.getKeyStr().forEach((keyStr) => {
				const key = parseKey(keyStr);
				if (key.type === "kline") {
					const klineStream = createKlineStreamFromKey(keyStr, true);
					const klineSubscription = klineStream.subscribe({
						next: (klineData: Kline[]) => {
							console.log(`=== 收到K线数据流更新 ===`);
							console.log("K线数据: ", klineData);
							// 更新kline
							state.onNewKline(keyStr, klineData[klineData.length - 1]);
						},
						error: (error) => {
							console.error("K线数据流订阅错误:", error);
						},
					});
					state.addObserverSubscription(keyStr, klineSubscription);
				} else if (key.type === "indicator") {
					const indicatorStream = createIndicatorStreamFromKey(keyStr, true);
					const indicatorSubscription = indicatorStream.subscribe({
						next: (indicatorData: Record<keyof IndicatorValueConfig, number>[]) => {
							console.log(`=== 收到指标数据流更新 ===`);
							console.log("指标数据: ", indicatorData);
							
							// 转换指标数据格式为 Record<keyof IndicatorValueConfig, SingleValueData[]>
							const indicator: Record<keyof IndicatorValueConfig, SingleValueData[]> = {};

							indicatorData.forEach(item => {
								Object.entries(item).forEach(([indicatorValueKey, value]) => {
									indicator[indicatorValueKey as keyof IndicatorValueConfig] = [...(indicator[indicatorValueKey as keyof IndicatorValueConfig] || []), {
										time: Math.floor(item.timestamp / 1000) as UTCTimestamp,
										value: value,
									} as SingleValueData];
								});
							});
							// 更新indicator
							state.onNewIndicator(keyStr, indicator);
						},
						error: (error) => {
							console.error("指标数据流订阅错误:", error);
						},
					});
					state.addObserverSubscription(keyStr, indicatorSubscription);
				}
			});

		} catch (error) {
			console.error("初始化 Observer 订阅时出错:", error);
		}
	},

	addObserverSubscription: (keyStr: KeyStr, subscription: Subscription) => {
		set({ subscriptions: { ...get().subscriptions, [keyStr]: [...(get().subscriptions[keyStr] || []), subscription] } });
		console.log("subscriptions: ", get().subscriptions);
	},

	cleanupSubscriptions: () => {
		const state = get();
		// console.log(
		// 	"清理 Observer 订阅，当前订阅数量:",
		// 	state.subscriptions.length,
		// );

		Object.entries(state.subscriptions).forEach(([_, subscriptions]) => {
			subscriptions.forEach((subscription, index) => {
			try {
				subscription.unsubscribe();
				// console.log(`订阅 ${index} 已清理`);
			} catch (error) {
				console.error(`清理订阅 ${index} 时出错:`, error);
				}
			});
		});

		set({ subscriptions: {} });
	},

	onNewKline: (klineKeyStr: KeyStr, kline: Kline) => {
		// 将 Kline 数据转换为 FlexibleCandlestickData 格式
		// 后端返回毫秒级时间戳，转换为秒级时间戳
		const timestampInSeconds = Math.floor(kline.timestamp / 1000) as UTCTimestamp;
		const candlestickData: CandlestickData = {
			time: timestampInSeconds, // 转换为秒级时间戳
			open: kline.open,
			high: kline.high,
			low: kline.low,
			close: kline.close,
		};

		// 获取最后一根k线
		const lastData = get().getLastKline(klineKeyStr);

		// 如果最后一根k线的时间戳与新k线的时间戳相同，则替换最后一根k线
		if (lastData && lastData.time === timestampInSeconds) {
			const data = get().klineData[klineKeyStr] as CandlestickData[];
			console.log("替换最后一根k线: ", candlestickData);
			// 创建新数组，替换最后一根k线
			const newData = [...data.slice(0, -1), candlestickData];
			get().setKlineData(klineKeyStr, newData);
			console.log("替换后数据: ", newData);
		} else {
			const data = get().klineData[klineKeyStr] as CandlestickData[];
			// 说明策略还未开始，当前是第一根k线
			if (!data) {
				get().setKlineData(klineKeyStr, [candlestickData]);
			}
			
			// 创建新数组，添加新k线
			const newData = [...data, candlestickData];
			get().setKlineData(klineKeyStr, newData);
			console.log("插入后数据: ", newData);
		}
	},

	onNewIndicator: (indicatorKeyStr: KeyStr, indicator: Record<keyof IndicatorValueConfig, SingleValueData[]>) => {
		const state = get();
		const existingIndicatorData = state.indicatorData[indicatorKeyStr] || {};

		// 处理每个指标值字段
		const updatedIndicator: Record<keyof IndicatorValueConfig, SingleValueData[]> = { ...existingIndicatorData };

		Object.entries(indicator).forEach(([indicatorValueKey, newDataArray]) => {
			const indicatorValueField = indicatorValueKey as keyof IndicatorValueConfig;
			const existingData = existingIndicatorData[indicatorValueField] || [];

			// 处理新数据数组中的每个数据点
			newDataArray.forEach((newDataPoint) => {
				// 获取该指标值字段的最后一个数据点
				const lastData = existingData[existingData.length - 1];

				// 过滤0
				if (newDataPoint.value === 0) {
					return;
				}

				// 如果最后一个数据点的时间戳与新数据点的时间戳相同，则替换最后一个数据点
				if (lastData && lastData.time === newDataPoint.time) {
					console.log(`替换最后一个指标数据点 ${indicatorKeyStr}.${indicatorValueField}:`, newDataPoint);
					// 创建新数组，替换最后一个数据点
					updatedIndicator[indicatorValueField] = [...existingData.slice(0, -1), newDataPoint];
				} else {
					console.log(`插入新指标数据点 ${indicatorKeyStr}.${indicatorValueField}:`, newDataPoint);
					// 创建新数组，添加新数据点
					updatedIndicator[indicatorValueField] = [...existingData, newDataPoint];
				}
			});
		});

		// 更新状态
		const indicatorData = { ...state.indicatorData, [indicatorKeyStr]: updatedIndicator };
		set(() => ({ indicatorData }));
		console.log(`更新后的指标数据 ${indicatorKeyStr}:`, updatedIndicator);
	},

	initChartData: async (playIndex: number) => {
		const state = get();

		// 如果已经初始化过且有数据，跳过重复初始化
		// if (state.isInitialized && state.chartData.length > 0) {
		// 	// console.log("图表已初始化，跳过重复初始化:", state.chartId);
		// 	return;
		// }

		if (playIndex > -1) {
			// 使用 Promise.all 等待所有异步操作完成
			const promises = state.getKeyStr().map(async (keyStr) => {
				try {
					const key = parseKey(keyStr);
					
					// 如果是KlineKey, 则转换为K线
					if (key.type === "kline") {
						const initialKlines = await getInitialChartData(
							keyStr,
							playIndex,
							null,
						) as Kline[];

						// 安全检查：确保 initialKlines 存在且是数组
						if (initialKlines && Array.isArray(initialKlines) && initialKlines.length > 0) {
							const klineData: CandlestickData[] = initialKlines.map((kline) => ({
								time: Math.floor(kline.timestamp / 1000) as UTCTimestamp,
								open: kline.open,
								high: kline.high,
								low: kline.low,
								close: kline.close,
							}));
							console.log("klineData: ", klineData);

							state.setKlineData(keyStr, klineData);
						} else {
							console.warn(`No kline data received for keyStr: ${keyStr}`);
						}
					} 
					
					else if (key.type === "indicator") {
						const initialIndicatorData = await getInitialChartData(keyStr, playIndex, null) as Record<keyof IndicatorValueConfig, number>[];
						// 安全检查：确保指标数据存在
						if (initialIndicatorData && Array.isArray(initialIndicatorData) && initialIndicatorData.length > 0) {
							
							const indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]> = {};
							initialIndicatorData.forEach((item) => {
								Object.entries(item).forEach(([indicatorValueField, value]) => {
									// 过滤掉timestamp和value为0的数据
									if (indicatorValueField !== "timestamp" && value !== 0) {
										indicatorData[indicatorValueField as keyof IndicatorValueConfig] = [...
											(indicatorData[indicatorValueField as keyof IndicatorValueConfig] || []), {
												time: Math.floor(item.timestamp / 1000) as UTCTimestamp,
												value: value,
												} as SingleValueData];
									}
								});
							});
							console.log("indicatorData: ", indicatorData);
							
							state.setIndicatorData(keyStr, indicatorData);
							console.log("state.indicatorData: ", state.indicatorData);
						} else {
							console.warn(`No indicator data received for keyStr: ${keyStr}`);
						}
					}
				} catch (error) {
					console.error(`Error loading data for keyStr: ${keyStr}`, error);
				}
			});

			// 等待所有数据加载完成
			await Promise.all(promises);

			// 数据加载完成后，设置到对应的 series
			// Object.entries(state.chartData).forEach(([keyStr, data]) => {
			// 	if (data && Array.isArray(data) && data.length > 0) {
			// 		const series = state.seriesRef[keyStr];
			// 		if (series) {
			// 			try {
			// 				series.api()?.setData(data as CandlestickData[]);
			// 			} catch (error) {
			// 				console.error(`Error setting data for series ${keyStr}:`, error);
			// 			}
			// 		}
			// 	}
			// });
		}
	},

	resetData: () => {
		set({ klineData: {}, isInitialized: false });
	},
}));

// 多实例store管理器
const storeInstances = new Map<number, ReturnType<typeof createBacktestChartStore>>();

// 获取或创建指定chartId的store实例
export const getBacktestChartStore = (chartConfig: BacktestChartConfig) => {
	if (!storeInstances.has(chartConfig.id)) {
		storeInstances.set(chartConfig.id, createBacktestChartStore(chartConfig));
	}
	const store = storeInstances.get(chartConfig.id);
	if (!store) {
		throw new Error(`Failed to create store for chartId: ${chartConfig.id}`);
	}
	return store;
};

// 清理指定chartId的store实例
export const cleanupBacktestChartStore = (chartConfig: BacktestChartConfig) => {
	const store = storeInstances.get(chartConfig.id);
	if (store) {
		// 清理订阅
		const state = store.getState();
		state.cleanupSubscriptions();
		// 从管理器中移除
		storeInstances.delete(chartConfig.id);
	}
};

// Hook：根据chartId获取对应的store
export const useBacktestChartStore = (chartConfig: BacktestChartConfig) => {
	const store = getBacktestChartStore(chartConfig);
	return store();
};

// 获取指定chartId的store实例（不是hook）
export const getBacktestChartStoreInstance = (chartConfig: BacktestChartConfig) => {
	return getBacktestChartStore(chartConfig);
};
