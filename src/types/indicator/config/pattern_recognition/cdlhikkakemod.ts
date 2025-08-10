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

const CDLHIKKAKEMODConfigSchema = z.object({
	// CDLHIKKAKEMOD 没有参数
});

export type CDLHIKKAKEMODConfigType = z.infer<typeof CDLHIKKAKEMODConfigSchema>;

function buildCDLHIKKAKEMODConfig(_params: Map<string, string>): unknown {
	return {
		// CDLHIKKAKEMOD 不需要任何参数
	};
}

export const CDLHIKKAKEMODConfig: IndicatorConfig<CDLHIKKAKEMODConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLHIKKAKEMOD,
	displayName: "CDLHIKKAKEMOD",
	description: "Modified Hikkake Pattern",
	params: {
		// CDLHIKKAKEMOD 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		hikkake_mod: { label: "hikkake_mod", value: 0, legendShowName: "hikkakemod" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "hikkake_mod",
				type: SeriesType.COLUMN,
				color: "#9932CC",
				lineWidth: 1,
				indicatorValueKey: "hikkake_mod" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLHIKKAKEMODConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLHIKKAKEMODConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLHIKKAKEMOD,
		CDLHIKKAKEMODConfigSchema,
		buildCDLHIKKAKEMODConfig,
	),

	validateConfig(config: unknown): config is CDLHIKKAKEMODConfigType {
		try {
			CDLHIKKAKEMODConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};