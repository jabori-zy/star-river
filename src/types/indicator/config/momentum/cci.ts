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

// CCI 指标配置的 Zod schema
const CciConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type CciConfigType = z.infer<typeof CciConfigSchema>;

// CCI指标的参数映射函数
function buildCciConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// CCI指标配置实现
export const CciConfig: IndicatorConfig<CciConfigType> = {
	type: IndicatorType.CCI,
	displayName: "CCI",
	description: "Commodity Channel Index",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择CCI指标的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		cci: { label: "cci", value: 0, legendShowName: "cci" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "cci",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "cci" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): CciConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = CciConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.CCI,
		CciConfigSchema,
		buildCciConfig,
	),

	validateConfig(config: unknown): config is CciConfigType {
		try {
			CciConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	getSeriesName(
		seriesName: string,
		indicatorKey: IndicatorKey,
	): string | undefined {
		// 如果指标类型为CCI，则返回CCI-seriesName-timePeriod
		if (indicatorKey.indicatorType === IndicatorType.CCI) {
			const cciConfig = indicatorKey.indicatorConfig as CciConfigType;
			// 找到名称相同的seriesConfig
			const seriseConfig = this.chartConfig.seriesConfigs.find(
				(config) => config.name === seriesName,
			);
			if (seriseConfig) {
				return `${indicatorKey.indicatorType} ${cciConfig.timePeriod} : ${seriseConfig.name}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
};
