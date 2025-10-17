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

// RSI 指标配置的 Zod schema
const RSIConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type RSIConfigType = z.infer<typeof RSIConfigSchema>;

// RSI指标的参数映射函数
function buildRSIConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// RSI指标配置实现
export const RSIConfig: IndicatorConfig<RSIConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.RSI, // 修正：应该是RSI而不是MA
	displayName: "RSI",
	description: "计算指定周期的相对强弱指数",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择相对强弱指数的时间周期",
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
		rsi: { label: "rsi", value: 0, legendShowName: "rsi" },
	},
	chartConfig: {
		isInMainChart: false, // RSI显示在副图
		seriesConfigs: [
			{
				name: "RSI",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "rsi" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): RSIConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = RSIConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.RSI,
		RSIConfigSchema,
		buildRSIConfig,
	),

	validateConfig(config: unknown): config is RSIConfigType {
		try {
			RSIConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	if (indicatorKey.indicatorType === IndicatorType.RSI) {
	// 		const RSIConfig = indicatorKey.indicatorConfig as RSIConfigType;
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${RSIConfig.timePeriod} ${RSIConfig.priceSource.toLowerCase()} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
