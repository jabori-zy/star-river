import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLBELTHOLDConfigSchema = z.object({
	// CDLBELTHOLD has no parameters
});

export type CDLBELTHOLDConfigType = z.infer<typeof CDLBELTHOLDConfigSchema>;

function buildCDLBELTHOLDConfig(_params: Map<string, string>): unknown {
	return {
		// CDLBELTHOLD doesn't need any parameters
	};
}

export const CDLBELTHOLDConfig: IndicatorConfig<CDLBELTHOLDConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLBELTHOLD,
	displayName: "CDLBELTHOLD",
	description: "Belt-hold",
	params: {
		// CDLBELTHOLD has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		belt_hold: { label: "belt_hold", value: 0, legendShowName: "belthold" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "belt_hold",
				type: SeriesType.COLUMN,
				color: "#00D4AA",
				lineWidth: 1,
				indicatorValueKey: "belt_hold" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLBELTHOLDConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLBELTHOLDConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLBELTHOLD,
		CDLBELTHOLDConfigSchema,
		buildCDLBELTHOLDConfig,
	),

	validateConfig(config: unknown): config is CDLBELTHOLDConfigType {
		try {
			CDLBELTHOLDConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
