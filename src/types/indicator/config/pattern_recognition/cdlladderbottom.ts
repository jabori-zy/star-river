import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLLADDERBOTTOMConfigSchema = z.object({
	// CDLLADDERBOTTOM has no parameters
});

export type CDLLADDERBOTTOMConfigType = z.infer<
	typeof CDLLADDERBOTTOMConfigSchema
>;

function buildCDLLADDERBOTTOMConfig(_params: Map<string, string>): unknown {
	return {
		// CDLLADDERBOTTOM doesn't need any parameters
	};
}

export const CDLLADDERBOTTOMConfig: IndicatorConfig<CDLLADDERBOTTOMConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLLADDERBOTTOM,
		displayName: "CDLLADDERBOTTOM",
		description: "Ladder Bottom",
		params: {
			// CDLLADDERBOTTOM has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			ladder_bottom: {
				label: "ladder_bottom",
				value: 0,
				legendShowName: "ladderbottom",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "ladder_bottom",
					type: SeriesType.COLUMN,
					color: "#795548",
					lineWidth: 1,
					indicatorValueKey: "ladder_bottom" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLLADDERBOTTOMConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLLADDERBOTTOMConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLLADDERBOTTOM,
			CDLLADDERBOTTOMConfigSchema,
			buildCDLLADDERBOTTOMConfig,
		),

		validateConfig(config: unknown): config is CDLLADDERBOTTOMConfigType {
			try {
				CDLLADDERBOTTOMConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
