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

// DX 指标配置的 Zod schema
const DxConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type DxConfigType = z.infer<typeof DxConfigSchema>;

// DX指标的参数映射函数
function buildDxConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: parseInt(params.get("time_period") || "0"),
	};
}

// DX指标配置实现
export const DxConfig: IndicatorConfig<DxConfigType> = {
	type: IndicatorType.DX,
	displayName: "DX",
	description: "Directional Movement Index",
	params: {
		timePeriod: {
			label: "周期",
			description: "选择DX指标的时间周期",
			defaultValue: 14,
			required: true,
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0 },
		dx: { label: "dx", value: 0 },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "dx",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "dx" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): DxConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = DxConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.DX,
		DxConfigSchema,
		buildDxConfig,
	),

	validateConfig(config: unknown): config is DxConfigType {
		try {
			DxConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},

	getSeriesName(
		seriesName: string,
		indicatorKey: IndicatorKey,
	): string | undefined {
		// 如果指标类型为DX，则返回DX-seriesName-timePeriod
		if (indicatorKey.indicatorType === IndicatorType.DX) {
			const dxConfig = indicatorKey.indicatorConfig as DxConfigType;
			// 找到名称相同的seriesConfig
			const seriseConfig = this.chartConfig.seriesConfigs.find(
				(config) => config.name === seriesName,
			);
			if (seriseConfig) {
				return `${indicatorKey.indicatorType} ${dxConfig.timePeriod} : ${seriseConfig.name}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
};
