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

// Zod schema for MA indicator configuration
const MAConfigSchema = z.object({
	maType: MATypeSchema,
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type MAConfigType = z.infer<typeof MAConfigSchema>;

// Parameter mapping function for MA indicator
function buildMAConfig(params: Map<string, string>): unknown {
	return {
		maType: params.get("ma_type") as MAType,
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// MA indicator configuration implementation
export const MAConfig: IndicatorConfig<MAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.MA,
	displayName: "MA",
	description: "Calculate moving average for the specified period",
	params: {
		maType: {
			label: "indicator.configField.maType",
			description: "Select calculation method for moving average",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "ma type",
		},
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for moving average",
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
		ma: { label: "ma", value: 0, legendShowName: "ma" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "MA",
				type: SeriesType.LINE,
				color: "#D6D618",
				lineWidth: 2,
				indicatorValueKey: "ma" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = MAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MA,
		MAConfigSchema,
		buildMAConfig,
	),

	validateConfig(config: unknown): config is MAConfigType {
		try {
			MAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is MA, return MA-seriesName-maType-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.MA) {
	// 		const maConfig = indicatorKey.indicatorConfig as MAConfigType;
	// 		// Find seriesConfig with the same name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${seriseConfig.name} ${maConfig.maType.toLowerCase()} ${maConfig.timePeriod} ${maConfig.priceSource.toLowerCase()}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
