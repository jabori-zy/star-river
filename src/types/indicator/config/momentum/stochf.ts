import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType, MAType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	MATypeSchema,
} from "@/types/indicator/schemas";

// Zod schema for STOCHF indicator configuration
const STOCHFConfigSchema = z.object({
	fastKPeriod: z.number().int().positive(),
	fastDPeriod: z.number().int().positive(),
	fastDMaType: MATypeSchema,
});

export type STOCHFConfigType = z.infer<typeof STOCHFConfigSchema>;

// Parameter mapping function for STOCHF indicator
function buildSTOCHFConfig(params: Map<string, string>): unknown {
	return {
		fastKPeriod: parseInt(params.get("fast_k_period") || "0"),
		fastDPeriod: parseInt(params.get("fast_d_period") || "0"),
		fastDMaType: params.get("fast_d_ma_type") as MAType,
	};
}

// STOCHF indicator configuration implementation
export const STOCHFConfig: IndicatorConfig<STOCHFConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.STOCHF,
	displayName: "STOCHF",
	description: "Stochastic Fast",
	params: {
		fastKPeriod: {
			label: "indicator.configField.fastKPeriod",
			description: "Select calculation period for fast K line",
			defaultValue: 5,
			required: true,
			legendShowName: "fast_k",
		},
		fastDPeriod: {
			label: "indicator.configField.fastDPeriod",
			description: "Select calculation period for fast D line",
			defaultValue: 3,
			required: true,
			legendShowName: "fast_d",
		},
		fastDMaType: {
			label: "indicator.configField.fastDMaType",
			description: "Select moving average type for fast D line",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "fast_d_ma",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		fast_k: { label: "fast_k", value: 0, legendShowName: "fast_k" },
		fast_d: { label: "fast_d", value: 0, legendShowName: "fast_d" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "Fast K",
				type: SeriesType.LINE,
				color: "#00BCD4",
				lineWidth: 2,
				indicatorValueKey: "fast_k" as keyof IndicatorValueConfig,
			},
			{
				name: "Fast D",
				type: SeriesType.LINE,
				color: "#E91E63",
				lineWidth: 2,
				indicatorValueKey: "fast_d" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): STOCHFConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = STOCHFConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.STOCHF,
		STOCHFConfigSchema,
		buildSTOCHFConfig,
	),

	validateConfig(config: unknown): config is STOCHFConfigType {
		try {
			STOCHFConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
