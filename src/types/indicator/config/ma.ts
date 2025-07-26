import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorType, MAType, PriceSource } from "@/types/indicator";
import {
	type IndicatorConfig,
	parseKeyStrToMap,
} from "@/types/indicator/indicator-config-new";
import type { IndicatorValue } from "@/types/indicator/indicator-value";
import { MATypeSchema, PriceSourceSchema } from "@/types/indicator/schemas";

// MA 指标配置的 Zod schema
const MAConfigSchema = z.object({
	maType: MATypeSchema,
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

type MAConfigType = z.infer<typeof MAConfigSchema>;

// MA指标配置实现
export const MAConfig: IndicatorConfig<MAConfigType> = {
	type: IndicatorType.MA,
	displayName: "移动平均线",
	description: "计算指定周期的移动平均线",
	params: {
		maType: {
			label: "MA类型",
			description: "选择移动平均线的计算方式",
			defaultValue: MAType.SMA,
			required: true,
		},
		timePeriod: {
			label: "周期",
			description: "选择移动平均线的时间周期",
			defaultValue: 14,
			required: true,
		},
		priceSource: {
			label: "价格源",
			description: "选择指标计算价格源",
			defaultValue: PriceSource.CLOSE,
			required: true,
		},
	},
	indicatorValue: {
		timestamp: { label: "timestamp", value: 0 },
		ma: { label: "ma", value: 0 },
	},
	chartConfig: {
		name: "MA",
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "MA",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "ma" as keyof IndicatorValue,
			},
		],
	},

	getConfig(): MAConfigType {
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
		const result = Object.fromEntries(
			Object.entries(this.indicatorValue).map(([key, value]) => [
				key,
				value.value,
			]),
		);
		return result;
	},

	parseIndicatorConfigFromKeyStr(
		indicatorType: IndicatorType,
		indicatorConfigStr: string,
	): MAConfigType | undefined {
		try {
			console.log("indicatorConfigStr", indicatorConfigStr);
			const params = parseKeyStrToMap(indicatorConfigStr);
			console.log("解析参数:", params);
			console.log("指标类型:", indicatorType);

			if (indicatorType !== IndicatorType.MA) {
				console.warn(
					`指标类型不匹配，期望: ${IndicatorType.MA}, 实际: ${indicatorType}`,
				);
				return undefined;
			}

			// 构建配置对象
			const configCandidate = {
				maType: params.get("ma_type") as MAType,
				timePeriod: parseInt(params.get("time_period") || "0"),
				priceSource: params.get("price_source") as PriceSource,
			};

			// 使用 Zod 验证配置
			const validatedConfig = MAConfigSchema.parse(configCandidate);
			console.log("验证通过的配置:", validatedConfig);

			return validatedConfig;
		} catch (error) {
			console.error("解析指标配置失败:", error);
			if (error instanceof z.ZodError) {
				console.error("验证错误详情:", error.errors);
			}
			return undefined;
		}
	},

	validateConfig(config: unknown): config is MAConfigType {
		try {
			MAConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
