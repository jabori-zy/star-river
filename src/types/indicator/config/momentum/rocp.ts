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

// Zod schema for ROCP indicator configuration
const ROCPConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type ROCPConfigType = z.infer<typeof ROCPConfigSchema>;

// Parameter mapping function for ROCP indicator
function buildROCPConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// ROCP indicator configuration implementation
export const ROCPConfig: IndicatorConfig<ROCPConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ROCP,
	displayName: "ROCP",
	description: "Rate of Change Percentage - (price-prevPrice)/prevPrice",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for Rate of Change Percentage",
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
		rocp: { label: "rocp", value: 0, legendShowName: "rocp" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ROCP",
				type: SeriesType.LINE,
				color: "#FF5722",
				lineWidth: 2,
				indicatorValueKey: "rocp" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ROCPConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = ROCPConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ROCP,
		ROCPConfigSchema,
		buildROCPConfig,
	),

	validateConfig(config: unknown): config is ROCPConfigType {
		try {
			ROCPConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
