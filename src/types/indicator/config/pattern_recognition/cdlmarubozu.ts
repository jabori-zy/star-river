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

const CDLMARUBOZUConfigSchema = z.object({
	// CDLMARUBOZU 没有参数
});

export type CDLMARUBOZUConfigType = z.infer<typeof CDLMARUBOZUConfigSchema>;

function buildCDLMARUBOZUConfig(_params: Map<string, string>): unknown {
	return {
		// CDLMARUBOZU 不需要任何参数
	};
}

export const CDLMARUBOZUConfig: IndicatorConfig<CDLMARUBOZUConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLMARUBOZU,
	displayName: "CDLMARUBOZU",
	description: "Marubozu",
	params: {
		// CDLMARUBOZU 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		marubozu: { label: "marubozu", value: 0, legendShowName: "marubozu" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "marubozu",
				type: SeriesType.COLUMN,
				color: "#607D8B",
				lineWidth: 1,
				indicatorValueKey: "marubozu" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLMARUBOZUConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLMARUBOZUConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLMARUBOZU,
		CDLMARUBOZUConfigSchema,
		buildCDLMARUBOZUConfig,
	),

	validateConfig(config: unknown): config is CDLMARUBOZUConfigType {
		try {
			CDLMARUBOZUConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};