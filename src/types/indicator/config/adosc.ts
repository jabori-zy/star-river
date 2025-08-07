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
const ADOSCConfigSchema = z.object({
	fastPeriod: z.number().int().positive(),
	slowPeriod: z.number().int().positive(),
});

export type ADOSCConfigType = z.infer<typeof ADOSCConfigSchema>;

// AD指标的参数映射函数
function buildADOSCConfig(params: Map<string, string>): unknown {
	return {
		fastPeriod: parseInt(params.get("fast_period") || "12"),
		slowPeriod: parseInt(params.get("slow_period") || "26"),
	};
}

// AD指标配置实现
export const ADOSCConfig: IndicatorConfig<ADOSCConfigType> = {
	type: IndicatorType.ADOSC,
	displayName: "ADOSC",
	description: "Accumulation/Distribution Oscillator",
	params: {
		fastPeriod: {
			label: "快线周期",
			description: "选择快线的计算周期",
			defaultValue: 12,
			required: true,
			legendShowName: "fast",
		},
		slowPeriod: {
			label: "慢线周期",
			description: "选择慢线的计算周期",
			defaultValue: 26,
			required: true,
			legendShowName: "slow",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		adosc: { label: "adosc", value: 0, legendShowName: "ad osc" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "adosc",
				type: SeriesType.LINE,
				series: LineSeries,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "adosc" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): ADOSCConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = ADOSCConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.ADOSC,
		ADOSCConfigSchema,
		buildADOSCConfig,
	),

	validateConfig(config: unknown): config is ADOSCConfigType {
		try {
			ADOSCConfigSchema.parse(config);
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
		if (indicatorKey.indicatorType === IndicatorType.ADOSC) {
			const adoscConfig = indicatorKey.indicatorConfig as ADOSCConfigType;
			// 找到名称相同的seriesConfig
			const seriseConfig = this.chartConfig.seriesConfigs.find(
				(config) => config.name === seriesName,
			);
			if (seriseConfig) {
				return `${indicatorKey.indicatorType} ${adoscConfig.fastPeriod} ${adoscConfig.slowPeriod} : ${seriseConfig.name}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
};
