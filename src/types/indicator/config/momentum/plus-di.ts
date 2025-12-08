import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for PLUS_DI indicator configuration
const PlusDiConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type PlusDiConfigType = z.infer<typeof PlusDiConfigSchema>;

// Parameter mapping function for PLUS_DI indicator
function buildPlusDiConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// PLUS_DI indicator configuration implementation
export const PlusDiConfig: IndicatorConfig<PlusDiConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.PLUS_DI,
	displayName: "Plus DI",
	description: "Plus Directional Indicator",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for Plus Directional Indicator",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		plus_di: { label: "plus_di", value: 0, legendShowName: "plus_di" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "Plus DI",
				type: SeriesType.LINE,
				color: "#00FF00",
				lineWidth: 2,
				indicatorValueKey: "plus_di" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): PlusDiConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = PlusDiConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.PLUS_DI,
		PlusDiConfigSchema,
		buildPlusDiConfig,
	),

	validateConfig(config: unknown): config is PlusDiConfigType {
		try {
			PlusDiConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
