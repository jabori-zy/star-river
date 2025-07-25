import { IndicatorConfig, IndicatorType, PriceSource, MAType } from ".";

export type IndicatorParams = {
	label: string;
	name: keyof IndicatorConfig;
	type: string;
	defaultValue?: string | number | PriceSource | MAType;
	required: boolean;
};

export type IndicatorParamsConfig = {
	indicatorShowName: string;
	params: IndicatorParams[];
};

export const indicatorParamsConfigMap: Record<
	IndicatorType,
	IndicatorParamsConfig
> = {
	[IndicatorType.MA]: {
		indicatorShowName: "MA",
		params: [
			{
				label: "周期",
				name: "timePeriod" as keyof IndicatorConfig,
				type: "number",
				defaultValue: 20,
				required: true,
			},
			{
				label: "类型",
				name: "maType" as keyof IndicatorConfig,
				type: "select",
				defaultValue: MAType.SMA,
				required: true,
			},
			{
				label: "数据源",
				name: "priceSource",
				type: "select",
				defaultValue: PriceSource.CLOSE,
				required: true,
			},
		],
	},
	[IndicatorType.SMA]: {
		indicatorShowName: "SMA",
		params: [
			{
				label: "周期",
				name: "timePeriod" as keyof IndicatorConfig,
				type: "number",
				defaultValue: 20,
				required: true,
			},
			{
				label: "数据源",
				name: "priceSource",
				type: "select",
				defaultValue: PriceSource.CLOSE,
				required: true,
			},
		],
	},
	[IndicatorType.EMA]: {
		indicatorShowName: "EMA",
		params: [
			{
				label: "周期",
				name: "timePeriod" as keyof IndicatorConfig,
				type: "number",
				required: true,
			},
			{
				label: "数据源",
				name: "priceSource",
				type: "select",
				defaultValue: PriceSource.CLOSE,
				required: true,
			},
		],
	},
	[IndicatorType.BBANDS]: {
		indicatorShowName: "BBands",
		params: [
			{
				label: "周期",
				name: "timePeriod" as keyof IndicatorConfig,
				type: "number",
				defaultValue: 2,
				required: true,
			},
			{
				label: "标准差",
				name: "stdDev" as keyof IndicatorConfig,
				type: "number",
				defaultValue: 2,
				required: true,
			},
			{
				label: "数据源",
				name: "priceSource",
				type: "select",
				defaultValue: PriceSource.CLOSE,
				required: true,
			},
		],
	},
	[IndicatorType.MACD]: {
		indicatorShowName: "MACD",
		params: [
			{
				label: "快线周期",
				name: "fastPeriod" as keyof IndicatorConfig,
				type: "number",
				defaultValue: 12,
				required: true,
			},
			{
				label: "慢线周期",
				name: "slowPeriod" as keyof IndicatorConfig,
				type: "number",
				defaultValue: 26,
				required: true,
			},
			{
				label: "信号周期",
				name: "signalPeriod" as keyof IndicatorConfig,
				type: "number",
				defaultValue: 9,
				required: true,
			},
			{
				label: "数据源",
				name: "priceSource",
				type: "select",
				defaultValue: PriceSource.CLOSE,
				required: true,
			},
		],
	},
};
