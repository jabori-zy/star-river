import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLRICKSHAWMANConfigSchema = z.object({
	// CDLRICKSHAWMAN 没有参数
});

export type CDLRICKSHAWMANConfigType = z.infer<
	typeof CDLRICKSHAWMANConfigSchema
>;

function buildCDLRICKSHAWMANConfig(_params: Map<string, string>): unknown {
	return {
		// CDLRICKSHAWMAN 不需要任何参数
	};
}

export const CDLRICKSHAWMANConfig: IndicatorConfig<CDLRICKSHAWMANConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLRICKSHAWMAN,
	displayName: "CDLRICKSHAWMAN",
	description: "Rickshaw Man",
	params: {
		// CDLRICKSHAWMAN 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		rickshaw_man: {
			label: "rickshaw_man",
			value: 0,
			legendShowName: "rickshawman",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "rickshaw_man",
				type: SeriesType.COLUMN,
				color: "#FF9800",
				lineWidth: 1,
				indicatorValueKey: "rickshaw_man" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLRICKSHAWMANConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLRICKSHAWMANConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLRICKSHAWMAN,
		CDLRICKSHAWMANConfigSchema,
		buildCDLRICKSHAWMANConfig,
	),

	validateConfig(config: unknown): config is CDLRICKSHAWMANConfigType {
		try {
			CDLRICKSHAWMANConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
