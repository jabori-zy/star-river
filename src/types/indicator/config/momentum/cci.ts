import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// Zod schema for CCI indicator configuration
const CCIConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type CCIConfigType = z.infer<typeof CCIConfigSchema>;

// Parameter mapping function for CCI indicator
function buildCCIConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// CCI indicator configuration implementation
export const CCIConfig: IndicatorConfig<CCIConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.CCI,
	displayName: "CCI",
	description: "Commodity Channel Index",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select time period for CCI indicator",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		cci: { label: "cci", value: 0, legendShowName: "cci" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "cci",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "cci" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CCIConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = CCIConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CCI,
		CCIConfigSchema,
		buildCCIConfig,
	),

	validateConfig(config: unknown): config is CCIConfigType {
		try {
			CCIConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is CCI, return CCI-seriesName-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.CCI) {
	// 		const CCIConfig = indicatorKey.indicatorConfig as CCIConfigType;
	// 		// Find seriesConfig with the same name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${CCIConfig.timePeriod} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
