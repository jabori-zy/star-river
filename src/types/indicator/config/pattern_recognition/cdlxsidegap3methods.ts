import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLXSIDEGAP3METHODSConfigSchema = z.object({
	// CDLXSIDEGAP3METHODS has no parameters
});

export type CDLXSIDEGAP3METHODSConfigType = z.infer<
	typeof CDLXSIDEGAP3METHODSConfigSchema
>;

function buildCDLXSIDEGAP3METHODSConfig(_params: Map<string, string>): unknown {
	return {
		// CDLXSIDEGAP3METHODS doesn't need any parameters
	};
}

export const CDLXSIDEGAP3METHODSConfig: IndicatorConfig<CDLXSIDEGAP3METHODSConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLXSIDEGAP3METHODS,
		displayName: "CDLXSIDEGAP3METHODS",
		description: "Upside/Downside Gap Three Methods",
		params: {
			// CDLXSIDEGAP3METHODS has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			xside_gap_three_methods: {
				label: "xside_gap_three_methods",
				value: 0,
				legendShowName: "xsidegap3methods",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "xside_gap_three_methods",
					type: SeriesType.COLUMN,
					color: "#757575",
					lineWidth: 1,
					indicatorValueKey:
						"xside_gap_three_methods" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLXSIDEGAP3METHODSConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLXSIDEGAP3METHODSConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLXSIDEGAP3METHODS,
			CDLXSIDEGAP3METHODSConfigSchema,
			buildCDLXSIDEGAP3METHODSConfig,
		),

		validateConfig(config: unknown): config is CDLXSIDEGAP3METHODSConfigType {
			try {
				CDLXSIDEGAP3METHODSConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
