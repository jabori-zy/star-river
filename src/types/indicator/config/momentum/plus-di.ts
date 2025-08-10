import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// PLUS_DI 指标配置的 Zod schema
const PlusDiConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type PlusDiConfigType = z.infer<typeof PlusDiConfigSchema>;

// PLUS_DI指标的参数映射函数
function buildPlusDiConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// PLUS_DI指标配置实现
export const PlusDiConfig: IndicatorConfig<PlusDiConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.PLUS_DI,
	displayName: "Plus DI",
	description: "正方向性指标",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择正方向性指标的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		plus_di: { label: "plus_di", value: 0, legendShowName: "plus_di" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "Plus DI",
				type: SeriesType.LINE,
				color: "#00FF00",
				lineWidth: 2,
				indicatorValueKey: "plus_di" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): PlusDiConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = PlusDiConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.PLUS_DI,
		PlusDiConfigSchema,
		buildPlusDiConfig,
	),

	validateConfig(config: unknown): config is PlusDiConfigType {
		try {
			PlusDiConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};