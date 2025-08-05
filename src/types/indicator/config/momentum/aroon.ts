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
import { LineSeries } from "lightweight-charts";

// AROON 指标配置的 Zod schema
const AroonConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type AroonConfigType = z.infer<typeof AroonConfigSchema>;

// AROON指标的参数映射函数
function buildAroonConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// AROON指标配置实现
export const AroonConfig: IndicatorConfig<AroonConfigType> = {
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
				series: LineSeries,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "aroon_down" as keyof IndicatorValueConfig,
			},
			{
				name: "aroon_up",
				type: SeriesType.LINE,
				series: LineSeries,
				color: "#4ECDC4",
				strokeThickness: 2,
				indicatorValueKey: "aroon_up" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): AroonConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = AroonConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.AROON,
		AroonConfigSchema,
		buildAroonConfig,
	),

	validateConfig(config: unknown): config is AroonConfigType {
		try {
			AroonConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	getSeriesName(
		seriesName: string,
		indicatorKey: IndicatorKey,
	): string | undefined {
		// 如果指标类型为AROON，则返回AROON-seriesName-timePeriod
		if (indicatorKey.indicatorType === IndicatorType.AROON) {
			const aroonConfig = indicatorKey.indicatorConfig as AroonConfigType;
			// 找到名称相同的seriesConfig
			const seriseConfig = this.chartConfig.seriesConfigs.find(
				(config) => config.name === seriesName,
			);
			if (seriseConfig) {
				return `${indicatorKey.indicatorType} ${aroonConfig.timePeriod} : ${seriseConfig.name}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
};
