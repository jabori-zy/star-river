import type {
	IChartApi,
	IPaneApi,
	ISeriesApi,
	ISeriesMarkersPluginApi,
	Time,
} from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import type { RefsSlice, SliceCreator } from "./types";

export const createRefsSlice: SliceCreator<RefsSlice> = (set, get) => ({
	chartRef: null,
	klineSeriesRef: null,
	indicatorSeriesRef: {},
	orderMarkerSeriesRef: null,
	subChartPaneRef: {},
	subChartPaneHtmlElementRef: {},
	paneVersion: 0,

	/**
	 * Set chart instance reference
	 *
	 * Critical fix: Support passing null value to clean up chart reference
	 *
	 * Use cases:
	 * 1. Save chart instance during chart initialization
	 * 2. Clean up old instance when container reference is lost (pass null)
	 * 3. Release reference when chart is destroyed
	 */
	setChartRef: (chart: IChartApi | null) => set({ chartRef: chart }),

	getChartRef: () => get().chartRef,

	setKlineSeriesRef: (ref: ISeriesApi<"Candlestick">) =>
		set({ klineSeriesRef: ref }),

	getKlineSeriesRef: () => get().klineSeriesRef || null,

	deleteKlineSeriesRef: () => set({ klineSeriesRef: null }),

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

	getIndicatorAllSeriesRef: (indicatorKeyStr: IndicatorKeyStr) =>
		get().indicatorSeriesRef[indicatorKeyStr] || {},

	deleteIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr) =>
		set({
			indicatorSeriesRef: {
				...get().indicatorSeriesRef,
				[indicatorKeyStr]: {},
			},
		}),

	setOrderMarkerSeriesRef: (ref: ISeriesMarkersPluginApi<Time>) =>
		set({ orderMarkerSeriesRef: ref }),

	getOrderMarkerSeriesRef: () => get().orderMarkerSeriesRef || null,

	deleteOrderMarkerSeriesRef: () => set({ orderMarkerSeriesRef: null }),

	setSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr, ref: IPaneApi<Time>) =>
		set({
			subChartPaneRef: { ...get().subChartPaneRef, [indicatorKeyStr]: ref },
		}),

	getSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) =>
		get().subChartPaneRef[indicatorKeyStr] || null,

	deleteSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) =>
		set({
			subChartPaneRef: { ...get().subChartPaneRef, [indicatorKeyStr]: null },
		}),

	addSubChartPaneHtmlElementRef: (
		indicatorKeyStr: IndicatorKeyStr,
		htmlElement: HTMLElement,
	) =>
		set({
			subChartPaneHtmlElementRef: {
				...get().subChartPaneHtmlElementRef,
				[indicatorKeyStr]: htmlElement,
			},
		}),

	getSubChartPaneHtmlElementRef: (indicatorKeyStr: IndicatorKeyStr) =>
		get().subChartPaneHtmlElementRef[indicatorKeyStr] || null,

	// Pane version number management
	getPaneVersion: () => get().paneVersion,

	incrementPaneVersion: () => set({ paneVersion: get().paneVersion + 1 }),
});
