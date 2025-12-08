import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// ADOSC indicator configuration Zod schema
const ADOSCConfigSchema = z.object({
	fastPeriod: z.number().int().positive(),
	slowPeriod: z.number().int().positive(),
});

export type ADOSCConfigType = z.infer<typeof ADOSCConfigSchema>;

// ADOSC indicator parameter mapping function
function buildADOSCConfig(params: Map<string, string>): unknown {
	return {
		fastPeriod: parseInt(params.get("fast_period") || "12"),
		slowPeriod: parseInt(params.get("slow_period") || "26"),
	};
}

// ADOSC indicator configuration implementation
export const ADOSCConfig: IndicatorConfig<ADOSCConfigType> = {
	category: IndicatorCategory.VOLUME,
	type: IndicatorType.ADOSC,
	displayName: "ADOSC",
	description: "Accumulation/Distribution Oscillator",
	params: {
		fastPeriod: {
			label: "indicator.configField.fastPeriod",
			description: "Select the calculation period for the fast line",
			defaultValue: 12,
			required: true,
			legendShowName: "fast",
		},
		slowPeriod: {
			label: "indicator.configField.slowPeriod",
			description: "Select the calculation period for the slow line",
			defaultValue: 26,
			required: true,
			legendShowName: "slow",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		adosc: { label: "adosc", value: 0, legendShowName: "ad osc" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "adosc",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "adosc" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ADOSCConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = ADOSCConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use common parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ADOSC,
		ADOSCConfigSchema,
		buildADOSCConfig,
	),

	validateConfig(config: unknown): config is ADOSCConfigType {
		try {
			ADOSCConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is ADOSC, return ADOSC-seriesName
	// 	if (indicatorKey.indicatorType === IndicatorType.ADOSC) {
	// 		const adoscConfig = indicatorKey.indicatorConfig as ADOSCConfigType;
	// 		// Find seriesConfig with matching name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${adoscConfig.fastPeriod} ${adoscConfig.slowPeriod} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
