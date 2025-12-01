import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLMORNINGSTARConfigSchema = z.object({
	penetration: z.number(),
});

export type CDLMORNINGSTARConfigType = z.infer<
	typeof CDLMORNINGSTARConfigSchema
>;

function buildCDLMORNINGSTARConfig(params: Map<string, string>): unknown {
	return {
		penetration: Number.parseFloat(params.get("penetration") || "0.3"),
	};
}

export const CDLMORNINGSTARConfig: IndicatorConfig<CDLMORNINGSTARConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLMORNINGSTAR,
	displayName: "CDLMORNINGSTAR",
	description: "Morning Star",
	params: {
		penetration: {
			label: "indicator.configField.penetration",
			description: "穿透度参数",
			defaultValue: 0.3,
			required: true,
			legendShowName: "penetration",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		morning_star: {
			label: "morning_star",
			value: 0,
			legendShowName: "morningstar",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "morning_star",
				type: SeriesType.COLUMN,
				color: "#FFEB3B",
				lineWidth: 1,
				indicatorValueKey: "morning_star" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLMORNINGSTARConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = CDLMORNINGSTARConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLMORNINGSTAR,
		CDLMORNINGSTARConfigSchema,
		buildCDLMORNINGSTARConfig,
	),

	validateConfig(config: unknown): config is CDLMORNINGSTARConfigType {
		try {
			CDLMORNINGSTARConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
