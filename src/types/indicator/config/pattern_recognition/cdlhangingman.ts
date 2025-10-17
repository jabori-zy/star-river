import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLHANGINGMANConfigSchema = z.object({
	// CDLHANGINGMAN 没有参数
});

export type CDLHANGINGMANConfigType = z.infer<typeof CDLHANGINGMANConfigSchema>;

function buildCDLHANGINGMANConfig(_params: Map<string, string>): unknown {
	return {
		// CDLHANGINGMAN 不需要任何参数
	};
}

export const CDLHANGINGMANConfig: IndicatorConfig<CDLHANGINGMANConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLHANGINGMAN,
	displayName: "CDLHANGINGMAN",
	description: "Hanging Man",
	params: {
		// CDLHANGINGMAN 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		hanging_man: {
			label: "hanging_man",
			value: 0,
			legendShowName: "hangingman",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "hanging_man",
				type: SeriesType.COLUMN,
				color: "#8B4513",
				lineWidth: 1,
				indicatorValueKey: "hanging_man" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLHANGINGMANConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLHANGINGMANConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLHANGINGMAN,
		CDLHANGINGMANConfigSchema,
		buildCDLHANGINGMANConfig,
	),

	validateConfig(config: unknown): config is CDLHANGINGMANConfigType {
		try {
			CDLHANGINGMANConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
