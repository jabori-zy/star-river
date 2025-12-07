import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLLONGLEGGEDDOJIConfigSchema = z.object({
	// CDLLONGLEGGEDDOJI has no parameters
});

export type CDLLONGLEGGEDDOJIConfigType = z.infer<
	typeof CDLLONGLEGGEDDOJIConfigSchema
>;

function buildCDLLONGLEGGEDDOJIConfig(_params: Map<string, string>): unknown {
	return {
		// CDLLONGLEGGEDDOJI doesn't need any parameters
	};
}

export const CDLLONGLEGGEDDOJIConfig: IndicatorConfig<CDLLONGLEGGEDDOJIConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLLONGLEGGEDDOJI,
		displayName: "CDLLONGLEGGEDDOJI",
		description: "Long Legged Doji",
		params: {
			// CDLLONGLEGGEDDOJI has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			long_legged_doji: {
				label: "long_legged_doji",
				value: 0,
				legendShowName: "longleggeddoji",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "long_legged_doji",
					type: SeriesType.COLUMN,
					color: "#C5CAE9",
					lineWidth: 1,
					indicatorValueKey: "long_legged_doji" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLLONGLEGGEDDOJIConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLLONGLEGGEDDOJIConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLLONGLEGGEDDOJI,
			CDLLONGLEGGEDDOJIConfigSchema,
			buildCDLLONGLEGGEDDOJIConfig,
		),

		validateConfig(config: unknown): config is CDLLONGLEGGEDDOJIConfigType {
			try {
				CDLLONGLEGGEDDOJIConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
