import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLHIKKAKEConfigSchema = z.object({
	// CDLHIKKAKE has no parameters
});

export type CDLHIKKAKEConfigType = z.infer<typeof CDLHIKKAKEConfigSchema>;

function buildCDLHIKKAKEConfig(_params: Map<string, string>): unknown {
	return {
		// CDLHIKKAKE doesn't need any parameters
	};
}

export const CDLHIKKAKEConfig: IndicatorConfig<CDLHIKKAKEConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLHIKKAKE,
	displayName: "CDLHIKKAKE",
	description: "Hikkake Pattern",
	params: {
		// CDLHIKKAKE has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		hikkake: { label: "hikkake", value: 0, legendShowName: "hikkake" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "hikkake",
				type: SeriesType.COLUMN,
				color: "#A020F0",
				lineWidth: 1,
				indicatorValueKey: "hikkake" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLHIKKAKEConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLHIKKAKEConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLHIKKAKE,
		CDLHIKKAKEConfigSchema,
		buildCDLHIKKAKEConfig,
	),

	validateConfig(config: unknown): config is CDLHIKKAKEConfigType {
		try {
			CDLHIKKAKEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
