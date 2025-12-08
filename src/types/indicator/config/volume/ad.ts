import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// AD indicator configuration Zod schema
const ADConfigSchema = z.object({}); // no parameters

export type ADConfigType = z.infer<typeof ADConfigSchema>;

// AD indicator parameter mapping function
function buildADConfig(): unknown {
	return {};
}

// Chaikin A/D Line - Chande Momentum Line
export const ADConfig: IndicatorConfig<ADConfigType> = {
	category: IndicatorCategory.VOLUME,
	type: IndicatorType.AD,
	displayName: "AD",
	description: "Accumulation/Distribution",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		ad: { label: "ad", value: 0, legendShowName: "ad" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ad",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "ad" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ADConfigType {
		const config = {};

		// Validate configuration using Zod
		const validatedConfig = ADConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use common parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.AD,
		ADConfigSchema,
		buildADConfig,
	),

	validateConfig(config: unknown): config is ADConfigType {
		try {
			ADConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is AD, return AD-seriesName
	// 	if (indicatorKey.indicatorType === IndicatorType.AD) {
	// 		// const adConfig = indicatorKey.indicatorConfig as ADConfigType;
	// 		// Find seriesConfig with matching name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
