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

// BOP 指标配置的 Zod schema (无参数)
const BopConfigSchema = z.object({});

export type BopConfigType = z.infer<typeof BopConfigSchema>;

// BOP指标的参数映射函数 (无参数)
function buildBopConfig(): unknown {
	return {};
}

// BOP指标配置实现
export const BopConfig: IndicatorConfig<BopConfigType> = {
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
				strokeThickness: 2,
				indicatorValueKey: "bop" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): BopConfigType {
		// BOP指标无参数，返回空对象
		const validatedConfig = BopConfigSchema.parse({});
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.BOP,
		BopConfigSchema,
		buildBopConfig,
	),

	validateConfig(config: unknown): config is BopConfigType {
		try {
			BopConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	getSeriesName(
		seriesName: string,
		indicatorKey: IndicatorKey,
	): string | undefined {
		// 如果指标类型为BOP，则返回BOP-seriesName
		if (indicatorKey.indicatorType === IndicatorType.BOP) {
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
