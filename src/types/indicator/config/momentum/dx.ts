import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// DX indicator configuration Zod schema
const DXConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type DXConfigType = z.infer<typeof DXConfigSchema>;

// DX indicator parameter mapping function
function buildDXConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// DX indicator configuration implementation
export const DXConfig: IndicatorConfig<DXConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.DX,
	displayName: "DX",
	description: "Directional Movement Index",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "Select the time period for the DX indicator",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		dx: { label: "dx", value: 0, legendShowName: "dx" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "dx",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "dx" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): DXConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = DXConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use common parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.DX,
		DXConfigSchema,
		buildDXConfig,
	),

	validateConfig(config: unknown): config is DXConfigType {
		try {
			DXConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// If indicator type is DX, return DX-seriesName-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.DX) {
	// 		const DXConfig = indicatorKey.indicatorConfig as DXConfigType;
	// 		// Find seriesConfig with matching name
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${DXConfig.timePeriod} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
