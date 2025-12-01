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

// ROCP 指标配置的 Zod schema
const ROCPConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type ROCPConfigType = z.infer<typeof ROCPConfigSchema>;

// ROCP指标的参数映射函数
function buildROCPConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// ROCP指标配置实现
export const ROCPConfig: IndicatorConfig<ROCPConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.ROCP,
	displayName: "ROCP",
	description: "变化率百分比指标 - (price-prevPrice)/prevPrice",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "选择变化率百分比指标的时间周期",
			defaultValue: 10,
			required: true,
			legendShowName: "period",
		},
		priceSource: {
			label: "indicator.configField.dataSource",
			description: "选择指标计算价格源",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		rocp: { label: "rocp", value: 0, legendShowName: "rocp" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ROCP",
				type: SeriesType.LINE,
				color: "#FF5722",
				lineWidth: 2,
				indicatorValueKey: "rocp" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ROCPConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = ROCPConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ROCP,
		ROCPConfigSchema,
		buildROCPConfig,
	),

	validateConfig(config: unknown): config is ROCPConfigType {
		try {
			ROCPConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
