import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLEVENINGDOJISTARConfigSchema = z.object({
	penetration: z.number(),
});

export type CDLEVENINGDOJISTARConfigType = z.infer<
	typeof CDLEVENINGDOJISTARConfigSchema
>;

function buildCDLEVENINGDOJISTARConfig(params: Map<string, string>): unknown {
	return {
		penetration: Number.parseFloat(params.get("penetration") || "0.3"),
	};
}

export const CDLEVENINGDOJISTARConfig: IndicatorConfig<CDLEVENINGDOJISTARConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLEVENINGDOJISTAR,
		displayName: "CDLEVENINGDOJISTAR",
		description: "Evening Doji Star",
		params: {
			penetration: {
				label: "indicator.configField.penetration",
				description: "Penetration parameter",
				defaultValue: 0.3,
				required: true,
				legendShowName: "penetration",
			},
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			evening_doji_star: {
				label: "evening_doji_star",
				value: 0,
				legendShowName: "eveningdojistar",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "evening_doji_star",
					type: SeriesType.COLUMN,
					color: "#1C1C1E",
					lineWidth: 1,
					indicatorValueKey: "evening_doji_star" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLEVENINGDOJISTARConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([key, param]) => [
					key,
					param.defaultValue,
				]),
			);

			const validatedConfig = CDLEVENINGDOJISTARConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLEVENINGDOJISTAR,
			CDLEVENINGDOJISTARConfigSchema,
			buildCDLEVENINGDOJISTARConfig,
		),

		validateConfig(config: unknown): config is CDLEVENINGDOJISTARConfigType {
			try {
				CDLEVENINGDOJISTARConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
