import type {
	// CandlestickData,
	IChartApi,
	IPaneApi,
	ISeriesApi,
	ISeriesMarkersPluginApi,
	LogicalRange,
	SingleValueData,
	Time,
} from "lightweight-charts";
import type { Subscription } from "rxjs";
import type { StateCreator } from "zustand";
import type {
	ChartId,
	OrderMarker,
	OrderPriceLine,
	PositionPriceLine,
} from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { Kline } from "@/types/kline";
import type { VirtualOrder } from "@/types/order";
import type { VirtualPosition } from "@/types/position";
import type { IndicatorKeyStr, KeyStr, KlineKeyStr, OperationKeyStr } from "@/types/symbol-key";

// ==================== Data Slice Types ====================
export interface DataSlice {
	klineKeyStr: KlineKeyStr | null;

	isDataInitialized: boolean;

	visibleLogicalRange: LogicalRange | null; // Visible logical range

	setKlineKeyStr: (klineKeyStr: KlineKeyStr) => void;
	getKlineKeyStr: () => KlineKeyStr | null;
	getIsDataInitialized: () => boolean;
	setIsDataInitialized: (initialized: boolean) => void;
	// getLastKline: (keyStr: KeyStr) => CandlestickData | SingleValueData | null;

	setVisibleLogicalRange: (logicalRange: LogicalRange) => void;
	getVisibleLogicalRange: () => LogicalRange | null;
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
	operationSeriesRef: Record<
		OperationKeyStr,
		Record<
			string,
			ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null
		>
	>;
	orderMarkerSeriesRef: ISeriesMarkersPluginApi<Time> | null;
	indicatorSubChartPaneRef: Record<IndicatorKeyStr, IPaneApi<Time> | null>;
	indicatorSubChartPaneHtmlElementRef: Record<IndicatorKeyStr, HTMLElement | null>;
	operationSubChartPaneRef: Record<OperationKeyStr, IPaneApi<Time> | null>;
	operationSubChartPaneHtmlElementRef: Record<OperationKeyStr, HTMLElement | null>;
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
	getIndicatorAllSeriesRef: (
		indicatorKeyStr: IndicatorKeyStr,
	) => Record<
		keyof IndicatorValueConfig,
		ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null
	>;
	deleteIndicatorSeriesRef: (indicatorKeyStr: IndicatorKeyStr) => void;
	setOperationSeriesRef: (
		operationKeyStr: OperationKeyStr,
		outputSeriesKey: string,
		ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">,
	) => void;
	getOperationSeriesRef: (
		operationKeyStr: OperationKeyStr,
		outputSeriesKey: string,
	) => ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null;
	getOperationAllSeriesRef: (
		operationKeyStr: OperationKeyStr,
	) => Record<
		string,
		ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null
	>;
	deleteOperationSeriesRef: (operationKeyStr: OperationKeyStr) => void;
	setOrderMarkerSeriesRef: (ref: ISeriesMarkersPluginApi<Time>) => void;
	getOrderMarkerSeriesRef: () => ISeriesMarkersPluginApi<Time> | null;
	deleteOrderMarkerSeriesRef: () => void;
	setIndicatorSubChartPaneRef: (
		indicatorKeyStr: IndicatorKeyStr,
		ref: IPaneApi<Time>,
	) => void;
	deleteIndicatorSubChartPaneRef: (indicatorKeyStr: IndicatorKeyStr) => void;
	getIndicatorSubChartPaneRef: (
		indicatorKeyStr: IndicatorKeyStr,
	) => IPaneApi<Time> | null;
	addIndicatorSubChartPaneHtmlElementRef: (
		indicatorKeyStr: IndicatorKeyStr,
		htmlElement: HTMLElement,
	) => void;
	getIndicatorSubChartPaneHtmlElementRef: (
		indicatorKeyStr: IndicatorKeyStr,
	) => HTMLElement | null;
	setOperationSubChartPaneRef: (
		operationKeyStr: OperationKeyStr,
		ref: IPaneApi<Time>,
	) => void;
	getOperationSubChartPaneRef: (
		operationKeyStr: OperationKeyStr,
	) => IPaneApi<Time> | null;
	deleteOperationSubChartPaneRef: (operationKeyStr: OperationKeyStr) => void;
	addOperationSubChartPaneHtmlElementRef: (
		operationKeyStr: OperationKeyStr,
		htmlElement: HTMLElement,
	) => void;
	getOperationSubChartPaneHtmlElementRef: (
		operationKeyStr: OperationKeyStr,
	) => HTMLElement | null;
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
	orderPriceLine: OrderPriceLine[];

	setOrderMarkers: (markers: OrderMarker[]) => void;
	getOrderMarkers: () => OrderMarker[];
	setPositionPriceLine: (priceLine: PositionPriceLine[]) => void;
	getPositionPriceLine: () => PositionPriceLine[];
	deletePositionPriceLine: (priceLineId: string) => void;
	setOrderPriceLine: (priceLine: OrderPriceLine[]) => void;
	getOrderPriceLine: () => OrderPriceLine[];
	deleteOrderPriceLine: (priceLineId: string) => void;
}

// ==================== Subscription Slice Types ====================
export interface SubscriptionSlice {
	subscriptions: Record<KeyStr, Subscription[]>;

	initObserverSubscriptions: () => void;
	subscribe: (keyStr: KeyStr) => void;
	unsubscribe: (keyStr: KeyStr) => void;
	_addObserverSubscription: (
		keyStr: KeyStr,
		subscription: Subscription,
	) => void;
	cleanupSubscriptions: () => void;
}

// ==================== Event Handler Slice Types ====================
export interface EventHandlerSlice {
	onNewKline: (kline: Kline) => void;
	onNewIndicator: (
		indicatorKeyStr: KeyStr,
		indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	) => void;
	onNewOperation: (
		operationKeyStr: KeyStr,
		operationData: Record<string, SingleValueData[]>,
	) => void;
	onNewOrder: (newOrder: VirtualOrder) => void;
	onOrderFilled: (order: VirtualOrder) => void;
	onOrderCreated: (order: VirtualOrder) => void;
	onOrderCanceled: (order: VirtualOrder) => void;
	onLimitOrderFilled: (limitOrder: VirtualOrder) => void;
	onTpOrderFilled: (tpOrder: VirtualOrder) => void;
	onSlOrderFilled: (slOrder: VirtualOrder) => void;
	onNewPosition: (position: VirtualPosition) => void;
	onPositionClosed: (position: VirtualPosition) => void;
}

// ==================== Data Initialization Slice Types ====================
export interface DataInitializationSlice {
	initChartData: (
		datetime: string,
		circleId: number,
		strategyId: number,
	) => Promise<void>;
	initKlineData: (
		datetime: string,
		circleId: number,
		strategyId: number,
	) => Promise<void>;
	initIndicatorData: (
		strategyId: number,
		indicatorKeyStr: IndicatorKeyStr,
		datetime: string,
		circleId: number,
	) => Promise<void>;
	initOperationData: (
		strategyId: number,
		operationKeyStr: OperationKeyStr,
		datetime: string,
		circleId: number,
	) => Promise<void>;
	initVirtualOrderData: (strategyId: number) => Promise<void>;
	initVirtualPositionData: (strategyId: number) => Promise<void>;
	_processKlineData: (
		strategyId: number,
		klineKeyStr: KeyStr,
		datetime: string,
	) => Promise<void>;
	_processIndicatorData: (
		strategyId: number,
		keyStr: KeyStr,
		datetime: string,
	) => Promise<Record<keyof IndicatorValueConfig, SingleValueData[]> | null>;
	_processOperationData: (
		strategyId: number,
		keyStr: KeyStr,
		datetime: string,
	) => Promise<Record<string, SingleValueData[]> | null>;
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
export interface BacktestChartStore
	extends DataSlice,
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
