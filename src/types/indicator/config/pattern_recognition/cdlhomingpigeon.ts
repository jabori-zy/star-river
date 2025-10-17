import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLHOMINGPIGEONConfigSchema = z.object({
	// CDLHOMINGPIGEON 没有参数
});

export type CDLHOMINGPIGEONConfigType = z.infer<
	typeof CDLHOMINGPIGEONConfigSchema
>;

function buildCDLHOMINGPIGEONConfig(_params: Map<string, string>): unknown {
	return {
		// CDLHOMINGPIGEON 不需要任何参数
	};
}

export const CDLHOMINGPIGEONConfig: IndicatorConfig<CDLHOMINGPIGEONConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLHOMINGPIGEON,
		displayName: "CDLHOMINGPIGEON",
		description: "Homing Pigeon",
		params: {
			// CDLHOMINGPIGEON 没有参数
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			homing_pigeon: {
				label: "homing_pigeon",
				value: 0,
				legendShowName: "homingpigeon",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "homing_pigeon",
					type: SeriesType.COLUMN,
					color: "#D1C4E9",
					lineWidth: 1,
					indicatorValueKey: "homing_pigeon" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLHOMINGPIGEONConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLHOMINGPIGEONConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLHOMINGPIGEON,
			CDLHOMINGPIGEONConfigSchema,
			buildCDLHOMINGPIGEONConfig,
		),

		validateConfig(config: unknown): config is CDLHOMINGPIGEONConfigType {
			try {
				CDLHOMINGPIGEONConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
