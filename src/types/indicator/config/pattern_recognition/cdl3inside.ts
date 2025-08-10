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

const CDL3INSIDEConfigSchema = z.object({
	// CDL3INSIDE 没有参数
});

export type CDL3INSIDEConfigType = z.infer<typeof CDL3INSIDEConfigSchema>;

function buildCDL3INSIDEConfig(_params: Map<string, string>): unknown {
	return {
		// CDL3INSIDE 不需要任何参数
	};
}

export const CDL3INSIDEConfig: IndicatorConfig<CDL3INSIDEConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDL3INSIDE,
	displayName: "CDL3INSIDE",
	description: "Three Inside Up/Down",
	params: {
		// CDL3INSIDE 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		three_inside: { label: "three_inside", value: 0, legendShowName: "3inside" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "three_inside",
				type: SeriesType.COLUMN,
				color: "#007AFF",
				lineWidth: 1,
				indicatorValueKey: "three_inside" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDL3INSIDEConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [
				{},
			]),
		);

		const validatedConfig = CDL3INSIDEConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDL3INSIDE,
		CDL3INSIDEConfigSchema,
		buildCDL3INSIDEConfig,
	),

	validateConfig(config: unknown): config is CDL3INSIDEConfigType {
		try {
			CDL3INSIDEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};