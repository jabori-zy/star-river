import { z } from "zod";
import { SeriesType } from "@/types/chart";
import { IndicatorType, PriceSource } from "@/types/indicator";
import {
	type IndicatorConfig,
	parseKeyStrToMap,
	getIndicatorValues,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

const MACDConfigSchema = z.object({
	fastPeriod: z.number().int().positive(),
	slowPeriod: z.number().int().positive(),
	signalPeriod: z.number().int().positive(),
	priceSource: z.nativeEnum(PriceSource),
});

export type MACDConfigType = z.infer<typeof MACDConfigSchema>;

export const MACDConfig: IndicatorConfig<MACDConfigType> = {
	type: IndicatorType.MACD,
	displayName: "MACD",
	description: "指数平滑移动平均线收敛发散指标",
	params: {
		fastPeriod: {
			label: "快线周期",
			description: "选择快线的计算周期",
			defaultValue: 12,
			required: true,
		},
		slowPeriod: {
			label: "慢线周期",
			description: "选择慢线的计算周期",
			defaultValue: 26,
			required: true,
		},
		signalPeriod: {
			label: "信号周期",
			description: "选择信号线的计算周期",
			defaultValue: 9,
			required: true,
		},
		priceSource: {
			label: "价格源",
			description: "选择指标计算价格源",
			defaultValue: PriceSource.CLOSE,
			required: true,
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0 },
		macd: { label: "MACD", value: 0 },
		signal: { label: "Signal", value: 0 },
		histogram: { label: "Histogram", value: 0 },
	},
	chartConfig: {
		name: "MACD",
		isInMainChart: false,
		seriesConfigs: [
			{
				name: "MACD",
				type: SeriesType.LINE,
				color: "#FF6B6B",
				strokeThickness: 2,
				indicatorValueKey: "macd" as keyof IndicatorValueConfig,
			},
			{
				name: "Signal",
				type: SeriesType.LINE,
				color: "#4ECDC4",
				strokeThickness: 2,
				indicatorValueKey: "signal" as keyof IndicatorValueConfig,
			},
			{
				name: "Histogram",
				type: SeriesType.COLUMN,
				color: "#45B7D1",
				strokeThickness: 1,
				indicatorValueKey: "histogram" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MACDConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		// 使用 Zod 验证配置
		const validatedConfig = MACDConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr(
		indicatorType: IndicatorType,
		indicatorConfigStr: string,
	): MACDConfigType | undefined {
		try {
			console.log("indicatorConfigStr", indicatorConfigStr);
			const params = parseKeyStrToMap(indicatorConfigStr);
			// console.log("解析参数:", params);
			// console.log("指标类型:", indicatorType);

			if (indicatorType !== IndicatorType.MACD) {
				console.warn(
					`指标类型不匹配，期望: ${IndicatorType.MACD}, 实际: ${indicatorType}`,
				);
				return undefined;
			}

			// 构建配置对象
			const configCandidate = {
				fastPeriod: parseInt(params.get("fast_period") || "12"),
				slowPeriod: parseInt(params.get("slow_period") || "26"),
				signalPeriod: parseInt(params.get("signal_period") || "9"),
				priceSource: params.get("price_source") as PriceSource,
			};

			// 使用 Zod 验证配置
			const validatedConfig = MACDConfigSchema.parse(configCandidate);
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

	validateConfig(config: unknown): config is MACDConfigType {
		try {
			MACDConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
