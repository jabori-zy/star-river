import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for ULTOSC indicator configuration
const ULTOSCConfigSchema = z.object({
	timePeriod1: z.number().int().positive(),
	timePeriod2: z.number().int().positive(),
	timePeriod3: z.number().int().positive(),
});

export type ULTOSCConfigType = z.infer<typeof ULTOSCConfigSchema>;

// Parameter mapping function for ULTOSC indicator
function buildULTOSCConfig(params: Map<string, string>): unknown {
	return {
		timePeriod1: parseInt(params.get("time_period1") || "0"),
		timePeriod2: parseInt(params.get("time_period2") || "0"),
		timePeriod3: parseInt(params.get("time_period3") || "0"),
	};
}

// ULTOSC indicator configuration implementation
export const ULTOSCConfig: IndicatorConfig<ULTOSCConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ULTOSC,
	displayName: "ULTOSC",
	description: "Ultimate Oscillator",
	params: {
		timePeriod1: {
			label: "indicator.configField.timePeriod1",
			description: "Select first time period",
			defaultValue: 7,
			required: true,
			legendShowName: "period1",
		},
		timePeriod2: {
			label: "indicator.configField.timePeriod2",
			description: "Select second time period",
			defaultValue: 14,
			required: true,
			legendShowName: "period2",
		},
		timePeriod3: {
			label: "indicator.configField.timePeriod3",
			description: "Select third time period",
			defaultValue: 28,
			required: true,
			legendShowName: "period3",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		ultosc: { label: "ultosc", value: 0, legendShowName: "ultosc" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ULTOSC",
				type: SeriesType.LINE,
				color: "#FF9800",
				lineWidth: 2,
				indicatorValueKey: "ultosc" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ULTOSCConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = ULTOSCConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ULTOSC,
		ULTOSCConfigSchema,
		buildULTOSCConfig,
	),

	validateConfig(config: unknown): config is ULTOSCConfigType {
		try {
			ULTOSCConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
