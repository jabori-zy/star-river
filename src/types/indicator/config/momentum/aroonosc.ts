import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// AROONOSC indicator configuration Zod schema
const AROONOSCConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type AROONOSCConfigType = z.infer<typeof AROONOSCConfigSchema>;

// AROONOSC indicator parameter mapping function
function buildAROONOSCConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// AROONOSC indicator configuration implementation
export const AROONOSCConfig: IndicatorConfig<AROONOSCConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.AROONOSC,
	displayName: "AROONOSC",
	description: "Aroon Oscillator",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select the time period for the AROON oscillator",
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
				lineWidth: 2,
				indicatorValueKey: "aroon_osc" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): AROONOSCConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = AROONOSCConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use common parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.AROONOSC,
		AROONOSCConfigSchema,
		buildAROONOSCConfig,
	),

	validateConfig(config: unknown): config is AROONOSCConfigType {
		try {
			AROONOSCConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is AROONOSC, return AROONOSC-seriesName-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.AROONOSC) {
	// 		const AROONOSCConfig = indicatorKey.indicatorConfig as AROONOSCConfigType;
	// 		// Find seriesConfig with matching name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${AROONOSCConfig.timePeriod} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
