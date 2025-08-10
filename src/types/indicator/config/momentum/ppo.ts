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

// PPO 指标配置的 Zod schema
const PPOConfigSchema = z.object({
	fastPeriod: z.number().int().positive(),
	slowPeriod: z.number().int().positive(),
	maType: MATypeSchema,
	priceSource: PriceSourceSchema,
});

export type PPOConfigType = z.infer<typeof PPOConfigSchema>;

// PPO指标的参数映射函数
function buildPPOConfig(params: Map<string, string>): unknown {
	return {
		fastPeriod: parseInt(params.get("fast_period") || "0"),
		slowPeriod: parseInt(params.get("slow_period") || "0"),
		maType: params.get("ma_type") as MAType,
		priceSource: params.get("price_source") as PriceSource,
	};
}

// PPO指标配置实现
export const PPOConfig: IndicatorConfig<PPOConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.PPO,
	displayName: "PPO",
	description: "百分比价格振荡器",
	params: {
		maType: {
			label: "MA类型",
			description: "选择移动平均线的计算方式",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "ma type",
		},
		fastPeriod: {
			label: "快线周期",
			description: "选择快线的计算周期",
			defaultValue: 12,
			required: true,
			legendShowName: "fast",
		},
		slowPeriod: {
			label: "慢线周期",
			description: "选择慢线的计算周期",
			defaultValue: 26,
			required: true,
			legendShowName: "slow",
		},
		priceSource: {
			label: "价格源",
			description: "选择指标计算价格源",
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

		// 使用 Zod 验证配置
		const validatedConfig = PPOConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
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