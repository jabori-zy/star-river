import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { SliceCreator, StoreContext, UtilitySlice } from "./types";

export const createUtilitySlice =
	(context: StoreContext): SliceCreator<UtilitySlice> =>
	(set, get) => ({
		chartId: context.chartId,
		chartConfig: context.chartConfig,

		setChartConfig: (chartConfig: BacktestChartConfig) => {
			if (get().chartConfig === chartConfig) {
				return;
			}
			set({ chartConfig });
		},

		getChartConfig: () => get().chartConfig,

		getKeyStr: () => {
			const chartConfig = get().chartConfig;
			const klineKeyStr = chartConfig?.klineChartConfig.klineKeyStr;
			if (!klineKeyStr) {
				return [];
			}

			// 从 indicatorChartConfigs 数组中获取所有未删除指标的 keyStr
			const indicatorKeyStrs = (chartConfig?.indicatorChartConfigs || [])
				.filter((indicatorConfig) => !indicatorConfig.isDelete)
				.map((indicatorConfig) => indicatorConfig.indicatorKeyStr);

			const keyStrs = [klineKeyStr, ...indicatorKeyStrs];
			return keyStrs;
		},

		// 只把数据相关的数据，全部清除
		resetData: () => {
			// 清空图表系列数据
			const state = get();

			// 清空K线系列数据
			const klineSeriesRef = state.getKlineSeriesRef();
			if (klineSeriesRef) {
				klineSeriesRef.setData([]);

				klineSeriesRef.priceLines().forEach((priceLine) => {
					klineSeriesRef.removePriceLine(priceLine);
				});
			}

			// 清空所有指标系列数据
			Object.entries(state.indicatorSeriesRef).forEach(
				([_, indicatorSeries]) => {
					Object.values(indicatorSeries).forEach((seriesRef) => {
						if (seriesRef) {
							seriesRef.setData([]);
						}
					});
				},
			);

			// 清空订单标记
			const orderMarkerSeriesRef = state.getOrderMarkerSeriesRef();
			if (orderMarkerSeriesRef) {
				orderMarkerSeriesRef.setMarkers([]);
			}

			// 清空store状态数据
			set({
				subscriptions: {},
				indicatorVisibilityMap: {},
				klineVisibilityMap: {},
				paneVersion: 0,
				orderMarkers: [],
				positionPriceLine: [],
				limitOrderPriceLine: [],
				// 重置时保持可见性状态，不清空
			});
		},
	});
