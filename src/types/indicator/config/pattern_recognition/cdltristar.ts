import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLTRISTARConfigSchema = z.object({
	// CDLTRISTAR 没有参数
});

export type CDLTRISTARConfigType = z.infer<typeof CDLTRISTARConfigSchema>;

function buildCDLTRISTARConfig(_params: Map<string, string>): unknown {
	return {
		// CDLTRISTAR 不需要任何参数
	};
}

export const CDLTRISTARConfig: IndicatorConfig<CDLTRISTARConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLTRISTAR,
	displayName: "CDLTRISTAR",
	description: "Tristar Pattern",
	params: {
		// CDLTRISTAR 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		tristar: { label: "tristar", value: 0, legendShowName: "tristar" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "tristar",
				type: SeriesType.COLUMN,
				color: "#0097A7",
				lineWidth: 1,
				indicatorValueKey: "tristar" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLTRISTARConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLTRISTARConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLTRISTAR,
		CDLTRISTARConfigSchema,
		buildCDLTRISTARConfig,
	),

	validateConfig(config: unknown): config is CDLTRISTARConfigType {
		try {
			CDLTRISTARConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
