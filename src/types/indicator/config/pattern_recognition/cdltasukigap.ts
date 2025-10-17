import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLTASUKIGAPConfigSchema = z.object({
	// CDLTASUKIGAP 没有参数
});

export type CDLTASUKIGAPConfigType = z.infer<typeof CDLTASUKIGAPConfigSchema>;

function buildCDLTASUKIGAPConfig(_params: Map<string, string>): unknown {
	return {
		// CDLTASUKIGAP 不需要任何参数
	};
}

export const CDLTASUKIGAPConfig: IndicatorConfig<CDLTASUKIGAPConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLTASUKIGAP,
	displayName: "CDLTASUKIGAP",
	description: "Tasuki Gap",
	params: {
		// CDLTASUKIGAP 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		tasuki_gap: { label: "tasuki_gap", value: 0, legendShowName: "tasukigap" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "tasuki_gap",
				type: SeriesType.COLUMN,
				color: "#1976D2",
				lineWidth: 1,
				indicatorValueKey: "tasuki_gap" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLTASUKIGAPConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLTASUKIGAPConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLTASUKIGAP,
		CDLTASUKIGAPConfigSchema,
		buildCDLTASUKIGAPConfig,
	),

	validateConfig(config: unknown): config is CDLTASUKIGAPConfigType {
		try {
			CDLTASUKIGAPConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
