import type { IndicatorKeyStr, KlineKeyStr } from "@/types/symbol-key";
import type { SliceCreator, VisibilitySlice, BacktestChartStore } from "./types";

export const createVisibilitySlice: SliceCreator<VisibilitySlice> = (set, get) => ({
	// 初始状态：所有指标和K线默认可见
	indicatorVisibilityMap: {},
	klineVisibilityMap: {},

	// === 指标可见性控制方法实现 ===
	// 设置指标可见性
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
		set((state: BacktestChartStore) => ({
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
		set((state: BacktestChartStore) => ({
			indicatorVisibilityMap: {
				...state.indicatorVisibilityMap,
				...visibilityMap,
			},
		}));
	},

	// 批量设置K线可见性
	setBatchKlineVisibility: (visibilityMap: Record<KlineKeyStr, boolean>) => {
		set((state: BacktestChartStore) => ({
			klineVisibilityMap: {
				...state.klineVisibilityMap,
				...visibilityMap,
			},
		}));
	},
});