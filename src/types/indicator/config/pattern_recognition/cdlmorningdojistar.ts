import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLMORNINGDOJISTARConfigSchema = z.object({
	penetration: z.number(),
});

export type CDLMORNINGDOJISTARConfigType = z.infer<
	typeof CDLMORNINGDOJISTARConfigSchema
>;

function buildCDLMORNINGDOJISTARConfig(params: Map<string, string>): unknown {
	return {
		penetration: Number.parseFloat(params.get("penetration") || "0.3"),
	};
}

export const CDLMORNINGDOJISTARConfig: IndicatorConfig<CDLMORNINGDOJISTARConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLMORNINGDOJISTAR,
		displayName: "CDLMORNINGDOJISTAR",
		description: "Morning Doji Star",
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
			morning_doji_star: {
				label: "morning_doji_star",
				value: 0,
				legendShowName: "morningdojistar",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "morning_doji_star",
					type: SeriesType.COLUMN,
					color: "#FFC107",
					lineWidth: 1,
					indicatorValueKey: "morning_doji_star" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLMORNINGDOJISTARConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([key, param]) => [
					key,
					param.defaultValue,
				]),
			);

			const validatedConfig = CDLMORNINGDOJISTARConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLMORNINGDOJISTAR,
			CDLMORNINGDOJISTARConfigSchema,
			buildCDLMORNINGDOJISTARConfig,
		),

		validateConfig(config: unknown): config is CDLMORNINGDOJISTARConfigType {
			try {
				CDLMORNINGDOJISTARConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
