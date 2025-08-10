import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// BOP 指标配置的 Zod schema (无参数)
const BOPConfigSchema = z.object({});

export type BOPConfigType = z.infer<typeof BOPConfigSchema>;

// BOP指标的参数映射函数 (无参数)
function buildBOPConfig(): unknown {
	return {};
}

// BOP指标配置实现
export const BOPConfig: IndicatorConfig<BOPConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.BOP,
	displayName: "BOP",
	description: "Balance Of Power",
	params: {},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		bop: { label: "bop", value: 0, legendShowName: "bop" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "bop",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "bop" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): BOPConfigType {
		// BOP指标无参数，返回空对象
		const validatedConfig = BOPConfigSchema.parse({});
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.BOP,
		BOPConfigSchema,
		buildBOPConfig,
	),

	validateConfig(config: unknown): config is BOPConfigType {
		try {
			BOPConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// 如果指标类型为BOP，则返回BOP-seriesName
	// 	if (indicatorKey.indicatorType === IndicatorType.BOP) {
	// 		// 找到名称相同的seriesConfig
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
