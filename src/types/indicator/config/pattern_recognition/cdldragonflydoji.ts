import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLDRAGONFLYDOJIConfigSchema = z.object({
	// CDLDRAGONFLYDOJI has no parameters
});

export type CDLDRAGONFLYDOJIConfigType = z.infer<
	typeof CDLDRAGONFLYDOJIConfigSchema
>;

function buildCDLDRAGONFLYDOJIConfig(_params: Map<string, string>): unknown {
	return {
		// CDLDRAGONFLYDOJI doesn't need any parameters
	};
}

export const CDLDRAGONFLYDOJIConfig: IndicatorConfig<CDLDRAGONFLYDOJIConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLDRAGONFLYDOJI,
		displayName: "CDLDRAGONFLYDOJI",
		description: "Dragonfly Doji",
		params: {
			// CDLDRAGONFLYDOJI has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			dragonfly_doji: {
				label: "dragonfly_doji",
				value: 0,
				legendShowName: "dragonflydoji",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "dragonfly_doji",
					type: SeriesType.COLUMN,
					color: "#30D158",
					lineWidth: 1,
					indicatorValueKey: "dragonfly_doji" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLDRAGONFLYDOJIConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLDRAGONFLYDOJIConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLDRAGONFLYDOJI,
			CDLDRAGONFLYDOJIConfigSchema,
			buildCDLDRAGONFLYDOJIConfig,
		),

		validateConfig(config: unknown): config is CDLDRAGONFLYDOJIConfigType {
			try {
				CDLDRAGONFLYDOJIConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
