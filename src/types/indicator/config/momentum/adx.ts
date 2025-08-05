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

// MA 指标配置的 Zod schema
const ADXConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type ADXConfigType = z.infer<typeof ADXConfigSchema>;

// MA指标的参数映射函数
function buildADXConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// MA指标配置实现
export const ADXConfig: IndicatorConfig<ADXConfigType> = {
	type: IndicatorType.ADX,
	displayName: "ADX",
	description: "Average Directional Index",
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
		adx: { label: "adx", value: 0, legendShowName: "adx" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "adx",
				type: SeriesType.LINE,
				series: LineSeries,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "adx" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ADXConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = ADXConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ADX,
		ADXConfigSchema,
		buildADXConfig,
	),

	validateConfig(config: unknown): config is ADXConfigType {
		try {
			ADXConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	getSeriesName(
		seriesName: string,
		indicatorKey: IndicatorKey,
	): string | undefined {
		// 如果指标类型为ADX，则返回ADX-seriesName-timePeriod
		if (indicatorKey.indicatorType === IndicatorType.ADX) {
			const adxConfig = indicatorKey.indicatorConfig as ADXConfigType;
			// 找到名称相同的seriesConfig
			const seriseConfig = this.chartConfig.seriesConfigs.find(
				(config) => config.name === seriesName,
			);
			if (seriseConfig) {
				return `${seriseConfig.name} ${adxConfig.timePeriod}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
};
