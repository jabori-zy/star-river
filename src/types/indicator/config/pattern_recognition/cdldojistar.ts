import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLDOJISTARConfigSchema = z.object({
	// CDLDOJISTAR 没有参数
});

export type CDLDOJISTARConfigType = z.infer<typeof CDLDOJISTARConfigSchema>;

function buildCDLDOJISTARConfig(_params: Map<string, string>): unknown {
	return {
		// CDLDOJISTAR 不需要任何参数
	};
}

export const CDLDOJISTARConfig: IndicatorConfig<CDLDOJISTARConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLDOJISTAR,
	displayName: "CDLDOJISTAR",
	description: "Doji Star",
	params: {
		// CDLDOJISTAR 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		doji_star: { label: "doji_star", value: 0, legendShowName: "dojistar" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "doji_star",
				type: SeriesType.COLUMN,
				color: "#AEAEB2",
				lineWidth: 1,
				indicatorValueKey: "doji_star" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLDOJISTARConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLDOJISTARConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLDOJISTAR,
		CDLDOJISTARConfigSchema,
		buildCDLDOJISTARConfig,
	),

	validateConfig(config: unknown): config is CDLDOJISTARConfigType {
		try {
			CDLDOJISTARConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};