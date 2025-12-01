import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	MAType,
	PriceSource,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	MATypeSchema,
	PriceSourceSchema,
} from "@/types/indicator/schemas";

const BBANDSConfigSchema = z.object({
	timePeriod: z.number().int().positive(), // 时间周期
	devUp: z.number().positive(), // 上轨标准差 浮点数
	devDown: z.number().positive(), // 下轨标准差 浮点数
	maType: MATypeSchema, // 移动平均线类型
	priceSource: PriceSourceSchema, // 价格源
});

export type BBANDSConfigType = z.infer<typeof BBANDSConfigSchema>;

// MACD指标的参数映射函数
function buildBBANDSConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "12"),
		devUp: parseFloat(params.get("dev_up") || "0.01"),
		devDown: parseFloat(params.get("dev_down") || "0.01"),
		maType: params.get("ma_type") as MAType,
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const BBANDSConfig: IndicatorConfig<BBANDSConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.BBANDS,
	displayName: "BBands",
	description: "布林带指标",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "选择时间周期",
			defaultValue: 20,
			required: true,
			legendShowName: "period",
		},
		devUp: {
			label: "indicator.configField.devUp",
			description: "选择上轨标准差",
			defaultValue: 2.0,
			required: true,
			legendShowName: "dev up",
		},
		devDown: {
			label: "indicator.configField.devDown",
			description: "选择下轨标准差",
			defaultValue: 2.0,
			required: true,
			legendShowName: "dev down",
		},
		maType: {
			label: "indicator.configField.maType",
			description: "选择移动平均线类型",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "ma type",
		},
		priceSource: {
			label: "indicator.configField.dataSource",
			description: "选择指标计算价格源",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		upper: { label: "upper", value: 0, legendShowName: "upper" },
		middle: { label: "middle", value: 0, legendShowName: "middle" },
		lower: { label: "lower", value: 0, legendShowName: "lower" },
	},
	chartConfig: {
		isInMainChart: true, // BBands显示在主图
		seriesConfigs: [
			{
				name: "upper",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "upper" as keyof IndicatorValueConfig,
			},
			{
				name: "middle",
				type: SeriesType.DASH,
				color: "#4ECDC4",
				lineWidth: 2,
				indicatorValueKey: "middle" as keyof IndicatorValueConfig,
			},
			{
				name: "lower",
				type: SeriesType.LINE,
				color: "#45B7D1",
				lineWidth: 1,
				indicatorValueKey: "lower" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): BBANDSConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = BBANDSConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.BBANDS,
		BBANDSConfigSchema,
		buildBBANDSConfig,
	),

	validateConfig(config: unknown): config is BBANDSConfigType {
		try {
			BBANDSConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	if (indicatorKey.indicatorType === IndicatorType.BBANDS) {
	// 		const BBANDSConfig = indicatorKey.indicatorConfig as BBANDSConfigType;
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${BBANDSConfig.timePeriod} ${BBANDSConfig.devUp} ${BBANDSConfig.devDown} ${BBANDSConfig.maType.toLowerCase()} ${BBANDSConfig.priceSource.toLowerCase()} : ${seriseConfig.name}`;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
