import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLSEPARATINGLINESConfigSchema = z.object({
	// CDLSEPARATINGLINES has no parameters
});

export type CDLSEPARATINGLINESConfigType = z.infer<
	typeof CDLSEPARATINGLINESConfigSchema
>;

function buildCDLSEPARATINGLINESConfig(_params: Map<string, string>): unknown {
	return {
		// CDLSEPARATINGLINES doesn't need any parameters
	};
}

export const CDLSEPARATINGLINESConfig: IndicatorConfig<CDLSEPARATINGLINESConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLSEPARATINGLINES,
		displayName: "CDLSEPARATINGLINES",
		description: "Separating Lines",
		params: {
			// CDLSEPARATINGLINES has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			separating_lines: {
				label: "separating_lines",
				value: 0,
				legendShowName: "separatinglines",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "separating_lines",
					type: SeriesType.COLUMN,
					color: "#E91E63",
					lineWidth: 1,
					indicatorValueKey: "separating_lines" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLSEPARATINGLINESConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLSEPARATINGLINESConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLSEPARATINGLINES,
			CDLSEPARATINGLINESConfigSchema,
			buildCDLSEPARATINGLINESConfig,
		),

		validateConfig(config: unknown): config is CDLSEPARATINGLINESConfigType {
			try {
				CDLSEPARATINGLINESConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
