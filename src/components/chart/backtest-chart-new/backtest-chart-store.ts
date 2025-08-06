import type {
	CandlestickData,
	SingleValueData,
	UTCTimestamp,
} from "lightweight-charts";
import type { IChartApi, ISeriesApi, IPaneApi, Time } from "lightweight-charts";
import type { Subscription } from "rxjs";
import { create } from "zustand";
import {
	createIndicatorStreamFromKey,
	createKlineStreamFromKey,
} from "@/hooks/obs/backtest-strategy-data-obs";
import { getInitialChartData } from "@/service/chart";
import type { ChartId } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { Kline } from "@/types/kline";
import type { IndicatorKeyStr, KeyStr, KlineKeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";

interface BacktestChartStore {
	chartId: ChartId;
	chartConfig: BacktestChartConfig;

	// initialKlineData: Record<KlineKeyStr, CandlestickData[]>; // 初始k线数据
	// initialIndicatorData: Record<IndicatorKeyStr,Record<keyof IndicatorValueConfig, SingleValueData[]>>; // 初始指标数据

	klineData: Record<KlineKeyStr, CandlestickData[]>; // k线数据 和 指标数据 的集合
	indicatorData: Record<IndicatorKeyStr,Record<keyof IndicatorValueConfig, SingleValueData[]>>; // 指标数据
	subscriptions: Record<KeyStr, Subscription[]>; // 订阅集合
	
	// 数据初始化状态标志
	isDataInitialized: boolean;

	// 各种ref引用存储
	chartRef: IChartApi | null;
	klineSeriesRef: Record<KlineKeyStr, ISeriesApi<"Candlestick"> | null>;
	indicatorSeriesRef: Record<IndicatorKeyStr, Record<keyof IndicatorValueConfig, ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null>>;
	subChartPaneRef: Record<IndicatorKeyStr, IPaneApi<Time> | null>;

	// === 系列可见性状态 ===
	// 存储每个指标的可见性状态，key为indicatorKeyStr，value为是否可见
	indicatorVisibilityMap: Record<IndicatorKeyStr, boolean>;
	// 存储每个K线的可见性状态，key为klineKeyStr，value为是否可见
	klineVisibilityMap: Record<KlineKeyStr, boolean>;


	// === 图表配置 ===
	getChartConfig: () => BacktestChartConfig;
	setChartConfig: (chartConfig: BacktestChartConfig) => void;
	syncChartConfig: () => void; // 同步最新的图表配置


	initChartData: (playIndex: number) => Promise<void>;

	// setInitialKlineData: (keyStr: KlineKeyStr, data: CandlestickData[]) => void;
	// setInitialIndicatorData: (keyStr: IndicatorKeyStr, data: Record<keyof IndicatorValueConfig, SingleValueData[]>) => void;

	setKlineData: (keyStr: KeyStr, data: CandlestickData[]) => void;
	setIndicatorData: (
		keyStr: KeyStr,
		data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	) => void;
	
	// 数据初始化状态管理
	getIsDataInitialized: () => boolean;
	setIsDataInitialized: (initialized: boolean) => void;

	// getData: (keyStr: KeyStr) => CandlestickData[] | SingleValueData[];

	getLastKline: (keyStr: KeyStr) => CandlestickData | SingleValueData | null;

	// === 指标可见性控制方法 ===
	// 设置指标可见性
	setIndicatorVisibility: (
		indicatorKeyStr: IndicatorKeyStr,
		visible: boolean,
	) => void;
	// 切换指标可见性
	toggleIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => void;
	// 获取指标可见性
	getIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => boolean;

	// === K线可见性控制方法 ===
	// 设置K线可见性
	setKlineVisibility: (klineKeyStr: KlineKeyStr, visible: boolean) => void;
	// 切换K线可见性
	toggleKlineVisibility: (klineKeyStr: KlineKeyStr) => void;
	// 获取K线可见性
	getKlineVisibility: (klineKeyStr: KlineKeyStr) => boolean;

	// === 批量操作方法 ===
	// 重置所有为可见
	resetAllVisibility: () => void;
	// 批量设置指标可见性
	setBatchIndicatorVisibility: (
		visibilityMap: Record<IndicatorKeyStr, boolean>,
	) => void;
	// 批量设置K线可见性
	setBatchKlineVisibility: (
		visibilityMap: Record<KlineKeyStr, boolean>,
	) => void;

	// === ref 管理方法 ===
	setChartRef: (chart: IChartApi) => void;
	getChartRef: () => IChartApi | null;

	setKlineSeriesRef: (klineKeyStr: KlineKeyStr, ref: ISeriesApi<"Candlestick">) => void;
	getKlineSeriesRef: (klineKeyStr: KlineKeyStr) => ISeriesApi<"Candlestick"> | null;

	setIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr, indicatorValueKey: keyof IndicatorValueConfig, ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">) => void;
	getIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr, indicatorValueKey: keyof IndicatorValueConfig) => ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null;

	setSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr, ref: IPaneApi<Time>) => void;
	getSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) => IPaneApi<Time> | null;

	getKeyStr: () => KeyStr[];

	// Observer 相关方法
	initObserverSubscriptions: () => void;
	addObserverSubscription: (keyStr: KeyStr, subscription: Subscription) => void;
	cleanupSubscriptions: () => void;
	onNewKline: (klineKeyStr: KeyStr, kline: Kline) => void;


	onNewIndicator: (
		indicatorKeyStr: KeyStr,
		indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	) => void;

	resetData: () => void;
}

// 创建单个图表store的工厂函数
const createBacktestChartStore = (chartId: number, chartConfig: BacktestChartConfig) =>
	create<BacktestChartStore>((set, get) => ({
		chartId: chartId,
		chartConfig: chartConfig,

		// initialKlineData: {},
		// initialIndicatorData: {},

		klineData: {},
		indicatorData: {},
		subscriptions: {},
		
		// 数据初始化状态
		isDataInitialized: false,

		// === ref 引用初始化 ===
		chartRef: null,
		klineSeriesRef: {},
		indicatorSeriesRef: {},
		subChartPaneRef: {},

		// === 系列可见性状态初始化 ===
		// 初始状态：所有指标和K线默认可见
		indicatorVisibilityMap: {},
		klineVisibilityMap: {},



		getChartConfig: () => get().chartConfig,
		setChartConfig: (chartConfig: BacktestChartConfig) => {
			set({ chartConfig: chartConfig });
		},

		// 同步最新的图表配置
		syncChartConfig: () => {
			const latestConfig = useBacktestChartConfigStore.getState().getChartConfig(chartId);
			if (latestConfig) {
				set({ chartConfig: latestConfig });
			}
		},


		// === 数据管理方法 ===
		setKlineData: (keyStr: KeyStr, data: CandlestickData[]) =>
			set((state) => ({ klineData: { ...state.klineData, [keyStr]: data } })),

		setIndicatorData: (
			keyStr: KeyStr,
			data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
		) => {
			set((state) => ({ 
				indicatorData: { ...state.indicatorData, [keyStr]: data }
			}));
		},
		
		// 数据初始化状态管理
		getIsDataInitialized: () => get().isDataInitialized,
		setIsDataInitialized: (initialized: boolean) => set({ isDataInitialized: initialized }),

		getLastKline: (keyStr: KeyStr) => {
			const data = get().klineData[keyStr] || [];
			return data[data.length - 1] || null;
		},

		getLastIndicator: (
			keyStr: KeyStr,
			indicatorValueKey: keyof IndicatorValueConfig,
		) => {
			const data = get().indicatorData[keyStr] || {};
			const indicatorData = data[indicatorValueKey] || [];
			return indicatorData[indicatorData.length - 1] || null;
		},

		// === ref 管理方法实现 ===
		setChartRef: (chart: IChartApi) => set({ chartRef: chart }),
		getChartRef: () => get().chartRef,

		setKlineSeriesRef: (klineKeyStr: KlineKeyStr, ref: ISeriesApi<"Candlestick">) =>
			set({ klineSeriesRef: { ...get().klineSeriesRef, [klineKeyStr]: ref } }),
		getKlineSeriesRef: (klineKeyStr: KlineKeyStr) => get().klineSeriesRef[klineKeyStr] || null,

		setIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr, indicatorValueKey: keyof IndicatorValueConfig, ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">) =>
			set({ indicatorSeriesRef: { ...get().indicatorSeriesRef, [indicatorKeyStr]: { ...get().indicatorSeriesRef[indicatorKeyStr], [indicatorValueKey]: ref } } }),
		getIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr, indicatorValueKey: keyof IndicatorValueConfig) => get().indicatorSeriesRef[indicatorKeyStr]?.[indicatorValueKey] || null,

		setSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr, ref: IPaneApi<Time>) =>
			set({ subChartPaneRef: { ...get().subChartPaneRef, [indicatorKeyStr]: ref } }),
		getSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) => get().subChartPaneRef[indicatorKeyStr] || null,

		getKeyStr: () => {
			const chartConfig = get().chartConfig;
			const klineKeyStr = chartConfig.klineChartConfig.klineKeyStr;

			// 从 indicatorChartConfigs 数组中获取所有未删除指标的 keyStr
			const indicatorKeyStrs = (chartConfig.indicatorChartConfigs || [])
				.filter((indicatorConfig) => !indicatorConfig.isDelete)
				.map((indicatorConfig) => indicatorConfig.indicatorKeyStr);

			const keyStrs = [klineKeyStr, ...indicatorKeyStrs];
			return keyStrs;
		},

		// Observer 相关方法
		initObserverSubscriptions: () => {
			const state = get();

			// 清理现有订阅
			state.cleanupSubscriptions();

			try {
					state.getKeyStr().forEach((keyStr) => {
					const key = parseKey(keyStr);
					if (key.type === "kline") {
						const klineStream = createKlineStreamFromKey(keyStr, true);
						const klineSubscription = klineStream.subscribe({
							next: (klineData: Kline[]) => {
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
							next: (
								indicatorData: Record<keyof IndicatorValueConfig, number>[],
							) => {
								// 转换指标数据格式为 Record<keyof IndicatorValueConfig, SingleValueData[]>
								const indicator: Record<keyof IndicatorValueConfig,SingleValueData[]> = {};

								indicatorData.forEach((item) => {
									Object.entries(item).forEach(([indicatorValueKey, value]) => {
										indicator[indicatorValueKey as keyof IndicatorValueConfig] =
											[
												...(indicator[indicatorValueKey as keyof IndicatorValueConfig] || []),
												{
													time: Math.floor(
														item.timestamp / 1000,
													) as UTCTimestamp,
													value: value,
												} as SingleValueData,
											];
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
			set({
				subscriptions: {
					...get().subscriptions,
					[keyStr]: [...(get().subscriptions[keyStr] || []), subscription],
				},
			});
		},

		cleanupSubscriptions: () => {
			const state = get();

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
			// 后端返回毫秒级时间戳，转换为秒级时间戳
			const timestampInSeconds = Math.floor(
				kline.timestamp / 1000,
			) as UTCTimestamp;
			const candlestickData: CandlestickData = {
				time: timestampInSeconds, // 转换为秒级时间戳
				open: kline.open,
				high: kline.high,
				low: kline.low,
				close: kline.close,
			};

			// 调用series的update方法
			const klineSeries = get().getKlineSeriesRef(klineKeyStr);
			if (klineSeries) {
				klineSeries.update(candlestickData);
			}

			// 获取最后一根k线
			const lastData = get().getLastKline(klineKeyStr);

			

			// 如果最后一根k线的时间戳与新k线的时间戳相同，则替换最后一根k线
			if (lastData && lastData.time === timestampInSeconds) {
				const data = get().klineData[klineKeyStr] as CandlestickData[];
				// 创建新数组，替换最后一根k线
				const newData = [...data.slice(0, -1), candlestickData];
				get().setKlineData(klineKeyStr, newData);
			} else {
				const data = get().klineData[klineKeyStr] as CandlestickData[];
				// 说明策略还未开始，当前是第一根k线
				if (!data) {
					get().setKlineData(klineKeyStr, [candlestickData]);
				}

				// 创建新数组，添加新k线
				const newData = [...data, candlestickData];
				get().setKlineData(klineKeyStr, newData);
			}
		},

		onNewIndicator: (indicatorKeyStr: KeyStr,indicator: Record<keyof IndicatorValueConfig, SingleValueData[]>) => {
			const state = get();
			const existingIndicatorData = state.indicatorData[indicatorKeyStr] || {};
			const indicatorConfig = state.chartConfig.indicatorChartConfigs.find(config => config.indicatorKeyStr === indicatorKeyStr);
			const isInMainChart = indicatorConfig?.isInMainChart;

			// 处理每个指标值字段
			const updatedIndicator: Record<keyof IndicatorValueConfig,SingleValueData[]> = { ...existingIndicatorData };

			Object.entries(indicator).forEach(([indicatorValueKey, newDataArray]) => {
				const indicatorValueField = indicatorValueKey as keyof IndicatorValueConfig;
				const existingData = existingIndicatorData[indicatorValueField] || [];

				// 处理新数据数组中的每个数据点
				newDataArray.forEach((newDataPoint) => {
					// 获取该指标值字段的最后一个数据点
					const lastData = existingData[existingData.length - 1];

					// 过滤主图指标的0值
					if (newDataPoint.value === 0 && isInMainChart) {
						return;
					}

					// update
					const indicatorSeriesRef = state.getIndicatorSeriesRef(indicatorKeyStr, indicatorValueKey);
					if (indicatorSeriesRef) {
						indicatorSeriesRef.update(newDataPoint);
					}



					// 如果最后一个数据点的时间戳与新数据点的时间戳相同，则替换最后一个数据点
					if (lastData && lastData.time === newDataPoint.time) {
						// 创建新数组，替换最后一个数据点
						updatedIndicator[indicatorValueField] = [...existingData.slice(0, -1),newDataPoint];
					} else {
						// 创建新数组，添加新数据点
						updatedIndicator[indicatorValueField] = [...existingData,newDataPoint];
					}
				});
			});

			// 更新状态
			set((prevState) => ({ 
				indicatorData: { ...prevState.indicatorData, [indicatorKeyStr]: updatedIndicator }
			}));
		},

		initChartData: async (playIndex: number) => {
			const state = get();

			if (playIndex > -1) {
				// 使用 Promise.all 等待所有异步操作完成
				const promises = state.getKeyStr().map(async (keyStr) => {
					try {
						const key = parseKey(keyStr);

						// 如果是KlineKey, 则转换为K线
						if (key.type === "kline") {
							const initialKlines = (await getInitialChartData(keyStr,playIndex,null,)) as Kline[];

							// 安全检查：确保 initialKlines 存在且是数组
							if (initialKlines && Array.isArray(initialKlines) && initialKlines.length > 0) {
								const klineData: CandlestickData[] = initialKlines.map(
									(kline) => ({
										time: Math.floor(kline.timestamp / 1000) as UTCTimestamp,
										open: kline.open,
										high: kline.high,
										low: kline.low,
										close: kline.close,
									}),
								);

								// state.setInitialKlineData(keyStr, klineData);
								state.setKlineData(keyStr, klineData);
							} else {
								console.warn(`No kline data received for keyStr: ${keyStr}`);
							}
						} else if (key.type === "indicator") {
							const initialIndicatorData = (await getInitialChartData(
								keyStr,
								playIndex,
								null,
							)) as Record<keyof IndicatorValueConfig, number>[];
							// 安全检查：确保指标数据存在
							if (
								initialIndicatorData &&
								Array.isArray(initialIndicatorData) &&
								initialIndicatorData.length > 0
							) {
								const indicatorData: Record<keyof IndicatorValueConfig,SingleValueData[]> = {};
								initialIndicatorData.forEach((item) => {
									Object.entries(item).forEach(
										([indicatorValueField, value]) => {
											// 过滤掉timestamp和value为0的数据
											if (indicatorValueField !== "timestamp" && value !== 0) {
												indicatorData[
													indicatorValueField as keyof IndicatorValueConfig
												] = [
													...(indicatorData[
														indicatorValueField as keyof IndicatorValueConfig
													] || []),
													{
														time: Math.floor(
															item.timestamp / 1000,
														) as UTCTimestamp,
														value: value,
													} as SingleValueData,
												];
											}
										},
									);
								});

								// state.setInitialIndicatorData(keyStr, indicatorData);
								state.setIndicatorData(keyStr, indicatorData);
							} else {
								console.warn(
									`No indicator data received for keyStr: ${keyStr}`,
								);
							}
						}
					} catch (error) {
						console.error(`Error loading data for keyStr: ${keyStr}`, error);
					}
				});

				// 等待所有数据加载完成
				await Promise.all(promises);
				// 标记数据已初始化
				state.setIsDataInitialized(true);
			}
		},

		// === 指标可见性控制方法实现 ===
		// 设置指标可见性
		setIndicatorVisibility: (
			indicatorKeyStr: IndicatorKeyStr,
			visible: boolean,
		) => {
			set((state) => ({
				indicatorVisibilityMap: {
					...state.indicatorVisibilityMap,
					[indicatorKeyStr]: visible,
				},
			}));
		},

		// 切换指标可见性
		toggleIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => {
			const currentVisibility = get().getIndicatorVisibility(indicatorKeyStr);
			get().setIndicatorVisibility(indicatorKeyStr, !currentVisibility);
		},

		// 获取指标可见性，默认为true（可见）
		getIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => {
			const { indicatorVisibilityMap } = get();
			return indicatorVisibilityMap[indicatorKeyStr] ?? true; // 默认可见
		},

		// === K线可见性控制方法实现 ===
		// 设置K线可见性
		setKlineVisibility: (klineKeyStr: KlineKeyStr, visible: boolean) => {
			set((state) => ({
				klineVisibilityMap: {
					...state.klineVisibilityMap,
					[klineKeyStr]: visible,
				},
			}));
		},

		// 切换K线可见性
		toggleKlineVisibility: (klineKeyStr: KlineKeyStr) => {
			const currentVisibility = get().getKlineVisibility(klineKeyStr);
			get().setKlineVisibility(klineKeyStr, !currentVisibility);
		},

		// 获取K线可见性，默认为true（可见）
		getKlineVisibility: (klineKeyStr: KlineKeyStr) => {
			const { klineVisibilityMap } = get();
			return klineVisibilityMap[klineKeyStr] ?? true; // 默认可见
		},

		// === 批量操作方法实现 ===
		// 重置所有为可见
		resetAllVisibility: () => {
			set({
				indicatorVisibilityMap: {},
				klineVisibilityMap: {},
			});
		},

		// 批量设置指标可见性
		setBatchIndicatorVisibility: (
			visibilityMap: Record<IndicatorKeyStr, boolean>,
		) => {
			set((state) => ({
				indicatorVisibilityMap: {
					...state.indicatorVisibilityMap,
					...visibilityMap,
				},
			}));
		},

		// 批量设置K线可见性
		setBatchKlineVisibility: (visibilityMap: Record<KlineKeyStr, boolean>) => {
			set((state) => ({
				klineVisibilityMap: {
					...state.klineVisibilityMap,
					...visibilityMap,
				},
			}));
		},



		resetData: () => {
			set({
				klineData: {},
				indicatorData: {},
				// 重置时保持可见性状态，不清空
			});
		},


	}));

// 多实例store管理器
const storeInstances = new Map<
	number,
	ReturnType<typeof createBacktestChartStore>
>();

// 获取或创建指定chartId的store实例
export const getBacktestChartStore = (chartId: number) => {
	if (!storeInstances.has(chartId)) {
		// 获取图表配置
		const chartConfig = useBacktestChartConfigStore.getState().getChartConfig(chartId);
		if (!chartConfig) {
			throw new Error(`Chart config not found for chartId: ${chartId}`);
		}
		storeInstances.set(chartId, createBacktestChartStore(chartId, chartConfig));
	}
	const store = storeInstances.get(chartId);
	if (!store) {
		throw new Error(`Failed to create store for chartId: ${chartId}`);
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
export const useBacktestChartStore = (chartId: number) => {
	const store = getBacktestChartStore(chartId);
	return store();
};

// 获取指定chartId的store实例（不是hook）
export const getBacktestChartStoreInstance = (
	chartId: number,
) => {
	return getBacktestChartStore(chartId);
};
