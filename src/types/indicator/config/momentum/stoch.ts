import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType, MAType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	MATypeSchema,
} from "@/types/indicator/schemas";

// STOCH 指标配置的 Zod schema
const STOCHConfigSchema = z.object({
	fastKPeriod: z.number().int().positive(),
	slowKPeriod: z.number().int().positive(),
	slowKMaType: MATypeSchema,
	slowDPeriod: z.number().int().positive(),
	slowDMaType: MATypeSchema,
});

export type STOCHConfigType = z.infer<typeof STOCHConfigSchema>;

// STOCH指标的参数映射函数
function buildSTOCHConfig(params: Map<string, string>): unknown {
	return {
		fastKPeriod: parseInt(params.get("fast_k_period") || "0"),
		slowKPeriod: parseInt(params.get("slow_k_period") || "0"),
		slowKMaType: params.get("slow_k_ma_type") as MAType,
		slowDPeriod: parseInt(params.get("slow_d_period") || "0"),
		slowDMaType: params.get("slow_d_ma_type") as MAType,
	};
}

// STOCH指标配置实现
export const STOCHConfig: IndicatorConfig<STOCHConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.STOCH,
	displayName: "STOCH",
	description: "随机指标",
	params: {
		fastKPeriod: {
			label: "快速K周期",
			description: "选择快速K线的计算周期",
			defaultValue: 5,
			required: true,
			legendShowName: "fast_k",
		},
		slowKPeriod: {
			label: "慢速K周期",
			description: "选择慢速K线的计算周期",
			defaultValue: 3,
			required: true,
			legendShowName: "slow_k",
		},
		slowKMaType: {
			label: "慢速K MA类型",
			description: "选择慢速K线的移动平均线类型",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "slow_k_ma",
		},
		slowDPeriod: {
			label: "慢速D周期",
			description: "选择慢速D线的计算周期",
			defaultValue: 3,
			required: true,
			legendShowName: "slow_d",
		},
		slowDMaType: {
			label: "慢速D MA类型",
			description: "选择慢速D线的移动平均线类型",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "slow_d_ma",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		slow_k: { label: "slow_k", value: 0, legendShowName: "slow_k" },
		slow_d: { label: "slow_d", value: 0, legendShowName: "slow_d" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "Slow K",
				type: SeriesType.LINE,
				color: "#2196F3",
				lineWidth: 2,
				indicatorValueKey: "slow_k" as keyof IndicatorValueConfig,
			},
			{
				name: "Slow D",
				type: SeriesType.LINE,
				color: "#F44336",
				lineWidth: 2,
				indicatorValueKey: "slow_d" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): STOCHConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = STOCHConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.STOCH,
		STOCHConfigSchema,
		buildSTOCHConfig,
	),

	validateConfig(config: unknown): config is STOCHConfigType {
		try {
			STOCHConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
