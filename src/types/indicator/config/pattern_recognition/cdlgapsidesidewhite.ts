import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLGAPSIDESIDEWHITEConfigSchema = z.object({
	// CDLGAPSIDESIDEWHITE has no parameters
});

export type CDLGAPSIDESIDEWHITEConfigType = z.infer<
	typeof CDLGAPSIDESIDEWHITEConfigSchema
>;

function buildCDLGAPSIDESIDEWHITEConfig(_params: Map<string, string>): unknown {
	return {
		// CDLGAPSIDESIDEWHITE doesn't need any parameters
	};
}

export const CDLGAPSIDESIDEWHITEConfig: IndicatorConfig<CDLGAPSIDESIDEWHITEConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLGAPSIDESIDEWHITE,
		displayName: "CDLGAPSIDESIDEWHITE",
		description: "Up/Down-gap side-by-side white lines",
		params: {
			// CDLGAPSIDESIDEWHITE has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			gap_side_side_white: {
				label: "gap_side_side_white",
				value: 0,
				legendShowName: "gapsidewhite",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "gap_side_side_white",
					type: SeriesType.COLUMN,
					color: "#E5E5EA",
					lineWidth: 1,
					indicatorValueKey:
						"gap_side_side_white" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLGAPSIDESIDEWHITEConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLGAPSIDESIDEWHITEConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLGAPSIDESIDEWHITE,
			CDLGAPSIDESIDEWHITEConfigSchema,
			buildCDLGAPSIDESIDEWHITEConfig,
		),

		validateConfig(config: unknown): config is CDLGAPSIDESIDEWHITEConfigType {
			try {
				CDLGAPSIDESIDEWHITEConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
