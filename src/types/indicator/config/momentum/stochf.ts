import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	MAType,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	MATypeSchema,
} from "@/types/indicator/schemas";

// STOCHF 指标配置的 Zod schema
const STOCHFConfigSchema = z.object({
	fastKPeriod: z.number().int().positive(),
	fastDPeriod: z.number().int().positive(),
	fastDMaType: MATypeSchema,
});

export type STOCHFConfigType = z.infer<typeof STOCHFConfigSchema>;

// STOCHF指标的参数映射函数
function buildSTOCHFConfig(params: Map<string, string>): unknown {
	return {
		fastKPeriod: parseInt(params.get("fast_k_period") || "0"),
		fastDPeriod: parseInt(params.get("fast_d_period") || "0"),
		fastDMaType: params.get("fast_d_ma_type") as MAType,
	};
}

// STOCHF指标配置实现
export const STOCHFConfig: IndicatorConfig<STOCHFConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.STOCHF,
	displayName: "STOCHF",
	description: "快速随机指标",
	params: {
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
				name: "Fast K",
				type: SeriesType.LINE,
				color: "#00BCD4",
				lineWidth: 2,
				indicatorValueKey: "fast_k" as keyof IndicatorValueConfig,
			},
			{
				name: "Fast D",
				type: SeriesType.LINE,
				color: "#E91E63",
				lineWidth: 2,
				indicatorValueKey: "fast_d" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): STOCHFConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = STOCHFConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.STOCHF,
		STOCHFConfigSchema,
		buildSTOCHFConfig,
	),

	validateConfig(config: unknown): config is STOCHFConfigType {
		try {
			STOCHFConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};