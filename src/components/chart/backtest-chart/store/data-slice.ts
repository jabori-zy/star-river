import type { CandlestickData, SingleValueData } from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr, KeyStr, KlineKeyStr } from "@/types/symbol-key";
import type { SliceCreator, DataSlice, BacktestChartStore } from "./types";

export const createDataSlice: SliceCreator<DataSlice> = (set, get) => ({
	klineKeyStr: null,
	klineData: [],
	indicatorData: {},
	isDataInitialized: false,

	visibleLogicalRangeFrom: null,

	setKlineKeyStr: (klineKeyStr: KlineKeyStr) => set({ klineKeyStr: klineKeyStr }),

	getKlineKeyStr: () => get().klineKeyStr || null,

	// setKlineData: (data: CandlestickData[]) => set({ klineData: data }),

	// getKlineData: () => get().klineData,

	// deleteKlineData: () => set({ klineData: [] }),

	// setIndicatorData: (
	// 	keyStr: KeyStr,
	// 	data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	// ) => {
	// 	set((state: BacktestChartStore) => ({
	// 		indicatorData: { ...state.indicatorData, [keyStr]: data },
	// 	}));
	// },

	// getIndicatorData: (indicatorKeyStr: IndicatorKeyStr) => get().indicatorData[indicatorKeyStr] || {},

	// 直接整个删除key和value，而不是置为空
	// deleteIndicatorData: (indicatorKeyStr: IndicatorKeyStr) =>
	// 	set((state: BacktestChartStore) => {
	// 		const { [indicatorKeyStr]: _, ...rest } = state.indicatorData;
	// 		console.log("删除indicatorData:", indicatorKeyStr, rest);
	// 		return { indicatorData: rest };
	// 	}),

	getIsDataInitialized: () => get().isDataInitialized,

	setIsDataInitialized: (initialized: boolean) =>
		set({ isDataInitialized: initialized }),

	// getLastKline: () => {
	// 	const data = get().klineData || [];
	// 	return data[data.length - 1] || null;
	// },

	setVisibleLogicalRangeFrom: (from: number) => set({ visibleLogicalRangeFrom: from }),

	getVisibleLogicalRangeFrom: () => get().visibleLogicalRangeFrom,
});