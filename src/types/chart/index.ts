import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr, KeyStr } from "@/types/symbol-key";
// import { IndicatorValue } from "../indicator/backup/indicator-value";

export type LayoutMode = "vertical" | "horizontal" | "grid" | "grid-alt";

// 数据系列类型
export enum SeriesType {
	LINE = "line",
	COLUMN = "column",
	MOUNTAIN = "mountain",
}

// 指标图表数据系列配置
export type SeriesConfig = {
	name: string; // 数据系列名称
	type: SeriesType; // 数据系列类型
	color?: string; // 数据系列颜色
	strokeThickness?: number; // 数据系列线宽
	indicatorValueKey: keyof IndicatorValueConfig; // 指标值的键名
};

export type KlineChartConfig = {
	klineKeyStr: KeyStr; // 蜡烛图缓存key
	upColor?: string; // 上涨颜色
	downColor?: string; // 下跌颜色
	indicatorChartConfig: Record<IndicatorKeyStr, IndicatorChartConfig>; // 指标图表配置映射 indicatorCacheKeyStr -> IndicatorChartConfig
};

// 主图指标图表配置
export type IndicatorChartConfig = {
	name: string; // 指标名称
	isInMainChart: boolean; // 是否在主图中
	seriesConfigs: SeriesConfig[];
};

// 子图配置
export type SubChartConfig = {
	mainChartId: number; // 所属的主图id
	subChartId: number; // 子图id
	indicatorChartConfigs: Record<KeyStr, IndicatorChartConfig>;
};
