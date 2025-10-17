import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDL3STARSINSOUTHConfigSchema = z.object({
	// CDL3STARSINSOUTH 没有参数
});

export type CDL3STARSINSOUTHConfigType = z.infer<
	typeof CDL3STARSINSOUTHConfigSchema
>;

function buildCDL3STARSINSOUTHConfig(_params: Map<string, string>): unknown {
	return {
		// CDL3STARSINSOUTH 不需要任何参数
	};
}

export const CDL3STARSINSOUTHConfig: IndicatorConfig<CDL3STARSINSOUTHConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDL3STARSINSOUTH,
		displayName: "CDL3STARSINSOUTH",
		description: "Three Stars In The South",
		params: {
			// CDL3STARSINSOUTH 没有参数
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			three_stars_in_south: {
				label: "three_stars_in_south",
				value: 0,
				legendShowName: "3starssouth",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "three_stars_in_south",
					type: SeriesType.COLUMN,
					color: "#5856D6",
					lineWidth: 1,
					indicatorValueKey:
						"three_stars_in_south" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDL3STARSINSOUTHConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDL3STARSINSOUTHConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDL3STARSINSOUTH,
			CDL3STARSINSOUTHConfigSchema,
			buildCDL3STARSINSOUTHConfig,
		),

		validateConfig(config: unknown): config is CDL3STARSINSOUTHConfigType {
			try {
				CDL3STARSINSOUTHConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
