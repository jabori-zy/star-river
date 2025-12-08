import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDL3LINESTRIKEConfigSchema = z.object({
	// CDL3LINESTRIKE has no parameters
});

export type CDL3LINESTRIKEConfigType = z.infer<
	typeof CDL3LINESTRIKEConfigSchema
>;

function buildCDL3LINESTRIKEConfig(_params: Map<string, string>): unknown {
	return {
		// CDL3LINESTRIKE doesn't need any parameters
	};
}

export const CDL3LINESTRIKEConfig: IndicatorConfig<CDL3LINESTRIKEConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDL3LINESTRIKE,
	displayName: "CDL3LINESTRIKE",
	description: "Three-Line Strike",
	params: {
		// CDL3LINESTRIKE has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		three_line_strike: {
			label: "three_line_strike",
			value: 0,
			legendShowName: "3linestrike",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "three_line_strike",
				type: SeriesType.COLUMN,
				color: "#FF9500",
				lineWidth: 1,
				indicatorValueKey: "three_line_strike" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDL3LINESTRIKEConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDL3LINESTRIKEConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDL3LINESTRIKE,
		CDL3LINESTRIKEConfigSchema,
		buildCDL3LINESTRIKEConfig,
	),

	validateConfig(config: unknown): config is CDL3LINESTRIKEConfigType {
		try {
			CDL3LINESTRIKEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
