import type {
	IChartApi,
	IPaneApi,
	ISeriesApi,
	ISeriesMarkersPluginApi,
	Time,
} from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import type { SliceCreator, RefsSlice } from "./types";

export const createRefsSlice: SliceCreator<RefsSlice> = (set, get) => ({
	chartRef: null,
	klineSeriesRef: null,
	indicatorSeriesRef: {},
	orderMarkerSeriesRef: null,
	subChartPaneRef: {},
	subChartPaneHtmlElementRef: {},
	paneVersion: 0,

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

	getIndicatorAllSeriesRef: (indicatorKeyStr: IndicatorKeyStr) => get().indicatorSeriesRef[indicatorKeyStr] || {},

	deleteIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr) =>
		set({
			indicatorSeriesRef: {
				...get().indicatorSeriesRef,
				[indicatorKeyStr]: {},
			},
		}),

	setOrderMarkerSeriesRef: (ref: ISeriesMarkersPluginApi<Time>) =>
		set({ orderMarkerSeriesRef: ref }),

	getOrderMarkerSeriesRef: () =>
		get().orderMarkerSeriesRef || null,

	deleteOrderMarkerSeriesRef: () =>
		set({ orderMarkerSeriesRef: null }),

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

	addSubChartPaneHtmlElementRef: (indicatorKeyStr: IndicatorKeyStr, htmlElement: HTMLElement) =>
		set({
			subChartPaneHtmlElementRef: {
				...get().subChartPaneHtmlElementRef,
				[indicatorKeyStr]: htmlElement
			}
		}),

	getSubChartPaneHtmlElementRef: (indicatorKeyStr: IndicatorKeyStr) =>
		get().subChartPaneHtmlElementRef[indicatorKeyStr] || null,

	// Pane 版本号管理
	getPaneVersion: () => get().paneVersion,

	incrementPaneVersion: () => set({ paneVersion: get().paneVersion + 1 }),
});