import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for PLUS_DM indicator configuration
const PlusDmConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type PlusDmConfigType = z.infer<typeof PlusDmConfigSchema>;

// Parameter mapping function for PLUS_DM indicator
function buildPlusDmConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// PLUS_DM indicator configuration implementation
export const PlusDmConfig: IndicatorConfig<PlusDmConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.PLUS_DM,
	displayName: "Plus DM",
	description: "Plus Directional Movement",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for Plus Directional Movement",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		plus_dm: { label: "plus_dm", value: 0, legendShowName: "plus_dm" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "Plus DM",
				type: SeriesType.LINE,
				color: "#4CAF50",
				lineWidth: 2,
				indicatorValueKey: "plus_dm" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): PlusDmConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = PlusDmConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.PLUS_DM,
		PlusDmConfigSchema,
		buildPlusDmConfig,
	),

	validateConfig(config: unknown): config is PlusDmConfigType {
		try {
			PlusDmConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
