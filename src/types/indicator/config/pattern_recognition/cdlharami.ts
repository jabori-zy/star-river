import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLHARAMIConfigSchema = z.object({
	// CDLHARAMI 没有参数
});

export type CDLHARAMIConfigType = z.infer<typeof CDLHARAMIConfigSchema>;

function buildCDLHARAMIConfig(_params: Map<string, string>): unknown {
	return {
		// CDLHARAMI 不需要任何参数
	};
}

export const CDLHARAMIConfig: IndicatorConfig<CDLHARAMIConfigType> = {
	category: IndicatorCategory.PATTERN_RECOGNITION,
	type: IndicatorType.CDLHARAMI,
	displayName: "CDLHARAMI",
	description: "Harami Pattern",
	params: {
		// CDLHARAMI 没有参数
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		harami: { label: "harami", value: 0, legendShowName: "harami" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "harami",
				type: SeriesType.COLUMN,
				color: "#FF9F0A",
				lineWidth: 1,
				indicatorValueKey: "harami" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CDLHARAMIConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([_key, _param]) => [{}]),
		);

		const validatedConfig = CDLHARAMIConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CDLHARAMI,
		CDLHARAMIConfigSchema,
		buildCDLHARAMIConfig,
	),

	validateConfig(config: unknown): config is CDLHARAMIConfigType {
		try {
			CDLHARAMIConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
