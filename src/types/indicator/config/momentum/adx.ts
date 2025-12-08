import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for ADX indicator configuration
const ADXConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type ADXConfigType = z.infer<typeof ADXConfigSchema>;

// Parameter mapping function for ADX indicator
function buildADXConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// ADX indicator configuration implementation
export const ADXConfig: IndicatorConfig<ADXConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ADX,
	displayName: "ADX",
	description: "Average Directional Index",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for moving average",
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
				color: "#FF6B6B",
				lineWidth: 2,
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

		// Validate configuration using Zod
		const validatedConfig = ADXConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
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

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is ADX, return ADX-seriesName-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.ADX) {
	// 		const ADXConfig = indicatorKey.indicatorConfig as ADXConfigType;
	// 		// Find seriesConfig with the same name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${seriseConfig.name} ${ADXConfig.timePeriod}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
