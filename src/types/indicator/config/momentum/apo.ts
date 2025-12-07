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

// APO indicator configuration Zod schema
const APOConfigSchema = z.object({
	fastPeriod: z.number().int().positive(),
	slowPeriod: z.number().int().positive(),
	maType: MATypeSchema,
	priceSource: PriceSourceSchema,
});

export type APOConfigType = z.infer<typeof APOConfigSchema>;

// APO indicator parameter mapping function
function buildAPOConfig(params: Map<string, string>): unknown {
	return {
		fastPeriod: parseInt(params.get("fast_period") || "0"),
		slowPeriod: parseInt(params.get("slow_period") || "0"),
		maType: params.get("ma_type") as MAType,
		priceSource: params.get("price_source") as PriceSource,
	};
}

// APO indicator configuration implementation
export const APOConfig: IndicatorConfig<APOConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.APO,
	displayName: "APO",
	description: "Absolute Price Oscillator",
	params: {
		maType: {
			label: "indicator.configField.maType",
			description: "Select the calculation method for the moving average",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "ma type",
		},
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
		apo: { label: "apo", value: 0, legendShowName: "apo" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "apo",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "apo" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): APOConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = APOConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use common parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.APO,
		APOConfigSchema,
		buildAPOConfig,
	),

	validateConfig(config: unknown): config is APOConfigType {
		try {
			APOConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is APO, return APO-seriesName-fastPeriod-slowPeriod-maType-priceSource
	// 	if (indicatorKey.indicatorType === IndicatorType.APO) {
	// 		const APOConfig = indicatorKey.indicatorConfig as APOConfigType;
	// 		// Find seriesConfig with matching name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${seriseConfig.name} ${APOConfig.fastPeriod} ${APOConfig.slowPeriod} ${APOConfig.maType.toLowerCase()} ${APOConfig.priceSource.toLowerCase()}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
