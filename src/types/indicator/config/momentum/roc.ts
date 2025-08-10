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

// ROC 指标配置的 Zod schema
const ROCConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type ROCConfigType = z.infer<typeof ROCConfigSchema>;

// ROC指标的参数映射函数
function buildROCConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// ROC指标配置实现
export const ROCConfig: IndicatorConfig<ROCConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ROC,
	displayName: "ROC",
	description: "变化率指标 - ((price/prevPrice)-1)*100",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择变化率指标的时间周期",
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
		roc: { label: "roc", value: 0, legendShowName: "roc" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ROC",
				type: SeriesType.LINE,
				color: "#FF9800",
				lineWidth: 2,
				indicatorValueKey: "roc" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ROCConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = ROCConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ROC,
		ROCConfigSchema,
		buildROCConfig,
	),

	validateConfig(config: unknown): config is ROCConfigType {
		try {
			ROCConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};