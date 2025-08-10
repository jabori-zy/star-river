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

const CDL2CROWSConfigSchema = z.object({
	// CDL2CROWS 没有参数
});

export type CDL2CROWSConfigType = z.infer<typeof CDL2CROWSConfigSchema>;

function buildCDL2CROWSConfig(_params: Map<string, string>): unknown {
	return {
		// CDL2CROWS 不需要任何参数
	};
}

export const CDL2CROWSConfig: IndicatorConfig<CDL2CROWSConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDL2CROWS,
	displayName: "CDL2CROWS",
	description: "Two Crows",
	params: {
		// CDL2CROWS 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		two_crows: { label: "two_crows", value: 0, legendShowName: "2crows" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "two_crows",
				type: SeriesType.COLUMN,
				color: "#FF3B30",
				lineWidth: 1,
				indicatorValueKey: "two_crows" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDL2CROWSConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDL2CROWSConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDL2CROWS,
		CDL2CROWSConfigSchema,
		buildCDL2CROWSConfig,
	),

	validateConfig(config: unknown): config is CDL2CROWSConfigType {
		try {
			CDL2CROWSConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};