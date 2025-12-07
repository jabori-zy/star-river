import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDL3OUTSIDEConfigSchema = z.object({
	// CDL3OUTSIDE has no parameters
});

export type CDL3OUTSIDEConfigType = z.infer<typeof CDL3OUTSIDEConfigSchema>;

function buildCDL3OUTSIDEConfig(_params: Map<string, string>): unknown {
	return {
		// CDL3OUTSIDE doesn't need any parameters
	};
}

export const CDL3OUTSIDEConfig: IndicatorConfig<CDL3OUTSIDEConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDL3OUTSIDE,
	displayName: "CDL3OUTSIDE",
	description: "Three Outside Up/Down",
	params: {
		// CDL3OUTSIDE has no parameters
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		three_outside: {
			label: "three_outside",
			value: 0,
			legendShowName: "3outside",
		},
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "three_outside",
				type: SeriesType.COLUMN,
				color: "#32D74B",
				lineWidth: 1,
				indicatorValueKey: "three_outside" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDL3OUTSIDEConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDL3OUTSIDEConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDL3OUTSIDE,
		CDL3OUTSIDEConfigSchema,
		buildCDL3OUTSIDEConfig,
	),

	validateConfig(config: unknown): config is CDL3OUTSIDEConfigType {
		try {
			CDL3OUTSIDEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
