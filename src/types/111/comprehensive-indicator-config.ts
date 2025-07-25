import { IndicatorType, MAType, PriceSource } from ".";
import {
	MAConfig,
	SMAConfig,
	EMAConfig,
	BBandsConfig,
	MACDConfig,
} from "./indicator-config";
import {
	MAValue,
	SMAValue,
	EMAValue,
	BBandsValue,
	MACDValue,
} from "./indicator-value";
import { SeriesType } from "../chart";

// 指标参数配置
export type IndicatorParam = {
	label: string;
	name: string;
	type: "number" | "select" | "string";
	defaultValue?: string | number | PriceSource | MAType;
	required: boolean;
	options?: Array<{ label: string; value: string | number }>; // 选择框选项
};

// 图表系列配置
export type IndicatorSeries = {
	name: string;
	type: SeriesType;
	color: string;
	strokeThickness?: number;
	valueKey: string; // 对应IndicatorValue中的键名
};

// 综合指标配置
export type ComprehensiveIndicatorConfig = {
	// 基本信息
	type: IndicatorType;
	displayName: string;
	description?: string;

	// 参数配置
	params: IndicatorParam[];

	// 图表配置
	isInMainChart: boolean;
	series: IndicatorSeries[];

	// 解析器配置
	parserConfig: {
		paramMappings: Record<string, string>; // 参数名到解析键的映射
		defaultValueMappings: Record<string, string | number>; // 默认值映射
	};

	// 类型信息
	configType: MAConfig | SMAConfig | EMAConfig | BBandsConfig | MACDConfig; // 对应的配置类型
	valueType: MAValue | SMAValue | EMAValue | BBandsValue | MACDValue; // 对应的值类型
};

// 综合指标配置映射
export const COMPREHENSIVE_INDICATOR_CONFIG: Record<
	IndicatorType,
	ComprehensiveIndicatorConfig
> = {
	[IndicatorType.MA]: {
		type: IndicatorType.MA,
		displayName: "MA",
		description: "移动平均线",
		params: [
			{
				label: "周期",
				name: "timePeriod",
				type: "number",
				defaultValue: 20,
				required: true,
			},
			{
				label: "类型",
				name: "maType",
				type: "select",
				defaultValue: MAType.SMA,
				required: true,
				options: Object.values(MAType).map((type) => ({
					label: type,
					value: type,
				})),
			},
			{
				label: "数据源",
				name: "priceSource",
				type: "select",
				defaultValue: PriceSource.CLOSE,
				required: true,
				options: Object.values(PriceSource).map((source) => ({
					label: source,
					value: source,
				})),
			},
		],
		isInMainChart: true,
		series: [
			{
				name: "MA",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 2,
				valueKey: "ma",
			},
		],
		parserConfig: {
			paramMappings: {
				timePeriod: "time_period",
				maType: "ma_type",
				priceSource: "price_source",
			},
			defaultValueMappings: {
				timePeriod: 20,
				maType: MAType.SMA,
				priceSource: PriceSource.CLOSE,
			},
		},
		configType: {} as MAConfig,
		valueType: {} as MAValue,
	},

	[IndicatorType.SMA]: {
		type: IndicatorType.SMA,
		displayName: "SMA",
		description: "简单移动平均线",
		params: [
			{
				label: "周期",
				name: "timePeriod",
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
				options: Object.values(PriceSource).map((source) => ({
					label: source,
					value: source,
				})),
			},
		],
		isInMainChart: true,
		series: [
			{
				name: "SMA",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 2,
				valueKey: "sma",
			},
		],
		parserConfig: {
			paramMappings: {
				timePeriod: "time_period",
				priceSource: "price_source",
			},
			defaultValueMappings: {
				timePeriod: 20,
				priceSource: PriceSource.CLOSE,
			},
		},
		configType: {} as SMAConfig,
		valueType: {} as SMAValue,
	},

	[IndicatorType.EMA]: {
		type: IndicatorType.EMA,
		displayName: "EMA",
		description: "指数移动平均线",
		params: [
			{
				label: "周期",
				name: "timePeriod",
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
				options: Object.values(PriceSource).map((source) => ({
					label: source,
					value: source,
				})),
			},
		],
		isInMainChart: true,
		series: [
			{
				name: "EMA",
				type: SeriesType.LINE,
				color: "#4ECDC4",
				strokeThickness: 2,
				valueKey: "ema",
			},
		],
		parserConfig: {
			paramMappings: {
				timePeriod: "time_period",
				priceSource: "price_source",
			},
			defaultValueMappings: {
				timePeriod: 20,
				priceSource: PriceSource.CLOSE,
			},
		},
		configType: {} as EMAConfig,
		valueType: {} as EMAValue,
	},

	[IndicatorType.BBANDS]: {
		type: IndicatorType.BBANDS,
		displayName: "BBands",
		description: "布林带",
		params: [
			{
				label: "周期",
				name: "timePeriod",
				type: "number",
				defaultValue: 20,
				required: true,
			},
			{
				label: "标准差",
				name: "stdDev",
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
				options: Object.values(PriceSource).map((source) => ({
					label: source,
					value: source,
				})),
			},
		],
		isInMainChart: true,
		series: [
			{
				name: "上轨",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 1,
				valueKey: "upper",
			},
			{
				name: "中轨",
				type: SeriesType.LINE,
				color: "#4ECDC4",
				strokeThickness: 2,
				valueKey: "middle",
			},
			{
				name: "下轨",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 1,
				valueKey: "lower",
			},
		],
		parserConfig: {
			paramMappings: {
				timePeriod: "time_period",
				stdDev: "std_dev",
				priceSource: "price_source",
			},
			defaultValueMappings: {
				timePeriod: 20,
				stdDev: 2,
				priceSource: PriceSource.CLOSE,
			},
		},
		configType: {} as BBandsConfig,
		valueType: {} as BBandsValue,
	},

	[IndicatorType.MACD]: {
		type: IndicatorType.MACD,
		displayName: "MACD",
		description: "MACD指标",
		params: [
			{
				label: "快线周期",
				name: "fastPeriod",
				type: "number",
				defaultValue: 12,
				required: true,
			},
			{
				label: "慢线周期",
				name: "slowPeriod",
				type: "number",
				defaultValue: 26,
				required: true,
			},
			{
				label: "信号周期",
				name: "signalPeriod",
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
				options: Object.values(PriceSource).map((source) => ({
					label: source,
					value: source,
				})),
			},
		],
		isInMainChart: false,
		series: [
			{
				name: "MACD线",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 2,
				valueKey: "macd",
			},
			{
				name: "信号线",
				type: SeriesType.LINE,
				color: "#4ECDC4",
				strokeThickness: 2,
				valueKey: "signal",
			},
			{
				name: "柱状图",
				type: SeriesType.COLUMN,
				color: "#45B7D1",
				valueKey: "histogram",
			},
		],
		parserConfig: {
			paramMappings: {
				fastPeriod: "fast_period",
				slowPeriod: "slow_period",
				signalPeriod: "signal_period",
				priceSource: "price_source",
			},
			defaultValueMappings: {
				fastPeriod: 12,
				slowPeriod: 26,
				signalPeriod: 9,
				priceSource: PriceSource.CLOSE,
			},
		},
		configType: {} as MACDConfig,
		valueType: {} as MACDValue,
	},
};

// 工具函数：根据指标类型获取配置
export function getIndicatorConfig(
	type: IndicatorType,
): ComprehensiveIndicatorConfig {
	return COMPREHENSIVE_INDICATOR_CONFIG[type];
}

// 工具函数：获取所有支持的指标类型
export function getSupportedIndicatorTypes(): IndicatorType[] {
	return Object.keys(COMPREHENSIVE_INDICATOR_CONFIG) as IndicatorType[];
}

// 工具函数：根据参数名获取解析键名
export function getParserKey(type: IndicatorType, paramName: string): string {
	const config = COMPREHENSIVE_INDICATOR_CONFIG[type];
	return config.parserConfig.paramMappings[paramName] || paramName;
}

// 工具函数：获取参数默认值
export function getParamDefaultValue(
	type: IndicatorType,
	paramName: string,
): string | number | PriceSource | MAType | undefined {
	const config = COMPREHENSIVE_INDICATOR_CONFIG[type];
	const param = config.params.find((p) => p.name === paramName);
	return param?.defaultValue;
}

// 工具函数：验证指标参数
export function validateIndicatorParams(
	type: IndicatorType,
	params: Record<string, unknown>,
): boolean {
	const config = COMPREHENSIVE_INDICATOR_CONFIG[type];
	const requiredParams = config.params.filter((p) => p.required);

	return requiredParams.every((param) => {
		const value = params[param.name];
		return value !== undefined && value !== null && value !== "";
	});
}
