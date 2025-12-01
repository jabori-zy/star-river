import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// WILLR 指标配置的 Zod schema
const WILLRConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type WILLRConfigType = z.infer<typeof WILLRConfigSchema>;

// WILLR指标的参数映射函数
function buildWILLRConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// WILLR指标配置实现
export const WILLRConfig: IndicatorConfig<WILLRConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.WILLR,
	displayName: "WILLR",
	description: "威廉指标",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "选择威廉指标的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		willr: { label: "willr", value: 0, legendShowName: "willr" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "WILLR",
				type: SeriesType.LINE,
				color: "#E91E63",
				lineWidth: 2,
				indicatorValueKey: "willr" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): WILLRConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = WILLRConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.WILLR,
		WILLRConfigSchema,
		buildWILLRConfig,
	),

	validateConfig(config: unknown): config is WILLRConfigType {
		try {
			WILLRConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
