import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const CDLSTICKSANDWICHConfigSchema = z.object({
	// CDLSTICKSANDWICH has no parameters
});

export type CDLSTICKSANDWICHConfigType = z.infer<
	typeof CDLSTICKSANDWICHConfigSchema
>;

function buildCDLSTICKSANDWICHConfig(_params: Map<string, string>): unknown {
	return {
		// CDLSTICKSANDWICH doesn't need any parameters
	};
}

export const CDLSTICKSANDWICHConfig: IndicatorConfig<CDLSTICKSANDWICHConfigType> =
	{
		category: IndicatorCategory.PATTERN_RECOGNITION,
		type: IndicatorType.CDLSTICKSANDWICH,
		displayName: "CDLSTICKSANDWICH",
		description: "Stick Sandwich",
		params: {
			// CDLSTICKSANDWICH has no parameters
		},
		indicatorValueConfig: {
			timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
			stick_sandwich: {
				label: "stick_sandwich",
				value: 0,
				legendShowName: "sticksandwich",
			},
		},
		chartConfig: {
			isInMainChart: false,
			seriesConfigs: [
				{
					name: "stick_sandwich",
					type: SeriesType.COLUMN,
					color: "#D32F2F",
					lineWidth: 1,
					indicatorValueKey: "stick_sandwich" as keyof IndicatorValueConfig,
				},
			],
		},

		getDefaultConfig(): CDLSTICKSANDWICHConfigType {
			const config = Object.fromEntries(
				Object.entries(this.params).map(([_key, _param]) => [{}]),
			);

			const validatedConfig = CDLSTICKSANDWICHConfigSchema.parse(config);
			return validatedConfig;
		},

		getValue() {
			return getIndicatorValues(this.indicatorValueConfig);
		},

		parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
			IndicatorType.CDLSTICKSANDWICH,
			CDLSTICKSANDWICHConfigSchema,
			buildCDLSTICKSANDWICHConfig,
		),

		validateConfig(config: unknown): config is CDLSTICKSANDWICHConfigType {
			try {
				CDLSTICKSANDWICHConfigSchema.parse(config);
				return true;
			} catch {
				return false;
			}
		},
	};
