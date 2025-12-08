import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLDOJIConfigSchema = z.object({
	// CDLDOJI has no parameters
});

export type CDLDOJIConfigType = z.infer<typeof CDLDOJIConfigSchema>;

function buildCDLDOJIConfig(_params: Map<string, string>): unknown {
	return {
		// CDLDOJI doesn't need any parameters
	};
}

export const CDLDOJIConfig: IndicatorConfig<CDLDOJIConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLDOJI,
	displayName: "CDLDOJI",
	description: "Doji",
	params: {
		// CDLDOJI has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		doji: { label: "doji", value: 0, legendShowName: "doji" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "doji",
				type: SeriesType.COLUMN,
				color: "#F2F2F7",
				lineWidth: 1,
				indicatorValueKey: "doji" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLDOJIConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLDOJIConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLDOJI,
		CDLDOJIConfigSchema,
		buildCDLDOJIConfig,
	),

	validateConfig(config: unknown): config is CDLDOJIConfigType {
		try {
			CDLDOJIConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
