import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// ULTOSC 指标配置的 Zod schema
const ULTOSCConfigSchema = z.object({
	timePeriod1: z.number().int().positive(),
	timePeriod2: z.number().int().positive(),
	timePeriod3: z.number().int().positive(),
});

export type ULTOSCConfigType = z.infer<typeof ULTOSCConfigSchema>;

// ULTOSC指标的参数映射函数
function buildULTOSCConfig(params: Map<string, string>): unknown {
	return {
		timePeriod1: parseInt(params.get("time_period1") || "0"),
		timePeriod2: parseInt(params.get("time_period2") || "0"),
		timePeriod3: parseInt(params.get("time_period3") || "0"),
	};
}

// ULTOSC指标配置实现
export const ULTOSCConfig: IndicatorConfig<ULTOSCConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ULTOSC,
	displayName: "ULTOSC",
	description: "终极振荡器",
	params: {
		timePeriod1: {
			label: "indicator.configField.timePeriod1",
			description: "选择第一个时间周期",
			defaultValue: 7,
			required: true,
			legendShowName: "period1",
		},
		timePeriod2: {
			label: "indicator.configField.timePeriod2",
			description: "选择第二个时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period2",
		},
		timePeriod3: {
			label: "indicator.configField.timePeriod3",
			description: "选择第三个时间周期",
			defaultValue: 28,
			required: true,
			legendShowName: "period3",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		ultosc: { label: "ultosc", value: 0, legendShowName: "ultosc" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ULTOSC",
				type: SeriesType.LINE,
				color: "#FF9800",
				lineWidth: 2,
				indicatorValueKey: "ultosc" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ULTOSCConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = ULTOSCConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ULTOSC,
		ULTOSCConfigSchema,
		buildULTOSCConfig,
	),

	validateConfig(config: unknown): config is ULTOSCConfigType {
		try {
			ULTOSCConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
