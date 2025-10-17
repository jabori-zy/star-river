import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLSTALLEDPATTERNConfigSchema = z.object({
	// CDLSTALLEDPATTERN 没有参数
});

export type CDLSTALLEDPATTERNConfigType = z.infer<
	typeof CDLSTALLEDPATTERNConfigSchema
>;

function buildCDLSTALLEDPATTERNConfig(_params: Map<string, string>): unknown {
	return {
		// CDLSTALLEDPATTERN 不需要任何参数
	};
}

export const CDLSTALLEDPATTERNConfig: IndicatorConfig<CDLSTALLEDPATTERNConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLSTALLEDPATTERN,
		displayName: "CDLSTALLEDPATTERN",
		description: "Stalled Pattern",
		params: {
			// CDLSTALLEDPATTERN 没有参数
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			stalled_pattern: {
				label: "stalled_pattern",
				value: 0,
				legendShowName: "stalledpattern",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "stalled_pattern",
					type: SeriesType.COLUMN,
					color: "#6200EA",
					lineWidth: 1,
					indicatorValueKey: "stalled_pattern" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLSTALLEDPATTERNConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLSTALLEDPATTERNConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLSTALLEDPATTERN,
			CDLSTALLEDPATTERNConfigSchema,
			buildCDLSTALLEDPATTERNConfig,
		),

		validateConfig(config: unknown): config is CDLSTALLEDPATTERNConfigType {
			try {
				CDLSTALLEDPATTERNConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
