import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// BOP indicator configuration Zod schema (no parameters)
const BOPConfigSchema = z.object({});

export type BOPConfigType = z.infer<typeof BOPConfigSchema>;

// BOP indicator parameter mapping function (no parameters)
function buildBOPConfig(): unknown {
	return {};
}

// BOP indicator configuration implementation
export const BOPConfig: IndicatorConfig<BOPConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.BOP,
	displayName: "BOP",
	description: "Balance Of Power",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		bop: { label: "bop", value: 0, legendShowName: "bop" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "bop",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "bop" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): BOPConfigType {
		// BOP indicator has no parameters, return empty object
		const validatedConfig = BOPConfigSchema.parse({});
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use common parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.BOP,
		BOPConfigSchema,
		buildBOPConfig,
	),

	validateConfig(config: unknown): config is BOPConfigType {
		try {
			BOPConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is BOP, return BOP-seriesName
	// 	if (indicatorKey.indicatorType === IndicatorType.BOP) {
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
