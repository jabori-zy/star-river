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

// MA 指标配置的 Zod schema
const AccBandsConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type AccBandsConfigType = z.infer<typeof AccBandsConfigSchema>;

// MA指标的参数映射函数
function buildAccBandsConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// Acceleration Bands指标配置实现
export const AccBandsConfig: IndicatorConfig<AccBandsConfigType> = {
	type: IndicatorType.ACCBANDS,
	displayName: "ACC BANDS",
	description: "Acceleration Bands",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择Acceleration Bands的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		upper: { label: "upper", value: 0, legendShowName: "upper" },
		middle: { label: "middle", value: 0, legendShowName: "middle" },
		lower: { label: "lower", value: 0, legendShowName: "lower" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "upper",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "upper" as keyof IndicatorValueConfig,
			},
			{
				name: "middle",
				type: SeriesType.DASH,
				color: "#4ECDC4",
				strokeThickness: 2,
				indicatorValueKey: "middle" as keyof IndicatorValueConfig,
			},
			{
				name: "lower",
				type: SeriesType.LINE,
				color: "#45B7D1",
				strokeThickness: 1,
				indicatorValueKey: "lower" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): AccBandsConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = AccBandsConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ACCBANDS,
		AccBandsConfigSchema,
		buildAccBandsConfig,
	),

	validateConfig(config: unknown): config is AccBandsConfigType {
		try {
			AccBandsConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	getSeriesName(
		seriesName: string,
		indicatorKey: IndicatorKey,
	): string | undefined {
		// 如果指标类型为ACC_BANDS，则返回ACC_BANDS-seriesName-timePeriod
		if (indicatorKey.indicatorType === IndicatorType.ACCBANDS) {
			const accBandsConfig = indicatorKey.indicatorConfig as AccBandsConfigType;
			// 找到名称相同的seriesConfig
			const seriseConfig = this.chartConfig.seriesConfigs.find(
				(config) => config.name === seriesName,
			);
			if (seriseConfig) {
				return `${indicatorKey.indicatorType} ${accBandsConfig.timePeriod} : ${seriseConfig.name}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
};
