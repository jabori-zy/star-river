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

// MOM 指标配置的 Zod schema
const MOMConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type MOMConfigType = z.infer<typeof MOMConfigSchema>;

// MOM指标的参数映射函数
function buildMOMConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// MOM指标配置实现
export const MOMConfig: IndicatorConfig<MOMConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.MOM,
	displayName: "MOM",
	description: "动量指标",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择动量指标的时间周期",
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
		mom: { label: "mom", value: 0, legendShowName: "mom" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "MOM",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "mom" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MOMConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = MOMConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MOM,
		MOMConfigSchema,
		buildMOMConfig,
	),

	validateConfig(config: unknown): config is MOMConfigType {
		try {
			MOMConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
