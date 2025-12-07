import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLADVANCEBLOCKConfigSchema = z.object({
	// CDLADVANCEBLOCK has no parameters
});

export type CDLADVANCEBLOCKConfigType = z.infer<
	typeof CDLADVANCEBLOCKConfigSchema
>;

function buildCDLADVANCEBLOCKConfig(_params: Map<string, string>): unknown {
	return {
		// CDLADVANCEBLOCK doesn't need any parameters
	};
}

export const CDLADVANCEBLOCKConfig: IndicatorConfig<CDLADVANCEBLOCKConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLADVANCEBLOCK,
		displayName: "CDLADVANCEBLOCK",
		description: "Advance Block",
		params: {
			// CDLADVANCEBLOCK has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			advance_block: {
				label: "advance_block",
				value: 0,
				legendShowName: "advanceblock",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "advance_block",
					type: SeriesType.COLUMN,
					color: "#FF2D92",
					lineWidth: 1,
					indicatorValueKey: "advance_block" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLADVANCEBLOCKConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLADVANCEBLOCKConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLADVANCEBLOCK,
			CDLADVANCEBLOCKConfigSchema,
			buildCDLADVANCEBLOCKConfig,
		),

		validateConfig(config: unknown): config is CDLADVANCEBLOCKConfigType {
			try {
				CDLADVANCEBLOCKConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
