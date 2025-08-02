import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKey } from "@/types/symbol-key";

// AROONOSC 指标配置的 Zod schema
const AroonOscConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type AroonOscConfigType = z.infer<typeof AroonOscConfigSchema>;

// AROONOSC指标的参数映射函数
function buildAroonOscConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// AROONOSC指标配置实现
export const AroonOscConfig: IndicatorConfig<AroonOscConfigType> = {
	type: IndicatorType.AROONOSC,
	displayName: "AROONOSC",
	description: "Aroon Oscillator",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择AROON振荡器的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		aroon_osc: { label: "aroon_osc", value: 0, legendShowName: "aroon osc" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "aroon_osc",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "aroon_osc" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): AroonOscConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = AroonOscConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.AROONOSC,
		AroonOscConfigSchema,
		buildAroonOscConfig,
	),

	validateConfig(config: unknown): config is AroonOscConfigType {
		try {
			AroonOscConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	getSeriesName(
		seriesName: string,
		indicatorKey: IndicatorKey,
	): string | undefined {
		// 如果指标类型为AROONOSC，则返回AROONOSC-seriesName-timePeriod
		if (indicatorKey.indicatorType === IndicatorType.AROONOSC) {
			const aroonOscConfig = indicatorKey.indicatorConfig as AroonOscConfigType;
			// 找到名称相同的seriesConfig
			const seriseConfig = this.chartConfig.seriesConfigs.find(
				(config) => config.name === seriesName,
			);
			if (seriseConfig) {
				return `${indicatorKey.indicatorType} ${aroonOscConfig.timePeriod} : ${seriseConfig.name}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
};
