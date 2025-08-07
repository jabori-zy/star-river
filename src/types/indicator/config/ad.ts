import { LineSeries } from "lightweight-charts";
import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKey } from "@/types/symbol-key";

// MA 指标配置的 Zod schema
const ADConfigSchema = z.object({}); // 没有参数

export type ADConfigType = z.infer<typeof ADConfigSchema>;

// AD指标的参数映射函数
function buildADConfig(): unknown {
	return {};
}

// AD指标配置实现
export const ADConfig: IndicatorConfig<ADConfigType> = {
	type: IndicatorType.AD,
	displayName: "AD",
	description: "Accumulation/Distribution",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		ad: { label: "ad", value: 0, legendShowName: "ad" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "ad",
				type: SeriesType.LINE,
				series: LineSeries,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "ad" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ADConfigType {
		const config = {};

		// 使用 Zod 验证配置
		const validatedConfig = ADConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.AD,
		ADConfigSchema,
		buildADConfig,
	),

	validateConfig(config: unknown): config is ADConfigType {
		try {
			ADConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	getSeriesName(
		seriesName: string,
		indicatorKey: IndicatorKey,
	): string | undefined {
		// 如果指标类型为AD，则返回AD-seriesName
		if (indicatorKey.indicatorType === IndicatorType.AD) {
			// const adConfig = indicatorKey.indicatorConfig as ADConfigType;
			// 找到名称相同的seriesConfig
			const seriseConfig = this.chartConfig.seriesConfigs.find(
				(config) => config.name === seriesName,
			);
			if (seriseConfig) {
				return `${indicatorKey.indicatorType} : ${seriseConfig.name}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
};
