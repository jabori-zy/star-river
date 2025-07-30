import type { IChartApi, Time, UTCTimestamp } from "lightweight-charts";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import type { Subscription } from "rxjs";
import { create } from "zustand";
import { createKlineStreamFromKey } from "@/hooks/obs/backtest-strategy-data-obs";
import { getInitialChartData } from "@/service/chart";
import type { Kline } from "@/types/kline";

export type Candlestick = {
	time: Time; // 使用 lightweight-charts 的 Time 类型
	open: number;
	high: number;
	low: number;
	close: number;
};

interface BacktestChartStore {
	chartId: number;
	chartData: Candlestick[];
	isRunning: boolean;
	seriesRef: SeriesApiRef<"Candlestick"> | null;
	chartRef: IChartApi | null;
	subscriptions: Subscription[];
	klineKeyStr: string;
	enabled: boolean;
	isInitialized: boolean; // 标记是否已经初始化过数据

	initKlineData: (playIndex: number) => void;
	setData: (data: Candlestick[]) => void;
	setSeriesRef: (ref: SeriesApiRef<"Candlestick">) => void;
	setChartRef: (chart: IChartApi) => void;
	setKlineKeyStr: (keyStr: string) => void;
	setEnabled: (enabled: boolean) => void;
	updateSinglePoint: (point: Candlestick) => void;

	// Observer 相关方法
	initObserverSubscriptions: () => void;
	cleanupSubscriptions: () => void;
	onNewKline: (kline: Kline) => void;

	resetData: () => void;
}

// 创建单个图表store的工厂函数
const createBacktestChartStore = (chartId: number) => create<BacktestChartStore>((set, get) => ({
	chartId: chartId,
	chartData: [],
	isRunning: false,
	seriesRef: null,
	chartRef: null,
	subscriptions: [],
	klineKeyStr: "",
	enabled: true,
	isInitialized: false,

	setData: (data: Candlestick[]) => set(() => ({ chartData: data })),
	setSeriesRef: (ref: SeriesApiRef<"Candlestick">) => {
		set({ seriesRef: ref });

		// after setting series reference, check if there is data to set
		const state = get();
		if (state.chartData && state.chartData.length > 0) {
			const series = ref.api();
			if (series) {
				console.log(
					"set series reference and set data immediately, data length:",
					state.chartData.length,
				);
				series.setData(state.chartData);
			}
		}
	},
	setChartRef: (chart: IChartApi) => set({ chartRef: chart }),
	setKlineKeyStr: (keyStr: string) => set({ klineKeyStr: keyStr }),
	setEnabled: (enabled: boolean) => set({ enabled }),

	updateSinglePoint: (point: Candlestick) => {
		const state = get();
		if (state.seriesRef) {
			const series = state.seriesRef.api();
			console.log("series API:", series);

			if (series) {
				// use series.update to update single data point
				// console.log("update data point", point);
				try {
					series.update(point);
				} catch (error) {
					console.error("error update data point", error);
				}
			} else {
				console.log(
					"series API is null, seriesRef exists but API is not available",
				);
				// fallback solution
				// const dataLimit = 10000;
				// set((prevState) => ({
				// 	chartData:
				// 		prevState.chartData.length >= dataLimit
				// 			? [...prevState.chartData.slice(1), point]
				// 			: [...prevState.chartData, point],
				// }));
			}
		} else {
			// if series reference is not available, fallback to original method
			console.log(
				"seriesRef is null, series reference is not available, use fallback solution",
			);
			// const dataLimit = 10000;
			// set((prevState) => ({
			// 	chartData:
			// 		prevState.chartData.length >= dataLimit
			// 			? [...prevState.chartData.slice(1), point]
			// 			: [...prevState.chartData, point],
			// }));
		}
	},

	// Observer 相关方法
	initObserverSubscriptions: () => {
		const state = get();

		// 清理现有订阅
		state.cleanupSubscriptions();

		if (!state.enabled || !state.klineKeyStr) {
			console.log("Observer 未启用或缺少 klineKeyStr，跳过订阅");
			return;
		}

		console.log("初始化 Observer 订阅，klineKeyStr:", state.klineKeyStr);

		const subscriptions: Subscription[] = [];

		try {
			// 1. 订阅K线数据流
			const klineStream = createKlineStreamFromKey(
				state.klineKeyStr,
				state.enabled,
			);
			const klineSubscription = klineStream.subscribe({
				next: (klineData: Kline[]) => {
					console.log(`=== 收到K线数据流更新 ===`);
					console.log(`K线数据长度: ${klineData.length}`);

					if (klineData.length > 0) {
						const latestKline = klineData[klineData.length - 1];
						console.log(`最新K线:`, latestKline);

						// 调用 onNewKline 处理新K线数据
						state.onNewKline(latestKline);
					}
				},
				error: (error) => {
					console.error("K线数据流订阅错误:", error);
				},
			});
			subscriptions.push(klineSubscription);

			// 更新订阅列表
			set({ subscriptions });

			console.log("Observer 订阅初始化完成，订阅数量:", subscriptions.length);
		} catch (error) {
			console.error("初始化 Observer 订阅时出错:", error);
		}
	},

	cleanupSubscriptions: () => {
		const state = get();
		console.log(
			"清理 Observer 订阅，当前订阅数量:",
			state.subscriptions.length,
		);

		state.subscriptions.forEach((subscription, index) => {
			try {
				subscription.unsubscribe();
				console.log(`订阅 ${index} 已清理`);
			} catch (error) {
				console.error(`清理订阅 ${index} 时出错:`, error);
			}
		});

		set({ subscriptions: [] });
	},

	onNewKline: (kline: Kline) => {
		// 将 Kline 数据转换为 FlexibleCandlestickData 格式
		// 后端返回毫秒级时间戳，转换为秒级时间戳
		const timestampInSeconds = Math.floor(
			kline.timestamp / 1000,
		) as UTCTimestamp;
		const candlestickData: Candlestick = {
			time: timestampInSeconds, // 转换为秒级时间戳
			open: kline.open,
			high: kline.high,
			low: kline.low,
			close: kline.close,
		};

		// 使用现有的 updateSinglePoint 方法更新图表
		const state = get();
		state.updateSinglePoint(candlestickData);
	},

	initKlineData: async (playIndex: number) => {
		const state = get();
		console.log("initKlineData called:", {
			chartId: state.chartId,
			playIndex,
			isInitialized: state.isInitialized,
			hasData: state.chartData.length > 0
		});

		// 如果已经初始化过且有数据，跳过重复初始化
		if (state.isInitialized && state.chartData.length > 0) {
			console.log("图表已初始化，跳过重复初始化:", state.chartId);
			return;
		}

		if (playIndex > -1) {
			const initialKlines = (await getInitialChartData(
				state.klineKeyStr,
				playIndex,
				null,
			)) as Kline[];

			if (initialKlines && initialKlines.length > 0) {
				const klineData: Candlestick[] = initialKlines.map((kline) => ({
					time: Math.floor(kline.timestamp / 1000) as UTCTimestamp,
					open: kline.open,
					high: kline.high,
					low: kline.low,
					close: kline.close,
				}));

				// console.log("初始化K线数据: ", klineData);
				// console.log("数据长度: ", klineData.length);
				// console.log("第一个数据点: ", klineData[0]);
				// console.log("最后一个数据点: ", klineData[klineData.length - 1]);
				set({ chartData: klineData, isInitialized: true }); // 设置数据并标记为已初始化

				// 如果 series 已经可用，立即设置数据
				const state = get();
				if (state.seriesRef) {
					const series = state.seriesRef.api();
					if (series) {
						console.log("立即设置 series 数据");
						series.setData(klineData);
					}
				}
			} else {
				console.warn("没有获取到初始K线数据");
			}
		}
	},

	resetData: () => {
		set({ chartData: [], isInitialized: false });
	},
}));

// 多实例store管理器
const storeInstances = new Map<number, ReturnType<typeof createBacktestChartStore>>();

// 获取或创建指定chartId的store实例
export const getBacktestChartStore = (chartId: number) => {
	if (!storeInstances.has(chartId)) {
		storeInstances.set(chartId, createBacktestChartStore(chartId));
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
export const useBacktestChartStore = (chartId: number) => {
	const store = getBacktestChartStore(chartId);
	return store();
};

// 获取指定chartId的store实例（不是hook）
export const getBacktestChartStoreInstance = (chartId: number) => {
	return getBacktestChartStore(chartId);
};
