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

// Zod schema for TRIX indicator configuration
const TRIXConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type TRIXConfigType = z.infer<typeof TRIXConfigSchema>;

// Parameter mapping function for TRIX indicator
function buildTRIXConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// TRIX indicator configuration implementation
export const TRIXConfig: IndicatorConfig<TRIXConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.TRIX,
	displayName: "TRIX",
	description: "Triple Exponential Average with 1-day Rate of Change",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for TRIX indicator",
			defaultValue: 30,
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
		trix: { label: "trix", value: 0, legendShowName: "trix" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "TRIX",
				type: SeriesType.LINE,
				color: "#673AB7",
				lineWidth: 2,
				indicatorValueKey: "trix" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): TRIXConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = TRIXConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.TRIX,
		TRIXConfigSchema,
		buildTRIXConfig,
	),

	validateConfig(config: unknown): config is TRIXConfigType {
		try {
			TRIXConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
