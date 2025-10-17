import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// MA 指标配置的 Zod schema
const ADXRConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type ADXRConfigType = z.infer<typeof ADXRConfigSchema>;

// MA指标的参数映射函数
function buildADXRConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// MA指标配置实现
export const ADXRConfig: IndicatorConfig<ADXRConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ADXR,
	displayName: "ADXR",
	description: "Average Directional Index Rating",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择移动平均线的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		adxr: { label: "adxr", value: 0, legendShowName: "adxr" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "adxr",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "adxr" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ADXRConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = ADXRConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ADXR,
		ADXRConfigSchema,
		buildADXRConfig,
	),

	validateConfig(config: unknown): config is ADXRConfigType {
		try {
			ADXRConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// 如果指标类型为ADXR，则返回ADXR-seriesName-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.ADXR) {
	// 		const ADXRConfig = indicatorKey.indicatorConfig as ADXRConfigType;
	// 		// 找到名称相同的seriesConfig
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${seriseConfig.name} ${ADXRConfig.timePeriod}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
