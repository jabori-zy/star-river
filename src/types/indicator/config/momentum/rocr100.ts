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

// ROCR100 指标配置的 Zod schema
const ROCR100ConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type ROCR100ConfigType = z.infer<typeof ROCR100ConfigSchema>;

// ROCR100指标的参数映射函数
function buildROCR100Config(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// ROCR100指标配置实现
export const ROCR100Config: IndicatorConfig<ROCR100ConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ROCR100,
	displayName: "ROCR100",
	description: "变化率比率100比例指标 - (price/prevPrice)*100",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择变化率比率100比例指标的时间周期",
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
		rocr100: { label: "rocr100", value: 0, legendShowName: "rocr100" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ROCR100",
				type: SeriesType.LINE,
				color: "#607D8B",
				lineWidth: 2,
				indicatorValueKey: "rocr100" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ROCR100ConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = ROCR100ConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ROCR100,
		ROCR100ConfigSchema,
		buildROCR100Config,
	),

	validateConfig(config: unknown): config is ROCR100ConfigType {
		try {
			ROCR100ConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};