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

// Zod schema for RSI indicator configuration
const RSIConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type RSIConfigType = z.infer<typeof RSIConfigSchema>;

// Parameter mapping function for RSI indicator
function buildRSIConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// RSI indicator configuration implementation
export const RSIConfig: IndicatorConfig<RSIConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.RSI, // Fixed: should be RSI not MA
	displayName: "RSI",
	description: "Calculate Relative Strength Index for the specified period",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for Relative Strength Index",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
		priceSource: {
			label: "indicator.configField.dataSource",
			description: "Select price source for indicator calculation",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		rsi: { label: "rsi", value: 0, legendShowName: "rsi" },
	},
	chartConfig: {
		isInMainChart: false, // RSI displays in sub-chart
		seriesConfigs: [
			{
				name: "RSI",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "rsi" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): RSIConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = RSIConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.RSI,
		RSIConfigSchema,
		buildRSIConfig,
	),

	validateConfig(config: unknown): config is RSIConfigType {
		try {
			RSIConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	if (indicatorKey.indicatorType === IndicatorType.RSI) {
	// 		const RSIConfig = indicatorKey.indicatorConfig as RSIConfigType;
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${RSIConfig.timePeriod} ${RSIConfig.priceSource.toLowerCase()} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
