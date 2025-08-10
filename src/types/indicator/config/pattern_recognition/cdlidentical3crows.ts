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

const CDLIDENTICAL3CROWSConfigSchema = z.object({
	// CDLIDENTICAL3CROWS 没有参数
});

export type CDLIDENTICAL3CROWSConfigType = z.infer<typeof CDLIDENTICAL3CROWSConfigSchema>;

function buildCDLIDENTICAL3CROWSConfig(_params: Map<string, string>): unknown {
	return {
		// CDLIDENTICAL3CROWS 不需要任何参数
	};
}

export const CDLIDENTICAL3CROWSConfig: IndicatorConfig<CDLIDENTICAL3CROWSConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLIDENTICAL3CROWS,
	displayName: "CDLIDENTICAL3CROWS",
	description: "Identical Three Crows",
	params: {
		// CDLIDENTICAL3CROWS 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		identical_three_crows: { label: "identical_three_crows", value: 0, legendShowName: "identical3crows" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "identical_three_crows",
				type: SeriesType.COLUMN,
				color: "#212121",
				lineWidth: 1,
				indicatorValueKey: "identical_three_crows" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLIDENTICAL3CROWSConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLIDENTICAL3CROWSConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLIDENTICAL3CROWS,
		CDLIDENTICAL3CROWSConfigSchema,
		buildCDLIDENTICAL3CROWSConfig,
	),

	validateConfig(config: unknown): config is CDLIDENTICAL3CROWSConfigType {
		try {
			CDLIDENTICAL3CROWSConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};