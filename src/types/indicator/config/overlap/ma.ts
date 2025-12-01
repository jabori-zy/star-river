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

// MA 指标配置的 Zod schema
const MAConfigSchema = z.object({
	maType: MATypeSchema,
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type MAConfigType = z.infer<typeof MAConfigSchema>;

// MA指标的参数映射函数
function buildMAConfig(params: Map<string, string>): unknown {
	return {
		maType: params.get("ma_type") as MAType,
		timePeriod: parseInt(params.get("time_period") || "0"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

// MA指标配置实现
export const MAConfig: IndicatorConfig<MAConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.MA,
	displayName: "MA",
	description: "计算指定周期的移动平均线",
	params: {
		maType: {
			label: "indicator.configField.maType",
			description: "选择移动平均线的计算方式",
			defaultValue: MAType.SMA,
			required: true,
			legendShowName: "ma type",
		},
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "选择移动平均线的时间周期",
			defaultValue: 14,
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
		ma: { label: "ma", value: 0, legendShowName: "ma" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "MA",
				type: SeriesType.LINE,
				color: "#D6D618",
				lineWidth: 2,
				indicatorValueKey: "ma" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MAConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = MAConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MA,
		MAConfigSchema,
		buildMAConfig,
	),

	validateConfig(config: unknown): config is MAConfigType {
		try {
			MAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// 如果指标类型为MA，则返回MA-seriesName-maType-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.MA) {
	// 		const maConfig = indicatorKey.indicatorConfig as MAConfigType;
	// 		// 找到名称相同的seriesConfig
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${seriseConfig.name} ${maConfig.maType.toLowerCase()} ${maConfig.timePeriod} ${maConfig.priceSource.toLowerCase()}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
