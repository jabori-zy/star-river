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

// Zod schema for ROCR100 indicator configuration
const ROCR100ConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type ROCR100ConfigType = z.infer<typeof ROCR100ConfigSchema>;

// Parameter mapping function for ROCR100 indicator
function buildROCR100Config(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// ROCR100 indicator configuration implementation
export const ROCR100Config: IndicatorConfig<ROCR100ConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ROCR100,
	displayName: "ROCR100",
	description: "Rate of Change Ratio 100 Scale - (price/prevPrice)*100",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for Rate of Change Ratio 100 Scale",
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
		rocr100: { label: "rocr100", value: 0, legendShowName: "rocr100" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ROCR100",
				type: SeriesType.LINE,
				color: "#607D8B",
				lineWidth: 2,
				indicatorValueKey: "rocr100" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ROCR100ConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = ROCR100ConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ROCR100,
		ROCR100ConfigSchema,
		buildROCR100Config,
	),

	validateConfig(config: unknown): config is ROCR100ConfigType {
		try {
			ROCR100ConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
