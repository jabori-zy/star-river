import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// PLUS_DM 指标配置的 Zod schema
const PlusDmConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type PlusDmConfigType = z.infer<typeof PlusDmConfigSchema>;

// PLUS_DM指标的参数映射函数
function buildPlusDmConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// PLUS_DM指标配置实现
export const PlusDmConfig: IndicatorConfig<PlusDmConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.PLUS_DM,
	displayName: "Plus DM",
	description: "正方向性运动",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "选择正方向性运动的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		plus_dm: { label: "plus_dm", value: 0, legendShowName: "plus_dm" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "Plus DM",
				type: SeriesType.LINE,
				color: "#4CAF50",
				lineWidth: 2,
				indicatorValueKey: "plus_dm" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): PlusDmConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = PlusDmConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.PLUS_DM,
		PlusDmConfigSchema,
		buildPlusDmConfig,
	),

	validateConfig(config: unknown): config is PlusDmConfigType {
		try {
			PlusDmConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
