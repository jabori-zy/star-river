import type {
	AreaSeries,
	HistogramSeries,
	LineSeries,
} from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr, KeyStr } from "@/types/symbol-key";
// import { IndicatorValue } from "../indicator/backup/indicator-value";

export type LayoutMode = "vertical" | "horizontal" | "grid" | "grid-alt";

export type ChartId = number;

// 数据系列类型
export enum SeriesType {
	LINE = "line",
	COLUMN = "column",
	MOUNTAIN = "mountain",
	DASH = "dash",
}

// 指标图表数据系列配置
export type SeriesConfig = {
	name: string; // 数据系列名称
	type: SeriesType; // 数据系列类型
	series: typeof LineSeries | typeof AreaSeries | typeof HistogramSeries;
	color?: string; // 数据系列颜色
	strokeThickness?: number; // 数据系列线宽
	indicatorValueKey: keyof IndicatorValueConfig; // 指标值的键名
};

export type IndicatorChartBaseConfig = {
	isInMainChart: boolean; // isInMainChart
	visible?: boolean; // 指标可见性
	seriesConfigs: SeriesConfig[];
};

export type IndicatorChartConfig = IndicatorChartBaseConfig & {
	chartId: ChartId; // chartId
	indicatorKeyStr: IndicatorKeyStr; // indicatorKeyStr
	isDelete: boolean; // isDelete
};

export type KlineChartConfig = {
	klineKeyStr: KeyStr; // 蜡烛图缓存key
	visible?: boolean; // 蜡烛图可见性
	upColor?: string; // 上涨颜色
	downColor?: string; // 下跌颜色
};

// // 子图配置
// export type SubChartConfig = {
// 	mainChartId: ChartId; // 所属的主图id
// 	subChartId: ChartId; // 子图id`
// 	indicatorChartConfigs: Record<IndicatorKeyStr, IndicatorChartConfig>;
// };
