import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorCategory, IndicatorType } from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

// TRANGE 指标配置的 Zod schema
const TRANGEConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
});

export type TRANGEConfigType = z.infer<typeof TRANGEConfigSchema>;

// TRANGE指标的参数映射函数
function buildTRANGEConfig(): unknown {
	return {
		timePeriod: 14,
	};
}

// TRANGE指标配置实现
export const TRANGEConfig: IndicatorConfig<TRANGEConfigType> = {
	category: IndicatorCategory.VOLATILITY,
	type: IndicatorType.TRANGE,
	displayName: "TRANGE",
	description: "True Range",
	params: {
		timePeriod: {
			label: "时间周期",
			legendShowName: "timePeriod",
			required: true,
			defaultValue: 14,
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		trange: { label: "trange", value: 0, legendShowName: "trange" },
	},
	chartConfig: {
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "trange",
				type: SeriesType.LINE,
				color: "#45B7D1",
				lineWidth: 2,
				indicatorValueKey: "trange" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): TRANGEConfigType {
		const config = {
			timePeriod: 14,
		};

		// 使用 Zod 验证配置
		const validatedConfig = TRANGEConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	// 使用通用解析函数
	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.TRANGE,
		TRANGEConfigSchema,
		buildTRANGEConfig,
	),

	validateConfig(config: unknown): config is TRANGEConfigType {
		try {
			TRANGEConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
