import type { IndicatorKeyStr, KlineKeyStr } from "@/types/symbol-key";
import type {
	BacktestChartStore,
	SliceCreator,
	VisibilitySlice,
} from "./types";

export const createVisibilitySlice: SliceCreator<VisibilitySlice> = (
	set,
	get,
) => ({
	// Initial state: all indicators and klines are visible by default
	indicatorVisibilityMap: {},
	klineVisibilityMap: {},

	// === Indicator visibility control methods ===
	// Set indicator visibility
	setIndicatorVisibility: (
		indicatorKeyStr: IndicatorKeyStr,
		visible: boolean,
	) => {
		set((state: BacktestChartStore) => ({
			indicatorVisibilityMap: {
				...state.indicatorVisibilityMap,
				[indicatorKeyStr]: visible,
			},
		}));
	},

	// Toggle indicator visibility
	toggleIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => {
		const currentVisibility = get().getIndicatorVisibility(indicatorKeyStr);
		get().setIndicatorVisibility(indicatorKeyStr, !currentVisibility);
	},

	// Get indicator visibility, default is true (visible)
	getIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => {
		const { indicatorVisibilityMap } = get();
		return indicatorVisibilityMap[indicatorKeyStr] ?? true; // Default visible
	},

	// === Kline visibility control methods ===
	// Set kline visibility
	setKlineVisibility: (klineKeyStr: KlineKeyStr, visible: boolean) => {
		set((state: BacktestChartStore) => ({
			klineVisibilityMap: {
				...state.klineVisibilityMap,
				[klineKeyStr]: visible,
			},
		}));
	},

	// Toggle kline visibility
	toggleKlineVisibility: (klineKeyStr: KlineKeyStr) => {
		const currentVisibility = get().getKlineVisibility(klineKeyStr);
		get().setKlineVisibility(klineKeyStr, !currentVisibility);
	},

	// Get kline visibility, default is true (visible)
	getKlineVisibility: (klineKeyStr: KlineKeyStr) => {
		const { klineVisibilityMap } = get();
		return klineVisibilityMap[klineKeyStr] ?? true; // Default visible
	},

	// === Batch operation methods ===
	// Reset all to visible
	resetAllVisibility: () => {
		set({
			indicatorVisibilityMap: {},
			klineVisibilityMap: {},
		});
	},

	// Batch set indicator visibility
	setBatchIndicatorVisibility: (
		visibilityMap: Record<IndicatorKeyStr, boolean>,
	) => {
		set((state: BacktestChartStore) => ({
			indicatorVisibilityMap: {
				...state.indicatorVisibilityMap,
				...visibilityMap,
			},
		}));
	},

	// Batch set kline visibility
	setBatchKlineVisibility: (visibilityMap: Record<KlineKeyStr, boolean>) => {
		set((state: BacktestChartStore) => ({
			klineVisibilityMap: {
				...state.klineVisibilityMap,
				...visibilityMap,
			},
		}));
	},
});
