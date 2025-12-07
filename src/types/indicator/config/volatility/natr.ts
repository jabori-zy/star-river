import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for NATR indicator configuration
const NATRConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type NATRConfigType = z.infer<typeof NATRConfigSchema>;

// Parameter mapping function for NATR indicator
function buildNATRConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "14"),
	};
}

// NATR indicator configuration implementation
export const NATRConfig: IndicatorConfig<NATRConfigType> = {
	category: IndicatorCategory.VOLATILITY,
	type: IndicatorType.NATR,
	displayName: "NATR",
	description: "Normalized Average True Range",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select the time period for NATR calculation",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		natr: { label: "natr", value: 0, legendShowName: "natr" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "natr",
				type: SeriesType.LINE,
				color: "#4ECDC4",
				lineWidth: 2,
				indicatorValueKey: "natr" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): NATRConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = NATRConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.NATR,
		NATRConfigSchema,
		buildNATRConfig,
	),

	validateConfig(config: unknown): config is NATRConfigType {
		try {
			NATRConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
