import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLMATCHINGLOWConfigSchema = z.object({
	// CDLMATCHINGLOW has no parameters
});

export type CDLMATCHINGLOWConfigType = z.infer<
	typeof CDLMATCHINGLOWConfigSchema
>;

function buildCDLMATCHINGLOWConfig(_params: Map<string, string>): unknown {
	return {
		// CDLMATCHINGLOW doesn't need any parameters
	};
}

export const CDLMATCHINGLOWConfig: IndicatorConfig<CDLMATCHINGLOWConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLMATCHINGLOW,
	displayName: "CDLMATCHINGLOW",
	description: "Matching Low",
	params: {
		// CDLMATCHINGLOW has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		matching_low: {
			label: "matching_low",
			value: 0,
			legendShowName: "matchinglow",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "matching_low",
				type: SeriesType.COLUMN,
				color: "#4CAF50",
				lineWidth: 1,
				indicatorValueKey: "matching_low" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLMATCHINGLOWConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLMATCHINGLOWConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLMATCHINGLOW,
		CDLMATCHINGLOWConfigSchema,
		buildCDLMATCHINGLOWConfig,
	),

	validateConfig(config: unknown): config is CDLMATCHINGLOWConfigType {
		try {
			CDLMATCHINGLOWConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
