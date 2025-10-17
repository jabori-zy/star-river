import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	PriceSource,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const MACDConfigSchema = z.object({
	fastPeriod: z.number().int().positive(),
	slowPeriod: z.number().int().positive(),
	signalPeriod: z.number().int().positive(),
	priceSource: z.nativeEnum(PriceSource),
});

export type MACDConfigType = z.infer<typeof MACDConfigSchema>;

// MACD指标的参数映射函数
function buildMACDConfig(params: Map<string, string>): unknown {
	return {
		fastPeriod: parseInt(params.get("fast_period") || "12"),
		slowPeriod: parseInt(params.get("slow_period") || "26"),
		signalPeriod: parseInt(params.get("signal_period") || "9"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const MACDConfig: IndicatorConfig<MACDConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.MACD,
	displayName: "MACD",
	description: "指数平滑移动平均线收敛发散指标",
	params: {
		fastPeriod: {
			label: "快线周期",
			description: "选择快线的计算周期",
			defaultValue: 12,
			required: true,
			legendShowName: "fast",
		},
		slowPeriod: {
			label: "慢线周期",
			description: "选择慢线的计算周期",
			defaultValue: 26,
			required: true,
			legendShowName: "slow",
		},
		signalPeriod: {
			label: "信号周期",
			description: "选择信号线的计算周期",
			defaultValue: 9,
			required: true,
			legendShowName: "signal",
		},
		priceSource: {
			label: "价格源",
			description: "选择指标计算价格源",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		macd: { label: "MACD", value: 0, legendShowName: "macd" },
		signal: { label: "Signal", value: 0, legendShowName: "signal" },
		histogram: { label: "Histogram", value: 0, legendShowName: "histogram" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "MACD",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "macd" as keyof IndicatorValueConfig,
			},
			{
				name: "Signal",
				type: SeriesType.LINE,
				color: "#4ECDC4",
				lineWidth: 2,
				indicatorValueKey: "signal" as keyof IndicatorValueConfig,
			},
			{
				name: "Histogram",
				type: SeriesType.COLUMN,
				color: "#45B7D1",
				lineWidth: 1,
				indicatorValueKey: "histogram" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MACDConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = MACDConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MACD,
		MACDConfigSchema,
		buildMACDConfig,
	),

	validateConfig(config: unknown): config is MACDConfigType {
		try {
			MACDConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	if (indicatorKey.indicatorType === IndicatorType.MACD) {
	// 		const MACDConfig = indicatorKey.indicatorConfig as MACDConfigType;
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${MACDConfig.fastPeriod} ${MACDConfig.slowPeriod} ${MACDConfig.signalPeriod} ${MACDConfig.priceSource.toLowerCase()} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
