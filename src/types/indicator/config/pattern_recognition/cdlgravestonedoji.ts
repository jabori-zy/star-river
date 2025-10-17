import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLGRAVESTONEDOJIConfigSchema = z.object({
	// CDLGRAVESTONEDOJI 没有参数
});

export type CDLGRAVESTONEDOJIConfigType = z.infer<
	typeof CDLGRAVESTONEDOJIConfigSchema
>;

function buildCDLGRAVESTONEDOJIConfig(_params: Map<string, string>): unknown {
	return {
		// CDLGRAVESTONEDOJI 不需要任何参数
	};
}

export const CDLGRAVESTONEDOJIConfig: IndicatorConfig<CDLGRAVESTONEDOJIConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLGRAVESTONEDOJI,
		displayName: "CDLGRAVESTONEDOJI",
		description: "Gravestone Doji",
		params: {
			// CDLGRAVESTONEDOJI 没有参数
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			gravestone_doji: {
				label: "gravestone_doji",
				value: 0,
				legendShowName: "gravestonedoji",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "gravestone_doji",
					type: SeriesType.COLUMN,
					color: "#636366",
					lineWidth: 1,
					indicatorValueKey: "gravestone_doji" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLGRAVESTONEDOJIConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLGRAVESTONEDOJIConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLGRAVESTONEDOJI,
			CDLGRAVESTONEDOJIConfigSchema,
			buildCDLGRAVESTONEDOJIConfig,
		),

		validateConfig(config: unknown): config is CDLGRAVESTONEDOJIConfigType {
			try {
				CDLGRAVESTONEDOJIConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
