import type {
	CandlestickData,
	IChartApi,
	IPaneApi,
	ISeriesApi,
	SingleValueData,
	Time,
	UTCTimestamp,
} from "lightweight-charts";
import type { Subscription } from "rxjs";
import { create } from "zustand";
import {
	createIndicatorStreamFromKey,
	createKlineStreamFromKey,
} from "@/hooks/obs/backtest-strategy-data-obs";
import { getInitialChartData } from "@/service/chart";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { ChartId } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { Kline } from "@/types/kline";
import type { IndicatorKeyStr, KeyStr, KlineKeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

interface BacktestChartStore {
	chartId: ChartId;
	// chartConfig: BacktestChartConfig;

	// initialKlineData: Record<KlineKeyStr, CandlestickData[]>; // 初始k线数据
	// initialIndicatorData: Record<IndicatorKeyStr,Record<keyof IndicatorValueConfig, SingleValueData[]>>; // 初始指标数据

	// klineData: Record<KlineKeyStr, CandlestickData[]>; // k线数据 和 指标数据 的集合
	klineKeyStr: KlineKeyStr | null;
	klineData: CandlestickData[];
	indicatorData: Record<
		IndicatorKeyStr,
		Record<keyof IndicatorValueConfig, SingleValueData[]>
	>; // 指标数据
	subscriptions: Record<KeyStr, Subscription[]>; // 订阅集合

	// 数据初始化状态标志
	isDataInitialized: boolean;

	// 各种ref引用存储
	chartRef: IChartApi | null;
	// klineSeriesRef: Record<KlineKeyStr, ISeriesApi<"Candlestick"> | null>;
	klineSeriesRef: ISeriesApi<"Candlestick"> | null;
	indicatorSeriesRef: Record<
		IndicatorKeyStr,
		Record<
			keyof IndicatorValueConfig,
			ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null
		>
	>;
	subChartPaneRef: Record<IndicatorKeyStr, IPaneApi<Time> | null>;

	// === Pane 版本号，用于强制重新渲染 legend ===
	paneVersion: number;

	// === 系列可见性状态 ===
	// 存储每个指标的可见性状态，key为indicatorKeyStr，value为是否可见
	indicatorVisibilityMap: Record<IndicatorKeyStr, boolean>;
	// 存储每个K线的可见性状态，key为klineKeyStr，value为是否可见
	klineVisibilityMap: Record<KlineKeyStr, boolean>;

	// === 图表配置 ===
	// getChartConfig: () => BacktestChartConfig;
	// setChartConfig: (chartConfig: BacktestChartConfig) => void;
	// syncChartConfig: () => void; // 同步最新的图表配置

	initChartData: (playIndex: number) => Promise<void>;
	initKlineData: (playIndex: number) => Promise<void>;
	initIndicatorData: (
		indicatorKeyStr: IndicatorKeyStr,
		playIndex: number,
	) => Promise<void>;

	// 私有方法（内部使用）
	_processKlineData: (klinekeyStr: KeyStr, playIndex: number) => Promise<void>;
	_processIndicatorData: (
		keyStr: KeyStr,
		playIndex: number,
	) => Promise<Record<keyof IndicatorValueConfig, SingleValueData[]> | null>;
	_initSingleKeyData: (
		keyStr: KeyStr,
		playIndex: number,
	) => Promise<Record<
		keyof IndicatorValueConfig,
		SingleValueData[]
	> | null | undefined>;

	// setInitialKlineData: (keyStr: KlineKeyStr, data: CandlestickData[]) => void;
	// setInitialIndicatorData: (keyStr: IndicatorKeyStr, data: Record<keyof IndicatorValueConfig, SingleValueData[]>) => void;

	setKlineKeyStr: (klineKeyStr: KlineKeyStr) => void;
	getKlineKeyStr: () => KlineKeyStr | null;
	setKlineData: (data: CandlestickData[]) => void;
	getKlineData: () => CandlestickData[];
	deleteKlineData: () => void;
	setIndicatorData: (
		keyStr: KeyStr,
		data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	) => void;
	getIndicatorData: (indicatorKeyStr: IndicatorKeyStr) => Record<keyof IndicatorValueConfig, SingleValueData[]>;
	deleteIndicatorData: (indicatorKeyStr: IndicatorKeyStr) => void;

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
	/**
	 * 设置图表实例引用
	 * 
	 * 关键修复：支持传入null值以清理图表引用
	 * 
	 * 使用场景：
	 * 1. 图表初始化时保存图表实例
	 * 2. 容器引用丢失时清理旧实例（传入null）
	 * 3. 图表销毁时释放引用
	 */
	setChartRef: (chart: IChartApi | null) => void;
	getChartRef: () => IChartApi | null;

	setKlineSeriesRef: (ref: ISeriesApi<"Candlestick">) => void;
	getKlineSeriesRef: () => ISeriesApi<"Candlestick"> | null;
	deleteKlineSeriesRef: () => void;

	setIndicatorSeriesRef: (
		indicatorKeyStr: IndicatorKeyStr,
		indicatorValueKey: keyof IndicatorValueConfig,
		ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">,
	) => void;
	
	getIndicatorSeriesRef: (
		indicatorKeyStr: IndicatorKeyStr,
		indicatorValueKey: keyof IndicatorValueConfig,
	) => ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null;
	deleteIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr) => void;

	setSubChartPaneRef: (
		indicatorKeyStr: IndicatorKeyStr,
		ref: IPaneApi<Time>,
	) => void;
	deleteSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) => void;
	getSubChartPaneRef: (
		indicatorKeyStr: IndicatorKeyStr,
	) => IPaneApi<Time> | null;

	// Pane 版本号管理
	getPaneVersion: () => number;
	incrementPaneVersion: () => void;

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
const createBacktestChartStore = (
	chartId: number,
	chartConfig: BacktestChartConfig,
) =>
	create<BacktestChartStore>((set, get) => ({
		chartId: chartId,
		chartConfig: chartConfig,

		// initialKlineData: {},
		// initialIndicatorData: {},

		klineKeyStr: null,
		klineData: [],
		indicatorData: {},
		subscriptions: {},

		// 数据初始化状态
		isDataInitialized: false,

		// === ref 引用初始化 ===
		chartRef: null,
		klineSeriesRef: null,
		indicatorSeriesRef: {},
		subChartPaneRef: {},

		// === Pane 版本号初始化 ===
		paneVersion: 0,

		// === 系列可见性状态初始化 ===
		// 初始状态：所有指标和K线默认可见
		indicatorVisibilityMap: {},
		klineVisibilityMap: {},

		// getChartConfig: () => get().chartConfig,
		// setChartConfig: (chartConfig: BacktestChartConfig) => {
		// 	set({ chartConfig: chartConfig });
		// },

		// 同步最新的图表配置
		// syncChartConfig: () => {
		// 	const latestConfig = useBacktestChartConfigStore
		// 		.getState()
		// 		.getChartConfig(chartId);
		// 	if (latestConfig) {
		// 		set({ chartConfig: latestConfig });
		// 	}
		// },

		// === 数据管理方法 ===
		setKlineKeyStr: (klineKeyStr: KlineKeyStr) => set({ klineKeyStr: klineKeyStr }),
		getKlineKeyStr: () => get().klineKeyStr || null,
		setKlineData: (data: CandlestickData[]) => set({ klineData: data }),
		getKlineData: () => get().klineData,
		deleteKlineData: () => set({ klineData: [] }),

		setIndicatorData: (
			keyStr: KeyStr,
			data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
		) => {
			set((state) => ({
				indicatorData: { ...state.indicatorData, [keyStr]: data },
			}));
		},
		getIndicatorData: (indicatorKeyStr: IndicatorKeyStr) => get().indicatorData[indicatorKeyStr] || {},
		
		// 直接整个删除key和value，而不是置为空
		deleteIndicatorData: (indicatorKeyStr: IndicatorKeyStr) =>
			set((state) => {
				const { [indicatorKeyStr]: _, ...rest } = state.indicatorData;
				return { indicatorData: rest };
			}),

		// 数据初始化状态管理
		getIsDataInitialized: () => get().isDataInitialized,
		setIsDataInitialized: (initialized: boolean) =>
			set({ isDataInitialized: initialized }),

		getLastKline: () => {
			const data = get().klineData || [];
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
		/**
		 * 设置图表实例引用的实现
		 * 
		 * 修复说明：
		 * - 原来只接受IChartApi，现在支持null值
		 * - 当传入null时，表示清理图表引用，用于容器引用丢失后的重新初始化
		 */
		setChartRef: (chart: IChartApi | null) => set({ chartRef: chart }),
		getChartRef: () => get().chartRef,

		setKlineSeriesRef: (ref: ISeriesApi<"Candlestick">) =>
			set({ klineSeriesRef: ref }),
		getKlineSeriesRef: () =>
			get().klineSeriesRef || null,
		deleteKlineSeriesRef: () =>
			set({ klineSeriesRef: null }),

		setIndicatorSeriesRef: (
			indicatorKeyStr: IndicatorKeyStr,
			indicatorValueKey: keyof IndicatorValueConfig,
			ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">,
		) =>
			set({
				indicatorSeriesRef: {
					...get().indicatorSeriesRef,
					[indicatorKeyStr]: {
						...get().indicatorSeriesRef[indicatorKeyStr],
						[indicatorValueKey]: ref,
					},
				},
			}),
		getIndicatorSeriesRef: (
			indicatorKeyStr: IndicatorKeyStr,
			indicatorValueKey: keyof IndicatorValueConfig,
		) => get().indicatorSeriesRef[indicatorKeyStr]?.[indicatorValueKey] || null,

		deleteIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr) =>
			set({
				indicatorSeriesRef: {
					...get().indicatorSeriesRef,
					[indicatorKeyStr]: {},
				},
			}),

		setSubChartPaneRef: (
			indicatorKeyStr: IndicatorKeyStr,
			ref: IPaneApi<Time>,
		) =>
			set({
				subChartPaneRef: { ...get().subChartPaneRef, [indicatorKeyStr]: ref },
			}),
		getSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) =>
			get().subChartPaneRef[indicatorKeyStr] || null,
		deleteSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) =>
			set({
				subChartPaneRef: { ...get().subChartPaneRef, [indicatorKeyStr]: null },
			}),

		// Pane 版本号管理
		getPaneVersion: () => get().paneVersion,
		incrementPaneVersion: () => set({ paneVersion: get().paneVersion + 1 }),

		getKeyStr: () => {
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
								const indicator: Record<
									keyof IndicatorValueConfig,
									SingleValueData[]
								> = {};

								indicatorData.forEach((item) => {
									Object.entries(item).forEach(([indicatorValueKey, value]) => {
										indicator[indicatorValueKey as keyof IndicatorValueConfig] =
											[
												...(indicator[
													indicatorValueKey as keyof IndicatorValueConfig
												] || []),
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
			const klineSeries = get().getKlineSeriesRef();
			if (klineSeries) {
				klineSeries.update(candlestickData);
			}

			// 获取最后一根k线
			const lastData = get().getLastKline(klineKeyStr);

			// 如果最后一根k线的时间戳与新k线的时间戳相同，则替换最后一根k线
			if (lastData && lastData.time === timestampInSeconds) {
				const data = get().klineData;
				// 创建新数组，替换最后一根k线
				const newData = [...data.slice(0, -1), candlestickData];
				get().setKlineData(newData);
			} else {
				const data = get().klineData;
				// 说明策略还未开始，当前是第一根k线
				if (!data) {
					get().setKlineData([candlestickData]);
				}

				// 创建新数组，添加新k线
				const newData = [...data, candlestickData];
				get().setKlineData(newData);
			}
		},

		onNewIndicator: (
			indicatorKeyStr: KeyStr,
			indicator: Record<keyof IndicatorValueConfig, SingleValueData[]>,
		) => {
			const existingIndicatorData = get().indicatorData[indicatorKeyStr] || {};
			const indicatorConfig = chartConfig.indicatorChartConfigs.find(
				(config) => config.indicatorKeyStr === indicatorKeyStr,
			);
			const isInMainChart = indicatorConfig?.isInMainChart;

			// 处理每个指标值字段
			const updatedIndicator: Record<
				keyof IndicatorValueConfig,
				SingleValueData[]
			> = { ...existingIndicatorData };

			Object.entries(indicator).forEach(([indicatorValueKey, newDataArray]) => {
				const indicatorValueField =
					indicatorValueKey as keyof IndicatorValueConfig;
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
					const indicatorSeriesRef = get().getIndicatorSeriesRef(
						indicatorKeyStr,
						indicatorValueKey,
					);
					if (indicatorSeriesRef) {
						indicatorSeriesRef.update(newDataPoint);
					}

					// 如果最后一个数据点的时间戳与新数据点的时间戳相同，则替换最后一个数据点
					if (lastData && lastData.time === newDataPoint.time) {
						// 创建新数组，替换最后一个数据点
						updatedIndicator[indicatorValueField] = [
							...existingData.slice(0, -1),
							newDataPoint,
						];
					} else {
						// 创建新数组，添加新数据点
						updatedIndicator[indicatorValueField] = [
							...existingData,
							newDataPoint,
						];
					}
				});
			});

			// 更新状态
			set((prevState) => ({
				indicatorData: {
					...prevState.indicatorData,
					[indicatorKeyStr]: updatedIndicator,
				},
			}));
		},

		// 私有方法：处理K线数据
		_processKlineData: async (klineKeyStr: KeyStr, playIndex: number) => {
			const state = get();
			const initialKlines = (await getInitialChartData(
				klineKeyStr,
				playIndex,
				null,
			)) as Kline[];

			// 安全检查：确保 initialKlines 存在且是数组
			if (
				initialKlines &&
				Array.isArray(initialKlines) &&
				initialKlines.length > 0
			) {
				const klineData: CandlestickData[] = initialKlines.map((kline) => ({
					time: Math.floor(kline.timestamp / 1000) as UTCTimestamp,
					open: kline.open,
					high: kline.high,
					low: kline.low,
					close: kline.close,
				}));

				state.setKlineData(klineData);
			} else {
				console.warn(`No kline data received for keyStr: ${klineKeyStr}`);
			}
		},

		// 私有方法：处理指标数据
		_processIndicatorData: async (keyStr: KeyStr, playIndex: number) => {
			const state = get();
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
				const indicatorData: Record<
					keyof IndicatorValueConfig,
					SingleValueData[]
				> = {};
				initialIndicatorData.forEach((item) => {
					Object.entries(item).forEach(([indicatorValueField, value]) => {
						// 过滤掉timestamp和value为0的数据
						if (indicatorValueField !== "timestamp" && value !== 0) {
							indicatorData[indicatorValueField as keyof IndicatorValueConfig] =
								[
									...(indicatorData[
										indicatorValueField as keyof IndicatorValueConfig
									] || []),
									{
										time: Math.floor(item.timestamp / 1000) as UTCTimestamp,
										value: value,
									} as SingleValueData,
								];
						}
					});
				});

				state.setIndicatorData(keyStr, indicatorData);
				return indicatorData;
			} else {
				console.warn(`No indicator data received for keyStr: ${keyStr}`);
				return null;
			}
		},

		// 通用方法：处理单个keyStr的数据初始化
		_initSingleKeyData: async (keyStr: KeyStr, playIndex: number) => {
			const state = get();
			try {
				const key = parseKey(keyStr);

				if (key.type === "kline") {
					await state._processKlineData(keyStr, playIndex);
				} else if (key.type === "indicator") {
					return await state._processIndicatorData(keyStr, playIndex);
				}
			} catch (error) {
				console.error(`Error loading data for keyStr: ${keyStr}`, error);
				return null;
			}
		},

		initChartData: async (playIndex: number) => {
			const state = get();

			if (playIndex > -1) {
				// 使用 Promise.all 等待所有异步操作完成
				const promises = state
					.getKeyStr()
					.map((keyStr) => state._initSingleKeyData(keyStr, playIndex));

				// 等待所有数据加载完成
				await Promise.all(promises);
				// 标记数据已初始化
				state.setIsDataInitialized(true);
			}
		},

		initKlineData: async (playIndex: number) => {
			const state = get();
			const klineKeyStr = state.getKlineKeyStr();
			if (klineKeyStr) {
				await state._processKlineData(klineKeyStr, playIndex);
			}
		},

		initIndicatorData: async (
			indicatorKeyStr: IndicatorKeyStr,
			playIndex: number,
		) => {
			const state = get();

			if (playIndex > -1) {
				try {
					const key = parseKey(indicatorKeyStr);

					// 只处理指标类型的key
					if (key.type === "indicator") {
						await state._processIndicatorData(indicatorKeyStr, playIndex);
					} else {
						console.warn(`Key ${indicatorKeyStr} is not an indicator key`);
					}
				} catch (error) {
					console.error(
						`Error loading indicator data for keyStr: ${indicatorKeyStr}`,
						error,
					);
				}
			} else {
				console.warn(
					`Invalid playIndex: ${playIndex}, skipping indicator data initialization`,
				);
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
				klineData: [],
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
export const getBacktestChartStore = (chartId: number, chartConfig?: BacktestChartConfig) => {
	if (!storeInstances.has(chartId)) {
		// 获取图表配置
		// const chartConfig = useBacktestChartConfigStore
		// 	.getState()
		// 	.getChartConfig(chartConfig.id);
		// if (!chartConfig) {
		// 	throw new Error(`Chart config not found for chartId: ${chartConfig.id}`);
		// }
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
export const cleanupBacktestChartStore = (chartId: number) => {
	const store = storeInstances.get(chartId);
	if (store) {
		// 清理订阅
		const state = store.getState();
		state.cleanupSubscriptions();
		// 从管理器中移除
		storeInstances.delete(chartId);
	}
};

// Hook：根据chartId获取对应的store
export const useBacktestChartStore = (chartId: number, chartConfig?: BacktestChartConfig) => {
	const store = getBacktestChartStore(chartId, chartConfig);
	return store();
};

// 获取指定chartId的store实例（不是hook）
export const getBacktestChartStoreInstance = (chartId: number) => {
	return getBacktestChartStore(chartId);
};
