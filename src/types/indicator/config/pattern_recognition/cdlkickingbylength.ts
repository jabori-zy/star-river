import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLKICKINGBYLENGTHConfigSchema = z.object({
	// CDLKICKINGBYLENGTH 没有参数
});

export type CDLKICKINGBYLENGTHConfigType = z.infer<
	typeof CDLKICKINGBYLENGTHConfigSchema
>;

function buildCDLKICKINGBYLENGTHConfig(_params: Map<string, string>): unknown {
	return {
		// CDLKICKINGBYLENGTH 不需要任何参数
	};
}

export const CDLKICKINGBYLENGTHConfig: IndicatorConfig<CDLKICKINGBYLENGTHConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLKICKINGBYLENGTH,
		displayName: "CDLKICKINGBYLENGTH",
		description: "Kicking - bull/bear determined by the longer marubozu",
		params: {
			// CDLKICKINGBYLENGTH 没有参数
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			kicking_by_length: {
				label: "kicking_by_length",
				value: 0,
				legendShowName: "kickingbylength",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "kicking_by_length",
					type: SeriesType.COLUMN,
					color: "#E65100",
					lineWidth: 1,
					indicatorValueKey: "kicking_by_length" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLKICKINGBYLENGTHConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLKICKINGBYLENGTHConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLKICKINGBYLENGTH,
			CDLKICKINGBYLENGTHConfigSchema,
			buildCDLKICKINGBYLENGTHConfig,
		),

		validateConfig(config: unknown): config is CDLKICKINGBYLENGTHConfigType {
			try {
				CDLKICKINGBYLENGTHConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
