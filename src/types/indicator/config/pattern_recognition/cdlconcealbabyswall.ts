import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLCONCEALBABYSWALLConfigSchema = z.object({
	// CDLCONCEALBABYSWALL has no parameters
});

export type CDLCONCEALBABYSWALLConfigType = z.infer<
	typeof CDLCONCEALBABYSWALLConfigSchema
>;

function buildCDLCONCEALBABYSWALLConfig(_params: Map<string, string>): unknown {
	return {
		// CDLCONCEALBABYSWALL doesn't need any parameters
	};
}

export const CDLCONCEALBABYSWALLConfig: IndicatorConfig<CDLCONCEALBABYSWALLConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLCONCEALBABYSWALL,
		displayName: "CDLCONCEALBABYSWALL",
		description: "Concealing Baby Swallow",
		params: {
			// CDLCONCEALBABYSWALL has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			conceal_baby_swallow: {
				label: "conceal_baby_swallow",
				value: 0,
				legendShowName: "concealbaby",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "conceal_baby_swallow",
					type: SeriesType.COLUMN,
					color: "#8E8E93",
					lineWidth: 1,
					indicatorValueKey:
						"conceal_baby_swallow" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLCONCEALBABYSWALLConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLCONCEALBABYSWALLConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLCONCEALBABYSWALL,
			CDLCONCEALBABYSWALLConfigSchema,
			buildCDLCONCEALBABYSWALLConfig,
		),

		validateConfig(config: unknown): config is CDLCONCEALBABYSWALLConfigType {
			try {
				CDLCONCEALBABYSWALLConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
