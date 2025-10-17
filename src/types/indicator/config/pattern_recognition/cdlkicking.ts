import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLKICKINGConfigSchema = z.object({
	// CDLKICKING 没有参数
});

export type CDLKICKINGConfigType = z.infer<typeof CDLKICKINGConfigSchema>;

function buildCDLKICKINGConfig(_params: Map<string, string>): unknown {
	return {
		// CDLKICKING 不需要任何参数
	};
}

export const CDLKICKINGConfig: IndicatorConfig<CDLKICKINGConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLKICKING,
	displayName: "CDLKICKING",
	description: "Kicking",
	params: {
		// CDLKICKING 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		kicking: { label: "kicking", value: 0, legendShowName: "kicking" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "kicking",
				type: SeriesType.COLUMN,
				color: "#FF5722",
				lineWidth: 1,
				indicatorValueKey: "kicking" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLKICKINGConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLKICKINGConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLKICKING,
		CDLKICKINGConfigSchema,
		buildCDLKICKINGConfig,
	),

	validateConfig(config: unknown): config is CDLKICKINGConfigType {
		try {
			CDLKICKINGConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
