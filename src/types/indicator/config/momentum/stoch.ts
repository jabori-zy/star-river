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

// Zod schema for STOCH indicator configuration
const STOCHConfigSchema = z.object({
	fastKPeriod: z.number().int().positive(),
	slowKPeriod: z.number().int().positive(),
	slowKMaType: MATypeSchema,
	slowDPeriod: z.number().int().positive(),
	slowDMaType: MATypeSchema,
});

export type STOCHConfigType = z.infer<typeof STOCHConfigSchema>;

// Parameter mapping function for STOCH indicator
function buildSTOCHConfig(params: Map<string, string>): unknown {
	return {
		fastKPeriod: parseInt(params.get("fast_k_period") || "0"),
		slowKPeriod: parseInt(params.get("slow_k_period") || "0"),
		slowKMaType: params.get("slow_k_ma_type") as MAType,
		slowDPeriod: parseInt(params.get("slow_d_period") || "0"),
		slowDMaType: params.get("slow_d_ma_type") as MAType,
	};
}

// STOCH indicator configuration implementation
export const STOCHConfig: IndicatorConfig<STOCHConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.STOCH,
	displayName: "STOCH",
	description: "Stochastic Oscillator",
	params: {
		fastKPeriod: {
			label: "indicator.configField.fastKPeriod",
			description: "Select calculation period for fast K line",
			defaultValue: 5,
			required: true,
			legendShowName: "fast_k",
		},
		slowKPeriod: {
			label: "indicator.configField.slowKPeriod",
			description: "Select calculation period for slow K line",
			defaultValue: 3,
			required: true,
			legendShowName: "slow_k",
		},
		slowKMaType: {
			label: "indicator.configField.slowKMaType",
			description: "Select moving average type for slow K line",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "slow_k_ma",
		},
		slowDPeriod: {
			label: "indicator.configField.slowDPeriod",
			description: "Select calculation period for slow D line",
			defaultValue: 3,
			required: true,
			legendShowName: "slow_d",
		},
		slowDMaType: {
			label: "indicator.configField.slowDMaType",
			description: "Select moving average type for slow D line",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "slow_d_ma",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		slow_k: { label: "slow_k", value: 0, legendShowName: "slow_k" },
		slow_d: { label: "slow_d", value: 0, legendShowName: "slow_d" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "Slow K",
				type: SeriesType.LINE,
				color: "#2196F3",
				lineWidth: 2,
				indicatorValueKey: "slow_k" as keyof IndicatorValueConfig,
			},
			{
				name: "Slow D",
				type: SeriesType.LINE,
				color: "#F44336",
				lineWidth: 2,
				indicatorValueKey: "slow_d" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): STOCHConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = STOCHConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.STOCH,
		STOCHConfigSchema,
		buildSTOCHConfig,
	),

	validateConfig(config: unknown): config is STOCHConfigType {
		try {
			STOCHConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
