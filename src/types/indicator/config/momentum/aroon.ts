import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// AROON 指标配置的 Zod schema
const AROONConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type AROONConfigType = z.infer<typeof AROONConfigSchema>;

// AROON指标的参数映射函数
function buildAROONConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// AROON指标配置实现
export const AROONConfig: IndicatorConfig<AROONConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.AROON,
	displayName: "AROON",
	description: "Aroon",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择AROON指标的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		aroon_down: { label: "aroondown", value: 0, legendShowName: "aroon down" },
		aroon_up: { label: "aroonup", value: 0, legendShowName: "aroon up" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "aroon_down",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "aroon_down" as keyof IndicatorValueConfig,
			},
			{
				name: "aroon_up",
				type: SeriesType.LINE,
				color: "#4ECDC4",
				lineWidth: 2,
				indicatorValueKey: "aroon_up" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): AROONConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = AROONConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.AROON,
		AROONConfigSchema,
		buildAROONConfig,
	),

	validateConfig(config: unknown): config is AROONConfigType {
		try {
			AROONConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// 如果指标类型为AROON，则返回AROON-seriesName-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.AROON) {
	// 		const AROONConfig = indicatorKey.indicatorConfig as AROONConfigType;
	// 		// 找到名称相同的seriesConfig
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${AROONConfig.timePeriod} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
