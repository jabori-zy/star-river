import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for WILLR indicator configuration
const WILLRConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type WILLRConfigType = z.infer<typeof WILLRConfigSchema>;

// Parameter mapping function for WILLR indicator
function buildWILLRConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// WILLR indicator configuration implementation
export const WILLRConfig: IndicatorConfig<WILLRConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.WILLR,
	displayName: "WILLR",
	description: "Williams %R indicator",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for Williams %R indicator",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		willr: { label: "willr", value: 0, legendShowName: "willr" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "WILLR",
				type: SeriesType.LINE,
				color: "#E91E63",
				lineWidth: 2,
				indicatorValueKey: "willr" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): WILLRConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = WILLRConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.WILLR,
		WILLRConfigSchema,
		buildWILLRConfig,
	),

	validateConfig(config: unknown): config is WILLRConfigType {
		try {
			WILLRConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
