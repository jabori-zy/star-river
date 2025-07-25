import { IndicatorType, MAType, PriceSource } from "./index";
import { IndicatorChartConfig, SeriesType } from "../chart";
import { IndicatorValue } from "./indicator-value";
import { z } from "zod";

// Zod schemas for enum validation
const MATypeSchema = z.nativeEnum(MAType);
const PriceSourceSchema = z.nativeEnum(PriceSource);
const IndicatorTypeSchema = z.nativeEnum(IndicatorType);

// 指标参数的 Zod schema
const IndicatorParamSchema = z.object({
	label: z.string(),
	description: z.string().optional(),
	required: z.boolean(),
	defaultValue: z.union([
		z.number(),
		z.string(),
		MATypeSchema,
		PriceSourceSchema,
	]),
});

// 指标值配置的 Zod schema
const IndicatorValueConfigSchema = z.record(
	z.string(),
	z.object({
		label: z.string(),
		value: z.number(),
	}),
);

// 从 Zod schema 推导类型
type IndicatorParam = z.infer<typeof IndicatorParamSchema>;
type IndicatorValueConfig = z.infer<typeof IndicatorValueConfigSchema>;

// 基础指标配置接口
interface BaseIndicatorConfig {
	type: IndicatorType;
	displayName: string;
	description?: string;
	chartConfig: IndicatorChartConfig;
	indicatorValue: IndicatorValueConfig;
	getValue(): Record<string, number>;
}

// 通用指标配置接口
interface IndicatorConfig<
	T extends Record<string, unknown> = Record<string, unknown>,
> extends BaseIndicatorConfig {
	params: {
		[K in keyof T]-?: IndicatorParam;
	};
	getConfig(): T;
	parseIndicatorConfigFromKeyStr(
		indicatorType: IndicatorType,
		indicatorConfigStr: string,
	): T | undefined;
	validateConfig(config: unknown): config is T;
}

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
			label: "移动平均类型",
			description: "选择移动平均线的计算方式",
			defaultValue: MAType.SMA,
			required: true,
		},
		timePeriod: {
			label: "时间周期",
			description: "选择移动平均线的时间周期",
			defaultValue: 14,
			required: true,
		},
		priceSource: {
			label: "价格来源",
			description: "选择移动平均线的价格来源",
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

// 解析键字符串为参数映射
function parseKeyStrToMap(keyStr: string): Map<string, string> {
	const paramStr = keyStr.match(/\((.*?)\)/)?.[1] || "";
	const params = new Map<string, string>();

	if (!paramStr) {
		console.warn("未找到参数字符串");
		return params;
	}

	paramStr.split(",").forEach((param) => {
		const [key, value] = param.split("=");
		if (key && value) {
			params.set(key.trim(), value.trim());
		}
	});

	return params;
}

// 配置映射，支持部分指标类型
const INDICATOR_CONFIG_MAP: Partial<Record<IndicatorType, IndicatorConfig>> = {
	[IndicatorType.MA]: MAConfig,
	// TODO: 添加其他指标配置
	// [IndicatorType.SMA]: SMAConfig,
	// [IndicatorType.EMA]: EMAConfig,
	// [IndicatorType.BBANDS]: BBandsConfig,
	// [IndicatorType.MACD]: MACDConfig,
};

/**
 * 根据指标类型和配置字符串解析指标配置
 * @param indicatorType 指标类型
 * @param indicatorConfigStr 指标配置字符串
 * @returns 解析后的配置对象，如果不支持或验证失败则返回 undefined
 */
export function parseIndicatorConfigNew(
	indicatorType: IndicatorType,
	indicatorConfigStr: string,
): Record<string, unknown> | undefined {
	try {
		// 验证指标类型
		const validatedType = IndicatorTypeSchema.parse(indicatorType);

		const config = INDICATOR_CONFIG_MAP[validatedType];
		console.log("找到配置:", !!config);

		if (!config) {
			console.warn(`不支持的指标类型: ${validatedType}`);
			return undefined;
		}

		const parsedConfig = config.parseIndicatorConfigFromKeyStr(
			validatedType,
			indicatorConfigStr,
		);

		if (!parsedConfig) {
			console.error("配置解析失败");
			return undefined;
		}

		// 验证解析结果
		if (!config.validateConfig(parsedConfig)) {
			console.error("配置验证失败");
			return undefined;
		}

		return parsedConfig as Record<string, unknown>;
	} catch (error) {
		console.error("解析指标配置时发生错误:", error);
		if (error instanceof z.ZodError) {
			console.error("Zod 验证错误:", error.errors);
		}
		return undefined;
	}
}

/**
 * 获取指标配置实例
 * @param indicatorType 指标类型
 * @returns 指标配置实例，如果不支持则返回 undefined
 */
export function getIndicatorConfig(
	indicatorType: IndicatorType,
): IndicatorConfig | undefined {
	try {
		const validatedType = IndicatorTypeSchema.parse(indicatorType);
		return INDICATOR_CONFIG_MAP[validatedType];
	} catch (error) {
		console.error("获取指标配置时发生错误:", error);
		return undefined;
	}
}

// 导出类型定义和 schema
export type {
	IndicatorConfig,
	IndicatorParam,
	IndicatorValueConfig,
	MAConfigType,
};
export {
	MAConfigSchema,
	IndicatorParamSchema,
	IndicatorValueConfigSchema,
	IndicatorTypeSchema,
};
