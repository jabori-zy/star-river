import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for ATR indicator configuration
const ATRConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type ATRConfigType = z.infer<typeof ATRConfigSchema>;

// Parameter mapping function for ATR indicator
function buildATRConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "14"),
	};
}

// ATR indicator configuration implementation
export const ATRConfig: IndicatorConfig<ATRConfigType> = {
	category: IndicatorCategory.VOLATILITY,
	type: IndicatorType.ATR,
	displayName: "ATR",
	description: "Average True Range",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select the time period for ATR calculation",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		atr: { label: "atr", value: 0, legendShowName: "atr" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "atr",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "atr" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ATRConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = ATRConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ATR,
		ATRConfigSchema,
		buildATRConfig,
	),

	validateConfig(config: unknown): config is ATRConfigType {
		try {
			ATRConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
