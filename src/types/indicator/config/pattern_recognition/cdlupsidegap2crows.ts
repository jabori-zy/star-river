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

const CDLUPSIDEGAP2CROWSConfigSchema = z.object({
	// CDLUPSIDEGAP2CROWS 没有参数
});

export type CDLUPSIDEGAP2CROWSConfigType = z.infer<typeof CDLUPSIDEGAP2CROWSConfigSchema>;

function buildCDLUPSIDEGAP2CROWSConfig(_params: Map<string, string>): unknown {
	return {
		// CDLUPSIDEGAP2CROWS 不需要任何参数
	};
}

export const CDLUPSIDEGAP2CROWSConfig: IndicatorConfig<CDLUPSIDEGAP2CROWSConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLUPSIDEGAP2CROWS,
	displayName: "CDLUPSIDEGAP2CROWS",
	description: "Upside Gap Two Crows",
	params: {
		// CDLUPSIDEGAP2CROWS 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		upside_gap_two_crows: { label: "upside_gap_two_crows", value: 0, legendShowName: "upsidegap2crows" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "upside_gap_two_crows",
				type: SeriesType.COLUMN,
				color: "#424242",
				lineWidth: 1,
				indicatorValueKey: "upside_gap_two_crows" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLUPSIDEGAP2CROWSConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLUPSIDEGAP2CROWSConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLUPSIDEGAP2CROWS,
		CDLUPSIDEGAP2CROWSConfigSchema,
		buildCDLUPSIDEGAP2CROWSConfig,
	),

	validateConfig(config: unknown): config is CDLUPSIDEGAP2CROWSConfigType {
		try {
			CDLUPSIDEGAP2CROWSConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};