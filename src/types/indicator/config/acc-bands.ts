import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKey } from "@/types/symbol-key";

// Zod schema for ACC BANDS indicator configuration
const AccBandsConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type AccBandsConfigType = z.infer<typeof AccBandsConfigSchema>;

// Parameter mapping function for ACC BANDS indicator
function buildAccBandsConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// Acceleration Bands indicator configuration implementation
export const AccBandsConfig: IndicatorConfig<AccBandsConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ACCBANDS,
	displayName: "ACC BANDS",
	description: "Acceleration Bands",
	params: {
		timePeriod: {
			label: "Period",
			description: "Select time period for Acceleration Bands",
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
				lineWidth: 2,
				indicatorValueKey: "upper" as keyof IndicatorValueConfig,
			},
			{
				name: "middle",
				type: SeriesType.DASH,
				color: "#4ECDC4",
				lineWidth: 2,
				indicatorValueKey: "middle" as keyof IndicatorValueConfig,
			},
			{
				name: "lower",
				type: SeriesType.LINE,
				color: "#45B7D1",
				lineWidth: 1,
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

		// Validate configuration using Zod
		const validatedConfig = AccBandsConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
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

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is ACC_BANDS, return ACC_BANDS-seriesName-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.ACCBANDS) {
	// 		const accBandsConfig = indicatorKey.indicatorConfig as AccBandsConfigType;
	// 		// Find the seriesConfig with the same name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${accBandsConfig.timePeriod} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
