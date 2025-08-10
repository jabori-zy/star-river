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

const CDLSHOOTINGSTARConfigSchema = z.object({
	// CDLSHOOTINGSTAR 没有参数
});

export type CDLSHOOTINGSTARConfigType = z.infer<typeof CDLSHOOTINGSTARConfigSchema>;

function buildCDLSHOOTINGSTARConfig(_params: Map<string, string>): unknown {
	return {
		// CDLSHOOTINGSTAR 不需要任何参数
	};
}

export const CDLSHOOTINGSTARConfig: IndicatorConfig<CDLSHOOTINGSTARConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLSHOOTINGSTAR,
	displayName: "CDLSHOOTINGSTAR",
	description: "Shooting Star",
	params: {
		// CDLSHOOTINGSTAR 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		shooting_star: { label: "shooting_star", value: 0, legendShowName: "shootingstar" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "shooting_star",
				type: SeriesType.COLUMN,
				color: "#F44336",
				lineWidth: 1,
				indicatorValueKey: "shooting_star" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLSHOOTINGSTARConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLSHOOTINGSTARConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLSHOOTINGSTAR,
		CDLSHOOTINGSTARConfigSchema,
		buildCDLSHOOTINGSTARConfig,
	),

	validateConfig(config: unknown): config is CDLSHOOTINGSTARConfigType {
		try {
			CDLSHOOTINGSTARConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};