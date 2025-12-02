import type { TFunction } from "i18next";
import { type IndicatorType, MAType } from "@/types/indicator";
import { getIndicatorConfig } from "@/types/indicator/indicator-config";

export interface IndicatorOption {
	key: string;
	label: string;
	indicatorType: string;
	indicatorConfig: Record<string, unknown>;
}

// MA类型标签映射
const MA_TYPE_LABELS: Record<MAType, string> = {
	[MAType.SMA]: "SMA",
	[MAType.EMA]: "EMA",
	[MAType.WMA]: "WMA",
	[MAType.DEMA]: "DEMA",
	[MAType.TEMA]: "TEMA",
	[MAType.TRIMA]: "TRIMA",
	[MAType.KAMA]: "KAMA",
	[MAType.MANA]: "MANA",
	[MAType.T3]: "T3",
};

// 根据新的配置结构获取指标参数显示文本
export const getIndicatorConfigDisplay = (
	indicatorConfig: Record<string, unknown>,
	t: TFunction,
	indicatorType?: string,
): string => {
	if (!indicatorType) return "";

	const configInstance = getIndicatorConfig(indicatorType as IndicatorType);
	if (!configInstance) return "";

	// 构建显示文本（排除价格源，不显示）
	const paramParts: string[] = [];

	Object.entries(configInstance.params).forEach(([key, param]) => {
		const value = indicatorConfig[key];
		if (value !== undefined && key !== "priceSource") {
			if (key === "maType") {
				const maTypeLabel = (value as MAType) || value;
				paramParts.push(`${t(param.label)}:${maTypeLabel}`);
			} else {
				paramParts.push(`${t(param.label)}:${value}`);
			}
		}
	});

	return paramParts.join(" | ");
};
