import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const OBVConfigSchema = z.object({
	// OBV has no parameters, uses default empty object
});

export type OBVConfigType = z.infer<typeof OBVConfigSchema>;

function buildOBVConfig(_params: Map<string, string>): unknown {
	return {
		// OBV requires no parameters
	};
}

export const OBVConfig: IndicatorConfig<OBVConfigType> = {
	category: IndicatorCategory.VOLUME,
	type: IndicatorType.OBV,
	displayName: "OBV",
	description: "On Balance Volume",
	params: {
		// OBV has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		obv: { label: "obv", value: 0, legendShowName: "obv" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "obv",
				type: SeriesType.LINE,
				color: "#FF6B35",
				lineWidth: 2,
				indicatorValueKey: "obv" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): OBVConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => []),
		);

		const validatedConfig = OBVConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.OBV,
		OBVConfigSchema,
		buildOBVConfig,
	),

	validateConfig(config: unknown): config is OBVConfigType {
		try {
			OBVConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
