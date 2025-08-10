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

const CDLHAMMERConfigSchema = z.object({
	// CDLHAMMER 没有参数
});

export type CDLHAMMERConfigType = z.infer<typeof CDLHAMMERConfigSchema>;

function buildCDLHAMMERConfig(_params: Map<string, string>): unknown {
	return {
		// CDLHAMMER 不需要任何参数
	};
}

export const CDLHAMMERConfig: IndicatorConfig<CDLHAMMERConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLHAMMER,
	displayName: "CDLHAMMER",
	description: "Hammer",
	params: {
		// CDLHAMMER 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		hammer: { label: "hammer", value: 0, legendShowName: "hammer" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "hammer",
				type: SeriesType.COLUMN,
				color: "#A2845E",
				lineWidth: 1,
				indicatorValueKey: "hammer" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLHAMMERConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLHAMMERConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLHAMMER,
		CDLHAMMERConfigSchema,
		buildCDLHAMMERConfig,
	),

	validateConfig(config: unknown): config is CDLHAMMERConfigType {
		try {
			CDLHAMMERConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};