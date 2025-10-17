import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const MinusDmConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type MinusDmConfigType = z.infer<typeof MinusDmConfigSchema>;

function buildMinusDmConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "14"),
	};
}

export const MinusDmConfig: IndicatorConfig<MinusDmConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.MINUS_DM,
	displayName: "MINUS_DM",
	description: "Minus Directional Movement",
	params: {
		timePeriod: {
			label: "周期",
			description: "计算周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		minus_dm: { label: "minus_dm", value: 0, legendShowName: "minus_dm" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "minus_dm",
				type: SeriesType.LINE,
				color: "#DC143C",
				lineWidth: 2,
				indicatorValueKey: "minus_dm" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MinusDmConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = MinusDmConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MINUS_DM,
		MinusDmConfigSchema,
		buildMinusDmConfig,
	),

	validateConfig(config: unknown): config is MinusDmConfigType {
		try {
			MinusDmConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
