import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLCOUNTERATTACKConfigSchema = z.object({
	// CDLCOUNTERATTACK has no parameters
});

export type CDLCOUNTERATTACKConfigType = z.infer<
	typeof CDLCOUNTERATTACKConfigSchema
>;

function buildCDLCOUNTERATTACKConfig(_params: Map<string, string>): unknown {
	return {
		// CDLCOUNTERATTACK doesn't need any parameters
	};
}

export const CDLCOUNTERATTACKConfig: IndicatorConfig<CDLCOUNTERATTACKConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLCOUNTERATTACK,
		displayName: "CDLCOUNTERATTACK",
		description: "Counterattack",
		params: {
			// CDLCOUNTERATTACK has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			counterattack: {
				label: "counterattack",
				value: 0,
				legendShowName: "counterattack",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "counterattack",
					type: SeriesType.COLUMN,
					color: "#FF6B35",
					lineWidth: 1,
					indicatorValueKey: "counterattack" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLCOUNTERATTACKConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLCOUNTERATTACKConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLCOUNTERATTACK,
			CDLCOUNTERATTACKConfigSchema,
			buildCDLCOUNTERATTACKConfig,
		),

		validateConfig(config: unknown): config is CDLCOUNTERATTACKConfigType {
			try {
				CDLCOUNTERATTACKConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
