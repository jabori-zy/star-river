import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	MAType,
	PriceSource,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	MATypeSchema,
	PriceSourceSchema,
} from "@/types/indicator/schemas";

const BBANDSConfigSchema = z.object({
	timePeriod: z.number().int().positive(), // Time period
	devUp: z.number().positive(), // Upper band standard deviation (float)
	devDown: z.number().positive(), // Lower band standard deviation (float)
	maType: MATypeSchema, // Moving average type
	priceSource: PriceSourceSchema, // Price source
});

export type BBANDSConfigType = z.infer<typeof BBANDSConfigSchema>;

// Parameter mapping function for BBANDS indicator
function buildBBANDSConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "12"),
		devUp: parseFloat(params.get("dev_up") || "0.01"),
		devDown: parseFloat(params.get("dev_down") || "0.01"),
		maType: params.get("ma_type") as MAType,
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const BBANDSConfig: IndicatorConfig<BBANDSConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.BBANDS,
	displayName: "BBands",
	description: "Bollinger Bands indicator",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period",
			defaultValue: 20,
			required: true,
			legendShowName: "period",
		},
		devUp: {
			label: "indicator.configField.devUp",
			description: "Select upper band standard deviation",
			defaultValue: 2.0,
			required: true,
			legendShowName: "dev up",
		},
		devDown: {
			label: "indicator.configField.devDown",
			description: "Select lower band standard deviation",
			defaultValue: 2.0,
			required: true,
			legendShowName: "dev down",
		},
		maType: {
			label: "indicator.configField.maType",
			description: "Select moving average type",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "ma type",
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
		upper: { label: "upper", value: 0, legendShowName: "upper" },
		middle: { label: "middle", value: 0, legendShowName: "middle" },
		lower: { label: "lower", value: 0, legendShowName: "lower" },
	},
	chartConfig: {
		isInMainChart: true, // BBands displays in main chart
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

	getDefaultConfig(): BBANDSConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = BBANDSConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.BBANDS,
		BBANDSConfigSchema,
		buildBBANDSConfig,
	),

	validateConfig(config: unknown): config is BBANDSConfigType {
		try {
			BBANDSConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	if (indicatorKey.indicatorType === IndicatorType.BBANDS) {
	// 		const BBANDSConfig = indicatorKey.indicatorConfig as BBANDSConfigType;
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${BBANDSConfig.timePeriod} ${BBANDSConfig.devUp} ${BBANDSConfig.devDown} ${BBANDSConfig.maType.toLowerCase()} ${BBANDSConfig.priceSource.toLowerCase()} : ${seriseConfig.name}`;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
