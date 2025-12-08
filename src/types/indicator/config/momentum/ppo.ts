import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	MAType,
	PriceSource,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	MATypeSchema,
	PriceSourceSchema,
} from "@/types/indicator/schemas";

// Zod schema for PPO indicator configuration
const PPOConfigSchema = z.object({
	fastPeriod: z.number().int().positive(),
	slowPeriod: z.number().int().positive(),
	maType: MATypeSchema,
	priceSource: PriceSourceSchema,
});

export type PPOConfigType = z.infer<typeof PPOConfigSchema>;

// Parameter mapping function for PPO indicator
function buildPPOConfig(params: Map<string, string>): unknown {
	return {
		fastPeriod: parseInt(params.get("fast_period") || "0"),
		slowPeriod: parseInt(params.get("slow_period") || "0"),
		maType: params.get("ma_type") as MAType,
		priceSource: params.get("price_source") as PriceSource,
	};
}

// PPO indicator configuration implementation
export const PPOConfig: IndicatorConfig<PPOConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.PPO,
	displayName: "PPO",
	description: "Percentage Price Oscillator",
	params: {
		maType: {
			label: "indicator.configField.maType",
			description: "Select moving average calculation method",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "ma type",
		},
		fastPeriod: {
			label: "indicator.configField.fastPeriod",
			description: "Select calculation period for fast line",
			defaultValue: 12,
			required: true,
			legendShowName: "fast",
		},
		slowPeriod: {
			label: "indicator.configField.slowPeriod",
			description: "Select calculation period for slow line",
			defaultValue: 26,
			required: true,
			legendShowName: "slow",
		},
		priceSource: {
			label: "indicator.configField.dataSource",
			description: "Select price source for indicator calculation",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		ppo: { label: "ppo", value: 0, legendShowName: "ppo" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "PPO",
				type: SeriesType.LINE,
				color: "#9C27B0",
				lineWidth: 2,
				indicatorValueKey: "ppo" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): PPOConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// Validate configuration using Zod
		const validatedConfig = PPOConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// Use generic parsing function
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.PPO,
		PPOConfigSchema,
		buildPPOConfig,
	),

	validateConfig(config: unknown): config is PPOConfigType {
		try {
			PPOConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
