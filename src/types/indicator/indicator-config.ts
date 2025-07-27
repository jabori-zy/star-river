import { z } from "zod";
import type { IndicatorKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import type { IndicatorChartConfig } from "../chart";
import { IndicatorType } from "./index";
import {
	type IndicatorParam,
	IndicatorTypeSchema,
	type IndicatorValueConfig,
} from "./schemas";

// 基础指标配置接口
export interface BaseIndicatorConfig {
	type: IndicatorType;
	displayName: string;
	description?: string;
	chartConfig: IndicatorChartConfig;
	indicatorValueConfig: IndicatorValueConfig;
	getValue(): Record<string, number>;
	getSeriesName(seriesName: string, indicatorKey: IndicatorKey): string | undefined;
}

// 默认的getValue实现工具函数
export function getIndicatorValues(
	indicatorValueConfig: IndicatorValueConfig,
): Record<string, number> {
	return Object.fromEntries(
		Object.entries(indicatorValueConfig).map(([key, value]) => [
			key,
			value.value,
		]),
	);
}

// 通用的指标配置解析函数
export function createParseIndicatorConfigFromKeyStr<T>(
	expectedType: IndicatorType,
	schema: z.ZodSchema<T>,
	configBuilder: (params: Map<string, string>) => unknown,
): (indicatorType: IndicatorType, indicatorConfigStr: string) => T | undefined {
	return function parseIndicatorConfigFromKeyStr(
		indicatorType: IndicatorType,
		indicatorConfigStr: string,
	): T | undefined {
		try {
			console.log("indicatorConfigStr", indicatorConfigStr);
			const params = parseKeyStrToMap(indicatorConfigStr);

			if (indicatorType !== expectedType) {
				console.warn(
					`指标类型不匹配，期望: ${expectedType}, 实际: ${indicatorType}`,
				);
				return undefined;
			}

			// 使用传入的configBuilder构建配置对象
			const configCandidate = configBuilder(params);

			// 使用传入的schema验证配置
			const validatedConfig = schema.parse(configCandidate);
			// console.log("验证通过的配置:", validatedConfig);

			return validatedConfig;
		} catch (error) {
			console.error("解析指标配置失败:", error);
			if (error instanceof z.ZodError) {
				console.error("验证错误详情:", error.errors);
			}
			return undefined;
		}
	};
}

// 通用指标配置接口
export interface IndicatorConfig<
	T extends Record<string, unknown> = Record<string, unknown>,
> extends BaseIndicatorConfig {
	params: {
		[K in keyof T]-?: IndicatorParam;
	};
	getDefaultConfig(): T; // 获取默认配置
	parseIndicatorConfigFromKeyStr(
		indicatorType: IndicatorType,
		indicatorConfigStr: string,
	): T | undefined;
	validateConfig(config: unknown): config is T;
}

// 解析键字符串为参数映射
export function parseKeyStrToMap(keyStr: string): Map<string, string> {
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

// 导入各个指标配置
import { MAConfig } from "./config/ma";
import { MACDConfig } from "./config/macd";
import { RSIConfig } from "./config/rsi";
import { BBandsConfig } from "./config/bbands";

// 配置映射，支持部分指标类型
export const INDICATOR_CONFIG_MAP: Partial<
	Record<IndicatorType, IndicatorConfig>
> = {
	[IndicatorType.MA]: MAConfig,
	[IndicatorType.MACD]: MACDConfig,
	[IndicatorType.RSI]: RSIConfig,
	[IndicatorType.BBANDS]: BBandsConfig,
	// TODO: 添加其他指标配置
	// [IndicatorType.SMA]: SMAConfig,
	// [IndicatorType.EMA]: EMAConfig,
	// [IndicatorType.BBANDS]: BBandsConfig,
};

/**
 * 根据指标类型和配置字符串解析指标配置
 * @param indicatorType 指标类型
 * @param indicatorConfigStr 指标配置字符串
 * @returns 解析后的配置对象，如果不支持或验证失败则返回 undefined
 */
export function parseIndicatorConfig(
	indicatorType: IndicatorType,
	indicatorConfigStr: string,
): Record<string, unknown> | undefined {
	try {
		// 验证指标类型
		const validatedType = IndicatorTypeSchema.parse(indicatorType);

		const config = INDICATOR_CONFIG_MAP[validatedType];

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

export function getIndicatorDisplayName(indicatorType: IndicatorType): string {
	const config = getIndicatorConfig(indicatorType);
	return config?.displayName || "";
}

export function getIndciatorChartConfigFromKeyStr(
	keyStr: string,
): IndicatorChartConfig | undefined {
	const indicatorKey = parseKey(keyStr) as IndicatorKey;
	if (!indicatorKey) return undefined;
	const indicatorType = indicatorKey.indicatorType;
	const config = getIndicatorConfig(indicatorType);
	if (!config) return undefined;
	return config.chartConfig;
}

export function getIndicatorSeriesName(seriesName: string,indicatorKey: IndicatorKey): string | undefined {
	const config = getIndicatorConfig(indicatorKey.indicatorType);
	if (!config) return undefined;
	return config.getSeriesName(seriesName, indicatorKey);
}
