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

// MA 指标配置的 Zod schema
const APOConfigSchema = z.object({
	fastPeriod: z.number().int().positive(),
	slowPeriod: z.number().int().positive(),
	maType: MATypeSchema,
	priceSource: PriceSourceSchema,
});

export type APOConfigType = z.infer<typeof APOConfigSchema>;

// MA指标的参数映射函数
function buildAPOConfig(params: Map<string, string>): unknown {
	return {
		fastPeriod: parseInt(params.get("fast_period") || "0"),
		slowPeriod: parseInt(params.get("slow_period") || "0"),
		maType: params.get("ma_type") as MAType,
		priceSource: params.get("price_source") as PriceSource,
	};
}

// MA指标配置实现
export const APOConfig: IndicatorConfig<APOConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.APO,
	displayName: "APO",
	description: "Absolute Price Oscillator",
	params: {
		maType: {
			label: "MA类型",
			description: "选择移动平均线的计算方式",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "ma type",
		},
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
		apo: { label: "apo", value: 0, legendShowName: "apo" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "apo",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "apo" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): APOConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = APOConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.APO,
		APOConfigSchema,
		buildAPOConfig,
	),

	validateConfig(config: unknown): config is APOConfigType {
		try {
			APOConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// 如果指标类型为APO，则返回APO-seriesName-fastPeriod-slowPeriod-maType-priceSource
	// 	if (indicatorKey.indicatorType === IndicatorType.APO) {
	// 		const APOConfig = indicatorKey.indicatorConfig as APOConfigType;
	// 		// 找到名称相同的seriesConfig
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${seriseConfig.name} ${APOConfig.fastPeriod} ${APOConfig.slowPeriod} ${APOConfig.maType.toLowerCase()} ${APOConfig.priceSource.toLowerCase()}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
