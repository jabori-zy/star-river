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

const CDLPIERCINGConfigSchema = z.object({
	// CDLPIERCING 没有参数
});

export type CDLPIERCINGConfigType = z.infer<typeof CDLPIERCINGConfigSchema>;

function buildCDLPIERCINGConfig(_params: Map<string, string>): unknown {
	return {
		// CDLPIERCING 不需要任何参数
	};
}

export const CDLPIERCINGConfig: IndicatorConfig<CDLPIERCINGConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLPIERCING,
	displayName: "CDLPIERCING",
	description: "Piercing Pattern",
	params: {
		// CDLPIERCING 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		piercing: { label: "piercing", value: 0, legendShowName: "piercing" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "piercing",
				type: SeriesType.COLUMN,
				color: "#009688",
				lineWidth: 1,
				indicatorValueKey: "piercing" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLPIERCINGConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLPIERCINGConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLPIERCING,
		CDLPIERCINGConfigSchema,
		buildCDLPIERCINGConfig,
	),

	validateConfig(config: unknown): config is CDLPIERCINGConfigType {
		try {
			CDLPIERCINGConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};