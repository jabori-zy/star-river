import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// DX 指标配置的 Zod schema
const DXConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type DXConfigType = z.infer<typeof DXConfigSchema>;

// DX指标的参数映射函数
function buildDXConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// DX指标配置实现
export const DXConfig: IndicatorConfig<DXConfigType> = {
	category: IndicatorCategory.MOMENTUM,
	type: IndicatorType.DX,
	displayName: "DX",
	description: "Directional Movement Index",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择DX指标的时间周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		dx: { label: "dx", value: 0, legendShowName: "dx" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "dx",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				lineWidth: 2,
				indicatorValueKey: "dx" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): DXConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = DXConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.DX,
		DXConfigSchema,
		buildDXConfig,
	),

	validateConfig(config: unknown): config is DXConfigType {
		try {
			DXConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined {
	// 	// 如果指标类型为DX，则返回DX-seriesName-timePeriod
	// 	if (indicatorKey.indicatorType === IndicatorType.DX) {
	// 		const DXConfig = indicatorKey.indicatorConfig as DXConfigType;
	// 		// 找到名称相同的seriesConfig
	// 		const seriseConfig = this.chartConfig.seriesConfigs.find(
	// 			(config) => config.name === seriesName,
	// 		);
	// 		if (seriseConfig) {
	// 			return `${indicatorKey.indicatorType} ${DXConfig.timePeriod} : ${seriseConfig.name}`;
	// 		} else {
	// 			return undefined;
	// 		}
	// 	} else {
	// 		return undefined;
	// 	}
	// },
};
