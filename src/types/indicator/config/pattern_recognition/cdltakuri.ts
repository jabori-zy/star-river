import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLTAKURIConfigSchema = z.object({
	// CDLTAKURI has no parameters
});

export type CDLTAKURIConfigType = z.infer<typeof CDLTAKURIConfigSchema>;

function buildCDLTAKURIConfig(_params: Map<string, string>): unknown {
	return {
		// CDLTAKURI doesn't need any parameters
	};
}

export const CDLTAKURIConfig: IndicatorConfig<CDLTAKURIConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLTAKURI,
	displayName: "CDLTAKURI",
	description: "Takuri (Dragonfly Doji with very long lower shadow)",
	params: {
		// CDLTAKURI has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		takuri: { label: "takuri", value: 0, legendShowName: "takuri" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "takuri",
				type: SeriesType.COLUMN,
				color: "#388E3C",
				lineWidth: 1,
				indicatorValueKey: "takuri" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLTAKURIConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLTAKURIConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLTAKURI,
		CDLTAKURIConfigSchema,
		buildCDLTAKURIConfig,
	),

	validateConfig(config: unknown): config is CDLTAKURIConfigType {
		try {
			CDLTAKURIConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
