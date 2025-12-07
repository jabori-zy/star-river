import { z } from "zod";
import type { IndicatorKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import type { IndicatorChartBaseConfig } from "../chart";
import type { IndicatorCategory, IndicatorType } from "./index";
import { INDICATOR_CONFIG_MAP } from "./indicator-config-map";
import {
	type IndicatorParam,
	IndicatorTypeSchema,
	type IndicatorValueConfig,
} from "./schemas";

// Base indicator configuration interface
export interface BaseIndicatorConfig {
	category: IndicatorCategory;
	type: IndicatorType;
	displayName: string;
	description?: string;
	chartConfig: IndicatorChartBaseConfig;
	indicatorValueConfig: IndicatorValueConfig;
	getValue(): Record<keyof IndicatorValueConfig, number>; // Get indicator value
	// getSeriesName(
	// 	seriesName: string,
	// 	indicatorKey: IndicatorKey,
	// ): string | undefined;
}

// Default getValue implementation utility function
export function getIndicatorValues(
	indicatorValueConfig: IndicatorValueConfig,
): Record<keyof IndicatorValueConfig, number> {
	return Object.fromEntries(
		Object.entries(indicatorValueConfig).map(([key, value]) => [
			key,
			value.value,
		]),
	);
}

// Generic indicator configuration parsing function
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
			const params = parseKeyStrToMap(indicatorConfigStr);

			if (indicatorType !== expectedType) {
				console.warn(
					`Indicator type mismatch, expected: ${expectedType}, actual: ${indicatorType}`,
				);
				return undefined;
			}

			// Build configuration object using the passed configBuilder
			const configCandidate = configBuilder(params);

			// Validate configuration using the passed schema
			const validatedConfig = schema.parse(configCandidate);
			// console.log("Validated configuration:", validatedConfig);

			return validatedConfig;
		} catch (error) {
			console.error("Failed to parse indicator configuration:", error);
			if (error instanceof z.ZodError) {
				console.error("Validation error details:", error.errors);
			}
			return undefined;
		}
	};
}

// Generic indicator configuration interface
export interface IndicatorConfig<
	T extends Record<string, unknown> = Record<string, unknown>,
> extends BaseIndicatorConfig {
	params: {
		[K in keyof T]-?: IndicatorParam;
	};
	getDefaultConfig(): T; // Get default configuration
	parseIndicatorConfigFromKeyStr(
		indicatorType: IndicatorType,
		indicatorConfigStr: string,
	): T | undefined;
	validateConfig(config: unknown): config is T;
}

// Parse key string to parameter map
export function parseKeyStrToMap(keyStr: string): Map<string, string> {
	const paramStr = keyStr.match(/\((.*?)\)/)?.[1] || "";
	const params = new Map<string, string>();
	// Return empty Map when no parameters
	if (!paramStr) {
		return params;
	}

	paramStr.split(" ").forEach((param) => {
		const [key, value] = param.split("=");
		if (key && value) {
			params.set(key.trim(), value.trim());
		}
	});

	return params;
}

/**
 * Parse indicator configuration based on indicator type and configuration string
 * @param indicatorType Indicator type
 * @param indicatorConfigStr Indicator configuration string
 * @returns Parsed configuration object, returns undefined if not supported or validation fails
 */
export function parseIndicatorConfig(
	indicatorType: IndicatorType,
	indicatorConfigStr: string,
): Record<string, unknown> | undefined {
	try {
		// Validate indicator type
		const validatedType = IndicatorTypeSchema.parse(indicatorType);

		const config = INDICATOR_CONFIG_MAP[validatedType];

		if (!config) {
			console.warn(`Unsupported indicator type: ${validatedType}`);
			return undefined;
		}

		const parsedConfig = config.parseIndicatorConfigFromKeyStr(
			validatedType,
			indicatorConfigStr,
		);

		if (!parsedConfig) {
			console.error("Configuration parsing failed");
			return undefined;
		}

		// Validate parsing result
		if (!config.validateConfig(parsedConfig)) {
			console.error("Configuration validation failed");
			return undefined;
		}

		return parsedConfig as Record<string, unknown>;
	} catch (error) {
		console.error("Error occurred while parsing indicator configuration:", error);
		return undefined;
	}
}

/**
 * Get indicator configuration instance
 * @param indicatorType Indicator type
 * @returns Indicator configuration instance, returns undefined if not supported
 */
export function getIndicatorConfig(
	indicatorType: IndicatorType,
): IndicatorConfig | undefined {
	try {
		const validatedType = IndicatorTypeSchema.parse(indicatorType);
		return INDICATOR_CONFIG_MAP[validatedType];
	} catch (error) {
		console.error("Error occurred while getting indicator configuration:", error);
		return undefined;
	}
}

export function getIndicatorDisplayName(indicatorType: IndicatorType): string {
	const config = getIndicatorConfig(indicatorType);
	return config?.displayName || "";
}

export function getIndciatorChartBaseConfigFromKeyStr(
	keyStr: string,
): IndicatorChartBaseConfig | undefined {
	const indicatorKey = parseKey(keyStr) as IndicatorKey;
	if (!indicatorKey) return undefined;
	const indicatorType = indicatorKey.indicatorType;
	const config = getIndicatorConfig(indicatorType);
	if (!config) return undefined;
	return config.chartConfig;
}

// export function getIndicatorSeriesName(
// 	seriesName: string,
// 	indicatorKey: IndicatorKey,
// ): string | undefined {
// 	const config = getIndicatorConfig(indicatorKey.indicatorType);
// 	if (!config) return undefined;
// 	return config.getSeriesName(seriesName, indicatorKey);
// }

export function getConfigLegendShowName(
	indicatorType: IndicatorType,
	key: keyof IndicatorValueConfig,
): string | undefined {
	const config = getIndicatorConfig(indicatorType);
	if (!config) return undefined;
	return config.indicatorValueConfig[key]?.legendShowName;
}

export function getValueLegendShowName(
	indicatorType: IndicatorType,
	key: keyof IndicatorValueConfig,
): string | undefined {
	const config = getIndicatorConfig(indicatorType);
	if (!config) return undefined;
	return config.indicatorValueConfig[key]?.legendShowName;
}
