import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// NATR 指标配置的 Zod schema
const NATRConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type NATRConfigType = z.infer<typeof NATRConfigSchema>;

// NATR指标的参数映射函数
function buildNATRConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "14"),
	};
}

// NATR指标配置实现
export const NATRConfig: IndicatorConfig<NATRConfigType> = {
	category: IndicatorCategory.VOLATILITY,
	type: IndicatorType.NATR,
	displayName: "NATR",
	description: "Normalized Average True Range",
	params: {
		timePeriod: {
			label: "时间周期",
			description: "选择NATR的计算周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		natr: { label: "natr", value: 0, legendShowName: "natr" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "natr",
				type: SeriesType.LINE,
				color: "#4ECDC4",
				lineWidth: 2,
				indicatorValueKey: "natr" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): NATRConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = NATRConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.NATR,
		NATRConfigSchema,
		buildNATRConfig,
	),

	validateConfig(config: unknown): config is NATRConfigType {
		try {
			NATRConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
