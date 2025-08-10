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

const CDLHARAMICROSSConfigSchema = z.object({
	// CDLHARAMICROSS 没有参数
});

export type CDLHARAMICROSSConfigType = z.infer<typeof CDLHARAMICROSSConfigSchema>;

function buildCDLHARAMICROSSConfig(_params: Map<string, string>): unknown {
	return {
		// CDLHARAMICROSS 不需要任何参数
	};
}

export const CDLHARAMICROSSConfig: IndicatorConfig<CDLHARAMICROSSConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLHARAMICROSS,
	displayName: "CDLHARAMICROSS",
	description: "Harami Cross Pattern",
	params: {
		// CDLHARAMICROSS 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		harami_cross: { label: "harami_cross", value: 0, legendShowName: "haramicross" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "harami_cross",
				type: SeriesType.COLUMN,
				color: "#FF8C00",
				lineWidth: 1,
				indicatorValueKey: "harami_cross" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLHARAMICROSSConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDLHARAMICROSSConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLHARAMICROSS,
		CDLHARAMICROSSConfigSchema,
		buildCDLHARAMICROSSConfig,
	),

	validateConfig(config: unknown): config is CDLHARAMICROSSConfigType {
		try {
			CDLHARAMICROSSConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};