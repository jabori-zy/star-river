import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	PriceSource,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	PriceSourceSchema,
} from "@/types/indicator/schemas";

// ROCR 指标配置的 Zod schema
const ROCRConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type ROCRConfigType = z.infer<typeof ROCRConfigSchema>;

// ROCR指标的参数映射函数
function buildROCRConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// ROCR指标配置实现
export const ROCRConfig: IndicatorConfig<ROCRConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ROCR,
	displayName: "ROCR",
	description: "变化率比率指标 - (price/prevPrice)",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择变化率比率指标的时间周期",
			defaultValue: 10,
			required: true,
			legendShowName: "period",
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
		rocr: { label: "rocr", value: 0, legendShowName: "rocr" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ROCR",
				type: SeriesType.LINE,
				color: "#795548",
				lineWidth: 2,
				indicatorValueKey: "rocr" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ROCRConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = ROCRConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ROCR,
		ROCRConfigSchema,
		buildROCRConfig,
	),

	validateConfig(config: unknown): config is ROCRConfigType {
		try {
			ROCRConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};