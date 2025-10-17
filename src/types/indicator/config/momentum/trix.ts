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

// TRIX 指标配置的 Zod schema
const TRIXConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type TRIXConfigType = z.infer<typeof TRIXConfigSchema>;

// TRIX指标的参数映射函数
function buildTRIXConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// TRIX指标配置实现
export const TRIXConfig: IndicatorConfig<TRIXConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.TRIX,
	displayName: "TRIX",
	description: "1日变化率的三重平滑EMA指标",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择TRIX指标的时间周期",
			defaultValue: 30,
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
		trix: { label: "trix", value: 0, legendShowName: "trix" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "TRIX",
				type: SeriesType.LINE,
				color: "#673AB7",
				lineWidth: 2,
				indicatorValueKey: "trix" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): TRIXConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = TRIXConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.TRIX,
		TRIXConfigSchema,
		buildTRIXConfig,
	),

	validateConfig(config: unknown): config is TRIXConfigType {
		try {
			TRIXConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
