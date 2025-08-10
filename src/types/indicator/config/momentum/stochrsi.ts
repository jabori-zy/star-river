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

// STOCHRSI 指标配置的 Zod schema
const STOCHRSIConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	fastKPeriod: z.number().int().positive(),
	fastDPeriod: z.number().int().positive(),
	fastDMaType: MATypeSchema,
	priceSource: PriceSourceSchema,
});

export type STOCHRSIConfigType = z.infer<typeof STOCHRSIConfigSchema>;

// STOCHRSI指标的参数映射函数
function buildSTOCHRSIConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		fastKPeriod: parseInt(params.get("fast_k_period") || "0"),
		fastDPeriod: parseInt(params.get("fast_d_period") || "0"),
		fastDMaType: params.get("fast_d_ma_type") as MAType,
		priceSource: params.get("price_source") as PriceSource,
	};
}

// STOCHRSI指标配置实现
export const STOCHRSIConfig: IndicatorConfig<STOCHRSIConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.STOCHRSI,
	displayName: "STOCHRSI",
	description: "随机相对强弱指数",
	params: {
		timePeriod: {
			label: "时间周期",
			description: "选择计算RSI的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
		fastKPeriod: {
			label: "快速K周期",
			description: "选择快速K线的计算周期",
			defaultValue: 5,
			required: true,
			legendShowName: "fast_k",
		},
		fastDPeriod: {
			label: "快速D周期",
			description: "选择快速D线的计算周期",
			defaultValue: 3,
			required: true,
			legendShowName: "fast_d",
		},
		fastDMaType: {
			label: "快速D MA类型",
			description: "选择快速D线的移动平均线类型",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "fast_d_ma",
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
		fast_k: { label: "fast_k", value: 0, legendShowName: "fast_k" },
		fast_d: { label: "fast_d", value: 0, legendShowName: "fast_d" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "STOCHRSI K",
				type: SeriesType.LINE,
				color: "#9C27B0",
				lineWidth: 2,
				indicatorValueKey: "fast_k" as keyof IndicatorValueConfig,
			},
			{
				name: "STOCHRSI D",
				type: SeriesType.LINE,
				color: "#FF5722",
				lineWidth: 2,
				indicatorValueKey: "fast_d" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): STOCHRSIConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = STOCHRSIConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.STOCHRSI,
		STOCHRSIConfigSchema,
		buildSTOCHRSIConfig,
	),

	validateConfig(config: unknown): config is STOCHRSIConfigType {
		try {
			STOCHRSIConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};