import type {
	LineStyle,
	LineWidth,
	SeriesMarkerBarPosition,
	SeriesMarkerShape,
	Time,
} from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr, KeyStr, OperationKeyStr } from "@/types/symbol-key";
import type { StrategyStatsName } from "../statistics";

export type { BacktestStrategyChartConfig } from "./backtest-chart";

export type LayoutMode = "vertical" | "horizontal" | "grid" | "grid-alt";

export type ChartId = number;

// Data series type
export enum SeriesType {
	LINE = "line",
	COLUMN = "column",
	MOUNTAIN = "mountain",
	DASH = "dash",
	BASELINE = "baseline",
}

export type SeriesBaseConfig = {
	name: string; // Data series name
	type: SeriesType; // Data series type
	color?: string; // Data series color
	lineWidth?: number; // Data series line width
};

// Indicator chart data series configuration
export type IndicatorSeriesConfig = {
	indicatorValueKey: keyof IndicatorValueConfig; // Indicator value key name
} & SeriesBaseConfig;


export type OperationSeriesConfig = {
	outputSeriesKey: string;
} & SeriesBaseConfig;

// Stats chart data series configuration
export type StatsSeriesConfig = {
	statsName: StrategyStatsName; // Stats name
} & SeriesBaseConfig;

export type IndicatorChartBaseConfig = {
	isInMainChart: boolean; // isInMainChart
	visible?: boolean; // Indicator visibility
	seriesConfigs: IndicatorSeriesConfig[];
};

export type IndicatorChartConfig = IndicatorChartBaseConfig & {
	indicatorKeyStr: IndicatorKeyStr; // indicatorKeyStr
	isDelete: boolean; // isDelete
};

export type KlineChartConfig = {
	klineKeyStr: KeyStr; // Candlestick chart cache key
	visible?: boolean; // Candlestick chart visibility
	upColor?: string; // Up color
	downColor?: string; // Down color
};


export type OperationChartConfig = {
	isInMainChart: boolean;
	visible?: boolean;
	operationKeyStr: OperationKeyStr;
	isDelete: boolean;
	seriesConfigs: OperationSeriesConfig[];
};












export type OrderMarker = {
	time: Time;
	price?: number;
	position: SeriesMarkerBarPosition;
	shape: SeriesMarkerShape;
	color: string;
	text: string;
	size?: number;
};

/**
 * Take profit price line
 */
export type TakeProfitPriceLine = {
	id: string;
	price: number;
	color: string;
	lineWidth: LineWidth;
	lineStyle: LineStyle;
	axisLabelVisible: boolean;
	title: string;
};

/**
 * Stop loss price line
 */
export type StopLossPriceLine = {
	id: string;
	price: number;
	color: string;
	lineWidth: LineWidth;
	lineStyle: LineStyle;
	axisLabelVisible: boolean;
	title: string;
};

/**
 * Open position price line
 */
export type OpenPositionPriceLine = {
	id: string;
	price: number;
	color: string;
	lineWidth: LineWidth;
	lineStyle: LineStyle;
	axisLabelVisible: boolean;
	title: string;
};

export type PositionPriceLine =
	| TakeProfitPriceLine
	| StopLossPriceLine
	| OpenPositionPriceLine;

/**
 * Limit order price line
 */
export type OrderPriceLine = {
	id: string;
	price: number;
	color: string;
	lineWidth: LineWidth;
	lineStyle: LineStyle;
	axisLabelVisible: boolean;
	title: string;
};

// // Sub-chart configuration
// export type SubChartConfig = {
// 	mainChartId: ChartId; // Main chart id this belongs to
// 	subChartId: ChartId; // Sub-chart id
// 	indicatorChartConfigs: Record<IndicatorKeyStr, IndicatorChartConfig>;
// };
