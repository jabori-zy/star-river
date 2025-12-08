import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDL3WHITESOLDIERSConfigSchema = z.object({
	// CDL3WHITESOLDIERS has no parameters
});

export type CDL3WHITESOLDIERSConfigType = z.infer<
	typeof CDL3WHITESOLDIERSConfigSchema
>;

function buildCDL3WHITESOLDIERSConfig(_params: Map<string, string>): unknown {
	return {
		// CDL3WHITESOLDIERS doesn't need any parameters
	};
}

export const CDL3WHITESOLDIERSConfig: IndicatorConfig<CDL3WHITESOLDIERSConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDL3WHITESOLDIERS,
		displayName: "CDL3WHITESOLDIERS",
		description: "Three Advancing White Soldiers",
		params: {
			// CDL3WHITESOLDIERS has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			three_white_soldiers: {
				label: "three_white_soldiers",
				value: 0,
				legendShowName: "3whitesoldiers",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "three_white_soldiers",
					type: SeriesType.COLUMN,
					color: "#FFFFFF",
					lineWidth: 1,
					indicatorValueKey:
						"three_white_soldiers" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDL3WHITESOLDIERSConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDL3WHITESOLDIERSConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDL3WHITESOLDIERS,
			CDL3WHITESOLDIERSConfigSchema,
			buildCDL3WHITESOLDIERSConfig,
		),

		validateConfig(config: unknown): config is CDL3WHITESOLDIERSConfigType {
			try {
				CDL3WHITESOLDIERSConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
