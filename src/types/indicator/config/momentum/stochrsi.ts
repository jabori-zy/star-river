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

// Zod schema for STOCHRSI indicator configuration
const STOCHRSIConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	fastKPeriod: z.number().int().positive(),
	fastDPeriod: z.number().int().positive(),
	fastDMaType: MATypeSchema,
	priceSource: PriceSourceSchema,
});

export type STOCHRSIConfigType = z.infer<typeof STOCHRSIConfigSchema>;

// Parameter mapping function for STOCHRSI indicator
function buildSTOCHRSIConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		fastKPeriod: parseInt(params.get("fast_k_period") || "0"),
		fastDPeriod: parseInt(params.get("fast_d_period") || "0"),
		fastDMaType: params.get("fast_d_ma_type") as MAType,
		priceSource: params.get("price_source") as PriceSource,
	};
}

// STOCHRSI indicator configuration implementation
export const STOCHRSIConfig: IndicatorConfig<STOCHRSIConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.STOCHRSI,
	displayName: "STOCHRSI",
	description: "Stochastic Relative Strength Index",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for RSI calculation",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
		fastKPeriod: {
			label: "indicator.configField.fastKPeriod",
			description: "Select calculation period for fast K line",
			defaultValue: 5,
			required: true,
			legendShowName: "fast_k",
		},
		fastDPeriod: {
			label: "indicator.configField.fastDPeriod",
			description: "Select calculation period for fast D line",
			defaultValue: 3,
			required: true,
			legendShowName: "fast_d",
		},
		fastDMaType: {
			label: "indicator.configField.fastDMaType",
			description: "Select moving average type for fast D line",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "fast_d_ma",
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
		fast_k: { label: "fast_k", value: 0, legendShowName: "fast_k" },
		fast_d: { label: "fast_d", value: 0, legendShowName: "fast_d" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "STOCHRSI K",
				type: SeriesType.LINE,
				color: "#9C27B0",
				lineWidth: 2,
				indicatorValueKey: "fast_k" as keyof IndicatorValueConfig,
			},
			{
				name: "STOCHRSI D",
				type: SeriesType.LINE,
				color: "#FF5722",
				lineWidth: 2,
				indicatorValueKey: "fast_d" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): STOCHRSIConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = STOCHRSIConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.STOCHRSI,
		STOCHRSIConfigSchema,
		buildSTOCHRSIConfig,
	),

	validateConfig(config: unknown): config is STOCHRSIConfigType {
		try {
			STOCHRSIConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
