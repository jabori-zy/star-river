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

const CDLBREAKAWAYConfigSchema = z.object({
	// CDLBREAKAWAY 没有参数
});

export type CDLBREAKAWAYConfigType = z.infer<typeof CDLBREAKAWAYConfigSchema>;

function buildCDLBREAKAWAYConfig(_params: Map<string, string>): unknown {
	return {
		// CDLBREAKAWAY 不需要任何参数
	};
}

export const CDLBREAKAWAYConfig: IndicatorConfig<CDLBREAKAWAYConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLBREAKAWAY,
	displayName: "CDLBREAKAWAY",
	description: "Breakaway",
	params: {
		// CDLBREAKAWAY 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		breakaway: { label: "breakaway", value: 0, legendShowName: "breakaway" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "breakaway",
				type: SeriesType.COLUMN,
				color: "#FFD60A",
				lineWidth: 1,
				indicatorValueKey: "breakaway" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLBREAKAWAYConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLBREAKAWAYConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLBREAKAWAY,
		CDLBREAKAWAYConfigSchema,
		buildCDLBREAKAWAYConfig,
	),

	validateConfig(config: unknown): config is CDLBREAKAWAYConfigType {
		try {
			CDLBREAKAWAYConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};