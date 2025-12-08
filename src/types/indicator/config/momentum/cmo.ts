import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	PriceSource,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	PriceSourceSchema,
} from "@/types/indicator/schemas";

// CMO indicator configuration Zod schema
const CMOConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type CMOConfigType = z.infer<typeof CMOConfigSchema>;

// CMO indicator parameter mapping function
function buildCMOConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// CMO indicator configuration implementation
export const CMOConfig: IndicatorConfig<CMOConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.CMO,
	displayName: "CMO",
	description: "Chande Momentum Oscillator",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select the time period for the CMO indicator",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
		priceSource: {
			label: "indicator.configField.dataSource",
			description: "Select the price source for indicator calculation",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		cmo: { label: "cmo", value: 0, legendShowName: "cmo" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "cmo",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "cmo" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CMOConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = CMOConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use common parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CMO,
		CMOConfigSchema,
		buildCMOConfig,
	),

	validateConfig(config: unknown): config is CMOConfigType {
		try {
			CMOConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is CMO, return CMO-seriesName-timePeriod-priceSource
	// 	if (indicatorKey.indicatorType === IndicatorType.CMO) {
	// 		const CMOConfig = indicatorKey.indicatorConfig as CMOConfigType;
	// 		// Find seriesConfig with matching name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${CMOConfig.timePeriod} ${CMOConfig.priceSource.toLowerCase()} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
