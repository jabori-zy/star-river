import type {
	IChartApi,
	IPaneApi,
	ISeriesApi,
	ISeriesMarkersPluginApi,
	Time,
} from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr, OperationKeyStr } from "@/types/symbol-key";
import type { RefsSlice, SliceCreator } from "./types";

export const createRefsSlice: SliceCreator<RefsSlice> = (set, get) => ({
	chartRef: null,
	klineSeriesRef: null,
	indicatorSeriesRef: {},
	operationSeriesRef: {},
	orderMarkerSeriesRef: null,
	indicatorSubChartPaneRef: {},
	indicatorSubChartPaneHtmlElementRef: {},
	operationSubChartPaneRef: {},
	operationSubChartPaneHtmlElementRef: {},
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

	deleteIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr) => {
		const { [indicatorKeyStr]: _, ...rest } = get().indicatorSeriesRef;
		set({ indicatorSeriesRef: rest });
	},

	setOperationSeriesRef: (
		operationKeyStr: OperationKeyStr,
		outputSeriesKey: string,
		ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">,
	) =>
		set({
			operationSeriesRef: {
				...get().operationSeriesRef,
				[operationKeyStr]: {
					...get().operationSeriesRef[operationKeyStr],
					[outputSeriesKey]: ref,
				},
			},
		}),

	getOperationSeriesRef: (
		operationKeyStr: OperationKeyStr,
		outputSeriesKey: string,
	) => get().operationSeriesRef[operationKeyStr]?.[outputSeriesKey] || null,

	getOperationAllSeriesRef: (operationKeyStr: OperationKeyStr) =>
		get().operationSeriesRef[operationKeyStr] || {},

	deleteOperationSeriesRef: (operationKeyStr: OperationKeyStr) => {
		const { [operationKeyStr]: _, ...rest } = get().operationSeriesRef;
		set({ operationSeriesRef: rest });
	},

	setOrderMarkerSeriesRef: (ref: ISeriesMarkersPluginApi<Time>) =>
		set({ orderMarkerSeriesRef: ref }),

	getOrderMarkerSeriesRef: () => get().orderMarkerSeriesRef || null,

	deleteOrderMarkerSeriesRef: () => set({ orderMarkerSeriesRef: null }),

	setIndicatorSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr, ref: IPaneApi<Time>) =>
		set({
			indicatorSubChartPaneRef: { ...get().indicatorSubChartPaneRef, [indicatorKeyStr]: ref },
		}),

	getIndicatorSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) =>
		get().indicatorSubChartPaneRef[indicatorKeyStr] || null,

	deleteIndicatorSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) => {
		const { [indicatorKeyStr]: _, ...restPaneRef } = get().indicatorSubChartPaneRef;
		const { [indicatorKeyStr]: __, ...restHtmlRef } = get().indicatorSubChartPaneHtmlElementRef;
		set({
			indicatorSubChartPaneRef: restPaneRef,
			indicatorSubChartPaneHtmlElementRef: restHtmlRef,
		});
	},

	addIndicatorSubChartPaneHtmlElementRef: (
		indicatorKeyStr: IndicatorKeyStr,
		htmlElement: HTMLElement,
	) =>
		set({
			indicatorSubChartPaneHtmlElementRef: {
				...get().indicatorSubChartPaneHtmlElementRef,
				[indicatorKeyStr]: htmlElement,
			},
		}),

	getIndicatorSubChartPaneHtmlElementRef: (indicatorKeyStr: IndicatorKeyStr) =>
		get().indicatorSubChartPaneHtmlElementRef[indicatorKeyStr] || null,

	setOperationSubChartPaneRef: (operationKeyStr: OperationKeyStr, ref: IPaneApi<Time>) =>
		set({
			operationSubChartPaneRef: { ...get().operationSubChartPaneRef, [operationKeyStr]: ref },
		}),

	getOperationSubChartPaneRef: (operationKeyStr: OperationKeyStr) =>
		get().operationSubChartPaneRef[operationKeyStr] || null,

	deleteOperationSubChartPaneRef: (operationKeyStr: OperationKeyStr) => {
		const { [operationKeyStr]: _, ...restPaneRef } = get().operationSubChartPaneRef;
		const { [operationKeyStr]: __, ...restHtmlRef } = get().operationSubChartPaneHtmlElementRef;
		set({
			operationSubChartPaneRef: restPaneRef,
			operationSubChartPaneHtmlElementRef: restHtmlRef,
		});
	},

	addOperationSubChartPaneHtmlElementRef: (
		operationKeyStr: OperationKeyStr,
		htmlElement: HTMLElement,
	) =>
		set({
			operationSubChartPaneHtmlElementRef: {
				...get().operationSubChartPaneHtmlElementRef,
				[operationKeyStr]: htmlElement,
			},
		}),

	getOperationSubChartPaneHtmlElementRef: (operationKeyStr: OperationKeyStr) =>
		get().operationSubChartPaneHtmlElementRef[operationKeyStr] || null,

	// Pane version number management
	getPaneVersion: () => get().paneVersion,

	incrementPaneVersion: () => set({ paneVersion: get().paneVersion + 1 }),
});
