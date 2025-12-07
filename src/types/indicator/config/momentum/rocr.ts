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

// Zod schema for ROCR indicator configuration
const ROCRConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type ROCRConfigType = z.infer<typeof ROCRConfigSchema>;

// Parameter mapping function for ROCR indicator
function buildROCRConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// ROCR indicator configuration implementation
export const ROCRConfig: IndicatorConfig<ROCRConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ROCR,
	displayName: "ROCR",
	description: "Rate of Change Ratio - (price/prevPrice)",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for Rate of Change Ratio",
			defaultValue: 10,
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
		rocr: { label: "rocr", value: 0, legendShowName: "rocr" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ROCR",
				type: SeriesType.LINE,
				color: "#795548",
				lineWidth: 2,
				indicatorValueKey: "rocr" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ROCRConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = ROCRConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ROCR,
		ROCRConfigSchema,
		buildROCRConfig,
	),

	validateConfig(config: unknown): config is ROCRConfigType {
		try {
			ROCRConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
