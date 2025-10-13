import type {
	// CandlestickData,
	IChartApi,
	IPaneApi,
	ISeriesApi,
	ISeriesMarkersPluginApi,
	SingleValueData,
	Time,
} from "lightweight-charts";
import type { Subscription } from "rxjs";
import type { StateCreator } from "zustand";
import type { ChartId, OrderMarker, PositionPriceLine, LimitOrderPriceLine } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { Kline } from "@/types/kline";
import type { IndicatorKeyStr, KeyStr, KlineKeyStr } from "@/types/symbol-key";
import type { VirtualOrder } from "@/types/order";
import type { VirtualPosition } from "@/types/position";

// ==================== Data Slice Types ====================
export interface DataSlice {
	klineKeyStr: KlineKeyStr | null;
	// klineData: CandlestickData[];
	// indicatorData: Record<
	// 	IndicatorKeyStr,
	// 	Record<keyof IndicatorValueConfig, SingleValueData[]>
	// >;
	isDataInitialized: boolean;

	visibleLogicalRangeFrom: number | null; // 可见逻辑范围逻辑起始点

	setKlineKeyStr: (klineKeyStr: KlineKeyStr) => void;
	getKlineKeyStr: () => KlineKeyStr | null;
	// setKlineData: (data: CandlestickData[]) => void;
	// getKlineData: () => CandlestickData[];
	// deleteKlineData: () => void;
	// setIndicatorData: (
	// 	keyStr: KeyStr,
	// 	data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	// ) => void;
	// getIndicatorData: (indicatorKeyStr: IndicatorKeyStr) => Record<keyof IndicatorValueConfig, SingleValueData[]>;
	// deleteIndicatorData: (indicatorKeyStr: IndicatorKeyStr) => void;
	getIsDataInitialized: () => boolean;
	setIsDataInitialized: (initialized: boolean) => void;
	// getLastKline: (keyStr: KeyStr) => CandlestickData | SingleValueData | null;

	setVisibleLogicalRangeFrom: (from: number) => void;
	getVisibleLogicalRangeFrom: () => number | null;
}

// ==================== Refs Slice Types ====================
export interface RefsSlice {
	chartRef: IChartApi | null;
	klineSeriesRef: ISeriesApi<"Candlestick"> | null;
	indicatorSeriesRef: Record<
		IndicatorKeyStr,
		Record<
			keyof IndicatorValueConfig,
			ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null
		>
	>;
	orderMarkerSeriesRef: ISeriesMarkersPluginApi<Time> | null;
	subChartPaneRef: Record<IndicatorKeyStr, IPaneApi<Time> | null>;
	subChartPaneHtmlElementRef: Record<IndicatorKeyStr, HTMLElement | null>;
	paneVersion: number;

	setChartRef: (chart: IChartApi | null) => void;
	getChartRef: () => IChartApi | null;
	setKlineSeriesRef: (ref: ISeriesApi<"Candlestick">) => void;
	getKlineSeriesRef: () => ISeriesApi<"Candlestick"> | null;
	deleteKlineSeriesRef: () => void;
	setIndicatorSeriesRef: (
		indicatorKeyStr: IndicatorKeyStr,
		indicatorValueKey: keyof IndicatorValueConfig,
		ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">,
	) => void;
	getIndicatorSeriesRef: (
		indicatorKeyStr: IndicatorKeyStr,
		indicatorValueKey: keyof IndicatorValueConfig,
	) => ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null;
	getIndicatorAllSeriesRef: (indicatorKeyStr: IndicatorKeyStr) => Record<keyof IndicatorValueConfig, ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null>;
	deleteIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr) => void;
	setOrderMarkerSeriesRef: (ref: ISeriesMarkersPluginApi<Time>) => void;
	getOrderMarkerSeriesRef: () => ISeriesMarkersPluginApi<Time> | null;
	deleteOrderMarkerSeriesRef: () => void;
	setSubChartPaneRef: (
		indicatorKeyStr: IndicatorKeyStr,
		ref: IPaneApi<Time>,
	) => void;
	deleteSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) => void;
	getSubChartPaneRef: (
		indicatorKeyStr: IndicatorKeyStr,
	) => IPaneApi<Time> | null;
	addSubChartPaneHtmlElementRef: (indicatorKeyStr: IndicatorKeyStr, htmlElement: HTMLElement) => void;
	getSubChartPaneHtmlElementRef: (indicatorKeyStr: IndicatorKeyStr) => HTMLElement | null;
	getPaneVersion: () => number;
	incrementPaneVersion: () => void;
}

// ==================== Visibility Slice Types ====================
export interface VisibilitySlice {
	indicatorVisibilityMap: Record<IndicatorKeyStr, boolean>;
	klineVisibilityMap: Record<KlineKeyStr, boolean>;

	setIndicatorVisibility: (
		indicatorKeyStr: IndicatorKeyStr,
		visible: boolean,
	) => void;
	toggleIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => void;
	getIndicatorVisibility: (indicatorKeyStr: IndicatorKeyStr) => boolean;
	setKlineVisibility: (klineKeyStr: KlineKeyStr, visible: boolean) => void;
	toggleKlineVisibility: (klineKeyStr: KlineKeyStr) => void;
	getKlineVisibility: (klineKeyStr: KlineKeyStr) => boolean;
	resetAllVisibility: () => void;
	setBatchIndicatorVisibility: (
		visibilityMap: Record<IndicatorKeyStr, boolean>,
	) => void;
	setBatchKlineVisibility: (
		visibilityMap: Record<KlineKeyStr, boolean>,
	) => void;
}

// ==================== Trading Slice Types ====================
export interface TradingSlice {
	orderMarkers: OrderMarker[];
	positionPriceLine: PositionPriceLine[];
	limitOrderPriceLine: LimitOrderPriceLine[];

	setOrderMarkers: (markers: OrderMarker[]) => void;
	getOrderMarkers: () => OrderMarker[];
	setPositionPriceLine: (priceLine: PositionPriceLine[]) => void;
	getPositionPriceLine: () => PositionPriceLine[];
	deletePositionPriceLine: (priceLineId: string) => void;
	setLimitOrderPriceLine: (priceLine: LimitOrderPriceLine[]) => void;
	getLimitOrderPriceLine: () => LimitOrderPriceLine[];
	deleteLimitOrderPriceLine: (priceLineId: string) => void;
}

// ==================== Subscription Slice Types ====================
export interface SubscriptionSlice {
	subscriptions: Record<KeyStr, Subscription[]>;

	initObserverSubscriptions: () => void;
	subscribe: (keyStr: KeyStr) => void;
	unsubscribe: (keyStr: KeyStr) => void;
	_addObserverSubscription: (keyStr: KeyStr, subscription: Subscription) => void;
	cleanupSubscriptions: () => void;
}

// ==================== Event Handler Slice Types ====================
export interface EventHandlerSlice {
	onNewKline: (kline: Kline) => void;
	onNewIndicator: (
		indicatorKeyStr: KeyStr,
		indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	) => void;
	onNewOrder: (newOrder: VirtualOrder) => void;
	onLimitOrderFilled: (limitOrder: VirtualOrder) => void;
	onNewPosition: (position: VirtualPosition) => void;
	onPositionClosed: (position: VirtualPosition) => void;
}

// ==================== Data Initialization Slice Types ====================
export interface DataInitializationSlice {
	initChartData: (playIndex: number, strategyId: number) => Promise<void>;
	initKlineData: (playIndex: number, strategyId: number) => Promise<void>;
	initIndicatorData: (
		strategyId: number,
		indicatorKeyStr: IndicatorKeyStr,
		playIndex: number,
	) => Promise<void>;
	initVirtualOrderData: (strategyId: number) => Promise<void>;
	initVirtualPositionData: (strategyId: number) => Promise<void>;
	_processKlineData: (strategyId: number, klineKeyStr: KeyStr, playIndex: number) => Promise<void>;
	_processIndicatorData: (
		strategyId: number,
		keyStr: KeyStr,
		playIndex: number,
	) => Promise<Record<keyof IndicatorValueConfig, SingleValueData[]> | null>;
	_initSingleKeyData: (
		strategyId: number,
		keyStr: KeyStr,
		playIndex: number,
	) => Promise<Record<
		keyof IndicatorValueConfig,
		SingleValueData[]
	> | null | undefined>;
}

// ==================== Utility Slice Types ====================
export interface UtilitySlice {
	chartId: ChartId;
	chartConfig: BacktestChartConfig;
	setChartConfig: (chartConfig: BacktestChartConfig) => void;
	getChartConfig: () => BacktestChartConfig;
	getKeyStr: () => KeyStr[];
	resetData: () => void;
}

// ==================== Complete Store Type ====================
export interface BacktestChartStore extends
	DataSlice,
	RefsSlice,
	VisibilitySlice,
	TradingSlice,
	SubscriptionSlice,
	EventHandlerSlice,
	DataInitializationSlice,
	UtilitySlice {}

// ==================== Slice Creation Function Types ====================
export type SliceCreator<TSlice> = StateCreator<
	BacktestChartStore,
	[],
	[],
	TSlice
>;

// ==================== Store Context Types ====================
export interface StoreContext {
	chartId: number;
	chartConfig: BacktestChartConfig;
}
