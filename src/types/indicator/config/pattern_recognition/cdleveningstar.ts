import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLEVENINGSTARConfigSchema = z.object({
	penetration: z.number(),
});

export type CDLEVENINGSTARConfigType = z.infer<
	typeof CDLEVENINGSTARConfigSchema
>;

function buildCDLEVENINGSTARConfig(params: Map<string, string>): unknown {
	return {
		penetration: Number.parseFloat(params.get("penetration") || "0.3"),
	};
}

export const CDLEVENINGSTARConfig: IndicatorConfig<CDLEVENINGSTARConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLEVENINGSTAR,
	displayName: "CDLEVENINGSTAR",
	description: "Evening Star",
	params: {
		penetration: {
			label: "穿透度",
			description: "穿透度参数",
			defaultValue: 0.3,
			required: true,
			legendShowName: "penetration",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		evening_star: {
			label: "evening_star",
			value: 0,
			legendShowName: "eveningstar",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "evening_star",
				type: SeriesType.COLUMN,
				color: "#48484A",
				lineWidth: 1,
				indicatorValueKey: "evening_star" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLEVENINGSTARConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = CDLEVENINGSTARConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLEVENINGSTAR,
		CDLEVENINGSTARConfigSchema,
		buildCDLEVENINGSTARConfig,
	),

	validateConfig(config: unknown): config is CDLEVENINGSTARConfigType {
		try {
			CDLEVENINGSTARConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
