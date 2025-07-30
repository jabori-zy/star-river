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

let interval: NodeJS.Timeout | null = null;

interface BacktestChartStore {
	reactive: boolean;
	resizeOnUpdate: boolean;
	chartData: Candlestick[];
	isRunning: boolean;
	seriesRef: SeriesApiRef<"Candlestick"> | null;
	chartRef: IChartApi | null;
	subscriptions: Subscription[];
	klineKeyStr: string;
	enabled: boolean;

	initKlineData: (playIndex: number) => void;
	setReactive: (reactive: boolean) => void;
	setResizeOnUpdate: (resizeOnUpdate: boolean) => void;
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

	// 保留原有的定时器方法（用于兼容）
	startSimulation: () => void;
	stopSimulation: () => void;
	resetData: () => void;
}

export const useBacktestChartStore = create<BacktestChartStore>((set, get) => ({
	reactive: true,
	resizeOnUpdate: false,
	chartData: [],
	isRunning: false,
	seriesRef: null,
	chartRef: null,
	subscriptions: [],
	klineKeyStr: "",
	enabled: true,

	setReactive: (reactive: boolean) => set({ reactive }),
	setResizeOnUpdate: (resizeOnUpdate: boolean) => set({ resizeOnUpdate }),
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
				console.log("update data point", point);
				try {
					series.update(point);
					console.log("success update data point");
				} catch (error) {
					console.error("error update data point", error);
				}

				// update data array in store, keep data synchronized
				// const dataLimit = 10000;
				// set((prevState) => ({
				// 	klineData:
				// 		prevState.klineData.length >= dataLimit
				// 			? [...prevState.klineData.slice(1), point]
				// 			: [...prevState.klineData, point],
				// }));
			} else {
				console.log(
					"series API is null, seriesRef exists but API is not available",
				);
				// fallback solution
				const dataLimit = 10000;
				set((prevState) => ({
					chartData:
						prevState.chartData.length >= dataLimit
							? [...prevState.chartData.slice(1), point]
							: [...prevState.chartData, point],
				}));
			}
		} else {
			// if series reference is not available, fallback to original method
			console.log(
				"seriesRef is null, series reference is not available, use fallback solution",
			);
			const dataLimit = 10000;
			set((prevState) => ({
				chartData:
					prevState.chartData.length >= dataLimit
						? [...prevState.chartData.slice(1), point]
						: [...prevState.chartData, point],
			}));
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
		console.log("处理新K线数据:", kline);

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

	startSimulation: () => {
		// 已移除模拟数据生成逻辑，现在使用 Observer 数据流
		console.log("startSimulation: 现在使用 Observer 数据流，无需模拟数据");
	},

	stopSimulation: () => {
		if (interval) {
			clearInterval(interval);
			interval = null;
			set({ isRunning: false });
		}
	},

	initKlineData: async (playIndex: number) => {
		const state = get();
		console.log("playIndex: ", playIndex);

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
				set({ chartData: klineData }); // 设置 klineData 字段

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
		const { stopSimulation } = get();
		stopSimulation();
		set({ chartData: [] });
	},
}));
