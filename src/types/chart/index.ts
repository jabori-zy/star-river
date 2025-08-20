import type {
	AreaSeries,
	HistogramSeries,
	LineSeries,
	Time,
	SeriesMarkerBarPosition,
	SeriesMarkerShape,
	LineStyle,
	LineWidth,
} from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr, KeyStr } from "@/types/symbol-key";
import type { StrategyStatsName } from "../statistics";


export type LayoutMode = "vertical" | "horizontal" | "grid" | "grid-alt";

export type ChartId = number;

// 数据系列类型
export enum SeriesType {
	LINE = "line",
	COLUMN = "column",
	MOUNTAIN = "mountain",
	DASH = "dash",
}


export type SeriesBaseConfig = {
	name: string; // 数据系列名称
	type: SeriesType; // 数据系列类型
	color?: string; // 数据系列颜色
	lineWidth?: number; // 数据系列线宽
}

// 指标图表数据系列配置
export type SeriesConfig = {
	indicatorValueKey: keyof IndicatorValueConfig; // 指标值的键名
} & SeriesBaseConfig;


// 统计图表数据系列配置
export type StatsSeriesConfig = {
	statsName: StrategyStatsName; // 统计名称
} & SeriesBaseConfig;

export type IndicatorChartBaseConfig = {
	isInMainChart: boolean; // isInMainChart
	visible?: boolean; // 指标可见性
	seriesConfigs: SeriesConfig[];
};

export type IndicatorChartConfig = IndicatorChartBaseConfig & {
	indicatorKeyStr: IndicatorKeyStr; // indicatorKeyStr
	isDelete: boolean; // isDelete
};

export type KlineChartConfig = {
	klineKeyStr: KeyStr; // 蜡烛图缓存key
	visible?: boolean; // 蜡烛图可见性
	upColor?: string; // 上涨颜色
	downColor?: string; // 下跌颜色
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
 * 止盈价格线
 */
export type TakeProfitPriceLine = {
	id: string;
	price: number;
	color: string;
	lineWidth: LineWidth;
	lineStyle: LineStyle,
	axisLabelVisible: boolean,
	title: string;
};


/**
 * 止损价格线
 */
export type StopLossPriceLine = {
	id: string;
	price: number;
	color: string;
	lineWidth: LineWidth;
	lineStyle: LineStyle,
	axisLabelVisible: boolean,
	title: string;
};


/**
 * 开仓价格线
 */
export type OpenPositionPriceLine = {
	id: string;
	price: number;
	color: string;
	lineWidth: LineWidth;
	lineStyle: LineStyle,
	axisLabelVisible: boolean,
	title: string;
};

export type PositionPriceLine = TakeProfitPriceLine | StopLossPriceLine | OpenPositionPriceLine;






// // 子图配置
// export type SubChartConfig = {
// 	mainChartId: ChartId; // 所属的主图id
// 	subChartId: ChartId; // 子图id`
// 	indicatorChartConfigs: Record<IndicatorKeyStr, IndicatorChartConfig>;
// };
