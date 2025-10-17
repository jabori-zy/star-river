import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLHIGHWAVEConfigSchema = z.object({
	// CDLHIGHWAVE 没有参数
});

export type CDLHIGHWAVEConfigType = z.infer<typeof CDLHIGHWAVEConfigSchema>;

function buildCDLHIGHWAVEConfig(_params: Map<string, string>): unknown {
	return {
		// CDLHIGHWAVE 不需要任何参数
	};
}

export const CDLHIGHWAVEConfig: IndicatorConfig<CDLHIGHWAVEConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLHIGHWAVE,
	displayName: "CDLHIGHWAVE",
	description: "High-Wave Candle",
	params: {
		// CDLHIGHWAVE 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		high_wave: { label: "high_wave", value: 0, legendShowName: "highwave" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "high_wave",
				type: SeriesType.COLUMN,
				color: "#00C7BE",
				lineWidth: 1,
				indicatorValueKey: "high_wave" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLHIGHWAVEConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLHIGHWAVEConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLHIGHWAVE,
		CDLHIGHWAVEConfigSchema,
		buildCDLHIGHWAVEConfig,
	),

	validateConfig(config: unknown): config is CDLHIGHWAVEConfigType {
		try {
			CDLHIGHWAVEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
