import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLINVERTEDHAMMERConfigSchema = z.object({
	// CDLINVERTEDHAMMER has no parameters
});

export type CDLINVERTEDHAMMERConfigType = z.infer<
	typeof CDLINVERTEDHAMMERConfigSchema
>;

function buildCDLINVERTEDHAMMERConfig(_params: Map<string, string>): unknown {
	return {
		// CDLINVERTEDHAMMER doesn't need any parameters
	};
}

export const CDLINVERTEDHAMMERConfig: IndicatorConfig<CDLINVERTEDHAMMERConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLINVERTEDHAMMER,
		displayName: "CDLINVERTEDHAMMER",
		description: "Inverted Hammer",
		params: {
			// CDLINVERTEDHAMMER has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			inverted_hammer: {
				label: "inverted_hammer",
				value: 0,
				legendShowName: "invertedhammer",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "inverted_hammer",
					type: SeriesType.COLUMN,
					color: "#D4A574",
					lineWidth: 1,
					indicatorValueKey: "inverted_hammer" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLINVERTEDHAMMERConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLINVERTEDHAMMERConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLINVERTEDHAMMER,
			CDLINVERTEDHAMMERConfigSchema,
			buildCDLINVERTEDHAMMERConfig,
		),

		validateConfig(config: unknown): config is CDLINVERTEDHAMMERConfigType {
			try {
				CDLINVERTEDHAMMERConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
