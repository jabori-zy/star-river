import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLRISEFALL3METHODSConfigSchema = z.object({
	// CDLRISEFALL3METHODS 没有参数
});

export type CDLRISEFALL3METHODSConfigType = z.infer<
	typeof CDLRISEFALL3METHODSConfigSchema
>;

function buildCDLRISEFALL3METHODSConfig(_params: Map<string, string>): unknown {
	return {
		// CDLRISEFALL3METHODS 不需要任何参数
	};
}

export const CDLRISEFALL3METHODSConfig: IndicatorConfig<CDLRISEFALL3METHODSConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLRISEFALL3METHODS,
		displayName: "CDLRISEFALL3METHODS",
		description: "Rising/Falling Three Methods",
		params: {
			// CDLRISEFALL3METHODS 没有参数
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			rise_fall_three_methods: {
				label: "rise_fall_three_methods",
				value: 0,
				legendShowName: "risefall3methods",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "rise_fall_three_methods",
					type: SeriesType.COLUMN,
					color: "#673AB7",
					lineWidth: 1,
					indicatorValueKey:
						"rise_fall_three_methods" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLRISEFALL3METHODSConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLRISEFALL3METHODSConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLRISEFALL3METHODS,
			CDLRISEFALL3METHODSConfigSchema,
			buildCDLRISEFALL3METHODSConfig,
		),

		validateConfig(config: unknown): config is CDLRISEFALL3METHODSConfigType {
			try {
				CDLRISEFALL3METHODSConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
