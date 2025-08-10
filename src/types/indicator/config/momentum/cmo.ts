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
import {
	type IndicatorValueConfig,
	PriceSourceSchema,
} from "@/types/indicator/schemas";

// CMO 指标配置的 Zod schema
const CMOConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type CMOConfigType = z.infer<typeof CMOConfigSchema>;

// CMO指标的参数映射函数
function buildCMOConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// CMO指标配置实现
export const CMOConfig: IndicatorConfig<CMOConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.CMO,
	displayName: "CMO",
	description: "Chande Momentum Oscillator",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择CMO指标的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
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
		cmo: { label: "cmo", value: 0, legendShowName: "cmo" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "cmo",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "cmo" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CMOConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = CMOConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CMO,
		CMOConfigSchema,
		buildCMOConfig,
	),

	validateConfig(config: unknown): config is CMOConfigType {
		try {
			CMOConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// 如果指标类型为CMO，则返回CMO-seriesName-timePeriod-priceSource
	// 	if (indicatorKey.indicatorType === IndicatorType.CMO) {
	// 		const CMOConfig = indicatorKey.indicatorConfig as CMOConfigType;
	// 		// 找到名称相同的seriesConfig
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${CMOConfig.timePeriod} ${CMOConfig.priceSource.toLowerCase()} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
