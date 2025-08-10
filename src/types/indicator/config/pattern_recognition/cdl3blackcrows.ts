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

const CDL3BLACKCROWSConfigSchema = z.object({
	// CDL3BLACKCROWS 没有参数
});

export type CDL3BLACKCROWSConfigType = z.infer<typeof CDL3BLACKCROWSConfigSchema>;

function buildCDL3BLACKCROWSConfig(_params: Map<string, string>): unknown {
	return {
		// CDL3BLACKCROWS 不需要任何参数
	};
}

export const CDL3BLACKCROWSConfig: IndicatorConfig<CDL3BLACKCROWSConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDL3BLACKCROWS,
	displayName: "CDL3BLACKCROWS",
	description: "Three Black Crows",
	params: {
		// CDL3BLACKCROWS 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		three_black_crows: { label: "three_black_crows", value: 0, legendShowName: "3blackcrows" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "three_black_crows",
				type: SeriesType.COLUMN,
				color: "#000000",
				lineWidth: 1,
				indicatorValueKey: "three_black_crows" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDL3BLACKCROWSConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDL3BLACKCROWSConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDL3BLACKCROWS,
		CDL3BLACKCROWSConfigSchema,
		buildCDL3BLACKCROWSConfig,
	),

	validateConfig(config: unknown): config is CDL3BLACKCROWSConfigType {
		try {
			CDL3BLACKCROWSConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};