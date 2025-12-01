import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const MinusDiConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type MinusDiConfigType = z.infer<typeof MinusDiConfigSchema>;

function buildMinusDiConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "14"),
	};
}

export const MinusDiConfig: IndicatorConfig<MinusDiConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.MINUS_DI,
	displayName: "MINUS_DI",
	description: "Minus Directional Indicator",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "计算周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		minus_di: { label: "minus_di", value: 0, legendShowName: "minus_di" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "minus_di",
				type: SeriesType.LINE,
				color: "#DC143C",
				lineWidth: 2,
				indicatorValueKey: "minus_di" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MinusDiConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = MinusDiConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MINUS_DI,
		MinusDiConfigSchema,
		buildMinusDiConfig,
	),

	validateConfig(config: unknown): config is MinusDiConfigType {
		try {
			MinusDiConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
