import type {
	IChartApi,
	IPaneApi,
	ISeriesApi,
	SingleValueData,
	Time,
	UTCTimestamp,
} from "lightweight-charts";
import type { Subscription } from "rxjs";
import { create } from "zustand";
import { createStatsStream } from "@/hooks/obs/backtest-strategy-data-obs";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import type { StrategyStats, StrategyStatsName } from "@/types/statistics";
import type { BacktestStrategyStatsUpdateEvent } from "@/types/strategy-event/backtest-strategy-event";
import { getStrategyStatsHistory } from "@/service/backtest-strategy/strategy-stats";

interface BacktestStatsChartStore {
	strategyId: number;
	statsData: Partial<Record<StrategyStatsName, SingleValueData[]>>; // 统计数据，key为统计名称
	subscriptions: Subscription[]; // 订阅集合

	// 数据初始化状态标志
	isDataInitialized: boolean;

	// 各种ref引用存储
	chartRef: IChartApi | null;
	statsPaneRefs: Partial<Record<StrategyStatsName, IPaneApi<Time> | null>>; // 每个统计图表的pane引用
	statsSeriesRefs: Partial<Record<StrategyStatsName, ISeriesApi<"Line"> | null>>; // 每个统计数据的series引用
	statsPaneHtmlElementRefs: Partial<Record<StrategyStatsName, HTMLElement | null>>; // 每个统计图表的pane HTML元素引用


	//数据初始化方法
	initChartData: (playIndex: number, strategyId: number) => Promise<void>;

	// === 数据管理方法 ===
	setStatsData: (statsName: StrategyStatsName, data: SingleValueData[]) => void;
	getStatsData: (statsName: StrategyStatsName) => SingleValueData[];
	deleteStatsData: (statsName: StrategyStatsName) => void;

	// 数据初始化状态管理
	getIsDataInitialized: () => boolean;
	setIsDataInitialized: (initialized: boolean) => void;

	// === ref 管理方法 ===
	setChartRef: (chart: IChartApi | null) => void;
	getChartRef: () => IChartApi | null;

	setStatsPaneRef: (statsName: StrategyStatsName, ref: IPaneApi<Time>) => void;
	deleteStatsPaneRef: (statsName: StrategyStatsName) => void;
	getStatsPaneRef: (statsName: StrategyStatsName) => IPaneApi<Time> | null;

	setStatsSeriesRef: (statsName: StrategyStatsName, ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">) => void;
	deleteStatsSeriesRef: (statsName: StrategyStatsName) => void;
	getStatsSeriesRef: (statsName: StrategyStatsName) => ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null;

	addStatsPaneHtmlElementRef: (statsName: StrategyStatsName, htmlElement: HTMLElement) => void;
	getStatsPaneHtmlElementRef: (statsName: StrategyStatsName) => HTMLElement | null;

	// Observer 相关方法
	initObserverSubscriptions: () => void;
	cleanupSubscriptions: () => void;
	onNewStatsData: (statsData: StrategyStats) => void;

	resetData: () => void;
}

// 创建单个统计图表store的工厂函数
const createBacktestStatsChartStore = (
	strategyId: number,
	_chartConfig: BacktestStrategyStatsChartConfig,
) =>
	create<BacktestStatsChartStore>((set, get) => ({
		strategyId: strategyId,

		statsData: {},
		subscriptions: [],

		// 数据初始化状态
		isDataInitialized: false,

		// === ref 引用初始化 ===
		chartRef: null,
		statsPaneRefs: {},
		statsSeriesRefs: {},
		statsPaneHtmlElementRefs: {},

		// 数据初始化方法
		initChartData: async (playIndex: number, strategyId: number) => {
			const state = get();
			if (playIndex > -1) {
				const initialStatsData = await getStrategyStatsHistory(strategyId, playIndex);
				if (initialStatsData) {

					const balanceStatsData: SingleValueData[] = []
					const unrealizedPnlStatsData: SingleValueData[] = []
					const totalEquityStatsData: SingleValueData[] = []
					const positionStatsData: SingleValueData[] = []
					const realizedPnlStatsData: SingleValueData[] = []
					const cumulativeReturnStatsData: SingleValueData[] = []

					initialStatsData.forEach((statsData) => {
						const timestamp = statsData.timestamp / 1000 as UTCTimestamp;
						balanceStatsData.push({
							time: statsData.timestamp / 1000 as UTCTimestamp,
							value: statsData.balance,
						});
						unrealizedPnlStatsData.push({
							time: timestamp,
							value: statsData.unrealizedPnl,
						});
						totalEquityStatsData.push({
							time: timestamp,
							value: statsData.totalEquity,
						});
						positionStatsData.push({
							time: timestamp,
							value: statsData.positionCount,
						});
						realizedPnlStatsData.push({
							time: timestamp,
							value: statsData.realizedPnl,
						});
						cumulativeReturnStatsData.push({
							time: timestamp,
							value: statsData.cumulativeReturn,
						});
					});

					state.setStatsData("balance", balanceStatsData);
					state.setStatsData("unrealizedPnl", unrealizedPnlStatsData);
					state.setStatsData("totalEquity", totalEquityStatsData);
					state.setStatsData("positionCount", positionStatsData);
					state.setStatsData("realizedPnl", realizedPnlStatsData);
					state.setStatsData("cumulativeReturn", cumulativeReturnStatsData);

					state.setIsDataInitialized(true);
				}
			}
		},

		// === 数据管理方法 ===
		setStatsData: (statsName: StrategyStatsName, data: SingleValueData[]) => {
			set((state) => ({
				statsData: { ...state.statsData, [statsName]: data },
			}));
		},
		getStatsData: (statsName: StrategyStatsName) =>
			get().statsData[statsName] || [],
		deleteStatsData: (statsName: StrategyStatsName) =>
			set((state) => {
				const { [statsName]: _, ...rest } = state.statsData;
				return { statsData: rest };
			}),

		// 数据初始化状态管理
		getIsDataInitialized: () => get().isDataInitialized,
		setIsDataInitialized: (initialized: boolean) =>
			set({ isDataInitialized: initialized }),


		// === ref 管理方法实现 ===
		setChartRef: (chart: IChartApi | null) => set({ chartRef: chart }),
		getChartRef: () => get().chartRef,

		setStatsPaneRef: (statsName: StrategyStatsName, ref: IPaneApi<Time>) =>
			set({
				statsPaneRefs: { ...get().statsPaneRefs, [statsName]: ref },
			}),
		getStatsPaneRef: (statsName: StrategyStatsName) =>
			get().statsPaneRefs[statsName] || null,
		deleteStatsPaneRef: (statsName: StrategyStatsName) =>
			set({
				statsPaneRefs: { ...get().statsPaneRefs, [statsName]: null },
			}),

		setStatsSeriesRef: (statsName: StrategyStatsName, ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">) =>
			set({
				statsSeriesRefs: { ...get().statsSeriesRefs, [statsName]: ref },
			}),
		getStatsSeriesRef: (statsName: StrategyStatsName) =>
			get().statsSeriesRefs[statsName] || null,
		deleteStatsSeriesRef: (statsName: StrategyStatsName) =>
			set({
				statsSeriesRefs: { ...get().statsSeriesRefs, [statsName]: null },
			}),

		addStatsPaneHtmlElementRef: (statsName: StrategyStatsName, htmlElement: HTMLElement) =>
			set({
				statsPaneHtmlElementRefs: { ...get().statsPaneHtmlElementRefs, [statsName]: htmlElement },
			}),
		getStatsPaneHtmlElementRef: (statsName: StrategyStatsName) =>
			get().statsPaneHtmlElementRefs[statsName] || null,

		// Observer 相关方法
		initObserverSubscriptions: () => {
			const state = get();

			// 清理现有订阅
			state.cleanupSubscriptions();

			try {
				// 订阅统计数据流
				const statsStream = createStatsStream(true);
				const statsSubscription = statsStream.subscribe({
					next: (statsEvent: BacktestStrategyStatsUpdateEvent) => {
						state.onNewStatsData(statsEvent.statsSnapshot);
					},
					error: (error) => {
						console.error("统计数据流订阅错误:", error);
					},
				});

				set({
					subscriptions: [statsSubscription],
				});
			} catch (error) {
				console.error("初始化统计数据 Observer 订阅时出错:", error);
			}
		},

		cleanupSubscriptions: () => {
			const state = get();

			state.subscriptions.forEach((subscription, index) => {
				try {
					subscription.unsubscribe();
				} catch (error) {
					console.error(`清理订阅 ${index} 时出错:`, error);
				}
			});

			set({ subscriptions: [] });
		},

		onNewStatsData: (statsData: StrategyStats) => {
			const state = get();
			const timestamp = statsData.timestamp / 1000 as UTCTimestamp;

			// 处理每个统计数据
			Object.entries(statsData).forEach(([statsName, value]) => {
				const existingData = state.getStatsData(statsName as StrategyStatsName);
				const newDataPoint: SingleValueData = {
					time: timestamp,
					value: value,
				};

				// 获取最后一个数据点
				const lastData = existingData[existingData.length - 1];

				// 更新series
				const seriesRef = state.getStatsSeriesRef(statsName as StrategyStatsName);
				if (seriesRef) {
					seriesRef.update(newDataPoint);
				}

				// 如果最后一个数据点的时间戳与新数据点的时间戳相同，则替换最后一个数据点
				if (lastData && lastData.time === timestamp) {
					const newData = [...existingData.slice(0, -1), newDataPoint];
					state.setStatsData(statsName as StrategyStatsName, newData);
				} else {
					const newData = [...existingData, newDataPoint];
					state.setStatsData(statsName as StrategyStatsName, newData);
				}
			});
		},

		// 清空数据
		resetData: () => {
			const state = get();

			// 清空所有统计series数据
			Object.values(state.statsSeriesRefs).forEach((seriesRef) => {
				if (seriesRef) {
					seriesRef.setData([]);
				}
			});

			// 清空store状态数据
			set({
				statsData: {},
			});
		},
	}));

// 多实例store管理器
const storeInstances = new Map<
	number,
	ReturnType<typeof createBacktestStatsChartStore>
>();

// 获取或创建指定strategyId的store实例
export const getBacktestStatsChartStore = (
	strategyId: number,
	chartConfig?: BacktestStrategyStatsChartConfig,
) => {
	if (!storeInstances.has(strategyId)) {
		if (!chartConfig) {
			throw new Error(`Chart config not found for strategyId: ${strategyId}`);
		}
		storeInstances.set(
			strategyId,
			createBacktestStatsChartStore(strategyId, chartConfig),
		);
	}
	const store = storeInstances.get(strategyId);
	if (!store) {
		throw new Error(`Failed to create store for strategyId: ${strategyId}`);
	}
	return store;
};

// 清理指定strategyId的store实例
export const cleanupBacktestStatsChartStore = (strategyId: number) => {
	const store = storeInstances.get(strategyId);
	if (store) {
		// 清理订阅
		const state = store.getState();
		state.cleanupSubscriptions();
		// 从管理器中移除
		storeInstances.delete(strategyId);
	}
};

// Hook：根据strategyId获取对应的store
export const useBacktestStatsChartStore = (
	strategyId: number,
	chartConfig?: BacktestStrategyStatsChartConfig,
) => {
	const store = getBacktestStatsChartStore(strategyId, chartConfig);
	return store();
};

// 获取指定strategyId的store实例（不是hook）
export const getBacktestStatsChartStoreInstance = (strategyId: number) => {
	return getBacktestStatsChartStore(strategyId);
};

export const resetAllBacktestStatsChartStore = () => {
	storeInstances.forEach((store) => {
		store.getState().resetData();
	});
};
