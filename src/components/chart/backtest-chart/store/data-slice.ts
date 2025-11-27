import type { LogicalRange } from "lightweight-charts";
import type { KlineKeyStr } from "@/types/symbol-key";
import type { DataSlice, SliceCreator } from "./types";

export const createDataSlice: SliceCreator<DataSlice> = (set, get) => ({
	klineKeyStr: null,
	klineData: [],
	indicatorData: {},
	isDataInitialized: false,

	visibleLogicalRange: null,

	setKlineKeyStr: (klineKeyStr: KlineKeyStr) =>
		set({ klineKeyStr: klineKeyStr }),

	getKlineKeyStr: () => get().klineKeyStr || null,

	getIsDataInitialized: () => get().isDataInitialized,

	setIsDataInitialized: (initialized: boolean) =>
		set({ isDataInitialized: initialized }),

	setVisibleLogicalRange: (logicalRange: LogicalRange) =>
		set({ visibleLogicalRange: logicalRange }),

	getVisibleLogicalRange: () => get().visibleLogicalRange,
});
