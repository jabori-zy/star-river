import { toast } from "sonner";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr, OperationKeyStr } from "@/types/symbol-key";
import type { SliceCreator, StoreContext, UtilitySlice } from "./types";

// Data trimming constants
const MAX_DATA_LENGTH = 1000;
const TRIM_AMOUNT = 500;
const VISIBLE_RANGE_THRESHOLD = 100;

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

			// Get all non-deleted indicator keyStr from indicatorChartConfigs array
			const indicatorKeyStrs = (chartConfig?.indicatorChartConfigs || [])
				.filter((indicatorConfig) => !indicatorConfig.isDelete)
				.map((indicatorConfig) => indicatorConfig.indicatorKeyStr);

			// Get all non-deleted operation keyStr from operationChartConfigs array
			const operationKeyStrs = (chartConfig?.operationChartConfigs || [])
				.filter((operationConfig) => !operationConfig.isDelete)
				.map((operationConfig) => operationConfig.operationKeyStr);

			const keyStrs = [klineKeyStr, ...indicatorKeyStrs, ...operationKeyStrs];
			return keyStrs;
		},

		// Only clear all data-related items
		resetData: () => {
			// Clear chart series data
			const state = get();

			// Clear K-line series data
			const klineSeriesRef = state.getKlineSeriesRef();
			if (klineSeriesRef) {
				klineSeriesRef.setData([]);

				klineSeriesRef.priceLines().forEach((priceLine) => {
					klineSeriesRef.removePriceLine(priceLine);
				});
			}

			// Clear all indicator series data
			Object.entries(state.indicatorSeriesRef).forEach(
				([_, indicatorSeries]) => {
					Object.values(indicatorSeries).forEach((seriesRef) => {
						if (seriesRef) {
							seriesRef.setData([]);
						}
					});
				},
			);

			// Clear all operation series data
			Object.entries(state.operationSeriesRef).forEach(
				([_, operationSeries]) => {
					Object.values(operationSeries).forEach((seriesRef) => {
						if (seriesRef) {
							seriesRef.setData([]);
						}
					});
				},
			);

			// Clear order markers
			const orderMarkerSeriesRef = state.getOrderMarkerSeriesRef();
			if (orderMarkerSeriesRef) {
				orderMarkerSeriesRef.setMarkers([]);
			}

			// Clear store state data
			set({
				subscriptions: {},
				indicatorVisibilityMap: {},
				klineVisibilityMap: {},
				paneVersion: 0,
				orderMarkers: [],
				positionPriceLine: [],
				orderPriceLine: [],
				// Keep visibility state during reset, don't clear
			});
		},

		trimKlineData: () => {
			const visibleLogicalRange = get().getVisibleLogicalRange();
			const klineSeries = get().getKlineSeriesRef();

			if (
				!klineSeries ||
				!visibleLogicalRange ||
				visibleLogicalRange.from <= VISIBLE_RANGE_THRESHOLD ||
				klineSeries.data().length <= MAX_DATA_LENGTH
			) {
				return;
			}
			// console.log("klineSeries", klineSeries, "visibleLogicalRange", visibleLogicalRange);
			const newData = klineSeries.data().slice(TRIM_AMOUNT);
			klineSeries.setData(newData);

			if (import.meta.env.DEV) {
				toast.info(`kline trim ${TRIM_AMOUNT} data`);
			}
		},

		trimIndicatorData: (
			indicatorKeyStr: IndicatorKeyStr,
			indicatorValueKey: keyof IndicatorValueConfig,
		) => {
			const visibleLogicalRange = get().getVisibleLogicalRange();
			const indicatorSeriesRef = get().getIndicatorSeriesRef(
				indicatorKeyStr,
				indicatorValueKey,
			);

			if (
				!indicatorSeriesRef ||
				!visibleLogicalRange ||
				visibleLogicalRange.from <= VISIBLE_RANGE_THRESHOLD ||
				indicatorSeriesRef.data().length <= MAX_DATA_LENGTH
			) {
				return;
			}

			const newData = indicatorSeriesRef.data().slice(TRIM_AMOUNT);
			indicatorSeriesRef.setData(newData);

			if (import.meta.env.DEV) {
				toast.info(`${indicatorKeyStr} trim ${TRIM_AMOUNT} data`);
			}
		},

		trimOperationData: (operationKeyStr: OperationKeyStr, outputKey: string) => {
			const visibleLogicalRange = get().getVisibleLogicalRange();
			const operationSeriesRef = get().getOperationSeriesRef(
				operationKeyStr,
				outputKey,
			);

			if (
				!operationSeriesRef ||
				!visibleLogicalRange ||
				visibleLogicalRange.from <= VISIBLE_RANGE_THRESHOLD ||
				operationSeriesRef.data().length <= MAX_DATA_LENGTH
			) {
				return;
			}

			const newData = operationSeriesRef.data().slice(TRIM_AMOUNT);
			operationSeriesRef.setData(newData);

			if (import.meta.env.DEV) {
				toast.info(`${operationKeyStr} trim ${TRIM_AMOUNT} data`);
			}
		},
	});
