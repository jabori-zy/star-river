import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLUNIQUE3RIVERConfigSchema = z.object({
	// CDLUNIQUE3RIVER 没有参数
});

export type CDLUNIQUE3RIVERConfigType = z.infer<
	typeof CDLUNIQUE3RIVERConfigSchema
>;

function buildCDLUNIQUE3RIVERConfig(_params: Map<string, string>): unknown {
	return {
		// CDLUNIQUE3RIVER 不需要任何参数
	};
}

export const CDLUNIQUE3RIVERConfig: IndicatorConfig<CDLUNIQUE3RIVERConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLUNIQUE3RIVER,
		displayName: "CDLUNIQUE3RIVER",
		description: "Unique 3 River",
		params: {
			// CDLUNIQUE3RIVER 没有参数
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			unique_three_river: {
				label: "unique_three_river",
				value: 0,
				legendShowName: "unique3river",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "unique_three_river",
					type: SeriesType.COLUMN,
					color: "#00796B",
					lineWidth: 1,
					indicatorValueKey: "unique_three_river" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLUNIQUE3RIVERConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLUNIQUE3RIVERConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLUNIQUE3RIVER,
			CDLUNIQUE3RIVERConfigSchema,
			buildCDLUNIQUE3RIVERConfig,
		),

		validateConfig(config: unknown): config is CDLUNIQUE3RIVERConfigType {
			try {
				CDLUNIQUE3RIVERConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
