import { Position } from "@xyflow/react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Badge } from "@/components/ui/badge";
import { type IndicatorType, MAType, PriceSource } from "@/types/indicator";
import {
	getIndicatorConfig,
	getIndicatorDisplayName,
} from "@/types/indicator/indicator-config";
import type { SelectedIndicator } from "@/types/node/indicator-node";

// 价格源选项映射
const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
	[PriceSource.CLOSE]: "收盘价",
	[PriceSource.OPEN]: "开盘价",
	[PriceSource.HIGH]: "最高价",
	[PriceSource.LOW]: "最低价",
};

// MA类型选项映射
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

// 从配置获取指标类型的显示标签
const getIndicatorLabel = (type: IndicatorType): string => {
	return getIndicatorDisplayName(type);
};

// 获取价格源的中文标签
const getPriceSourceLabel = (priceSource: PriceSource): string => {
	return PRICE_SOURCE_LABELS[priceSource] || priceSource;
};

// 根据新的配置结构获取指标参数显示文本
const getIndicatorParams = (
	indicatorType: IndicatorType,
	indicatorConfig: Record<string, unknown>,
): string => {
	const configInstance = getIndicatorConfig(indicatorType);
	if (!configInstance) return "";

	// 构建显示文本（排除价格源，单独显示）
	const paramParts: string[] = [];

	Object.entries(configInstance.params).forEach(([key, param]) => {
		const value = indicatorConfig[key];
		if (value !== undefined && key !== "priceSource") {
			if (key === "maType") {
				const maTypeLabel = MA_TYPE_LABELS[value as MAType] || value;
				paramParts.push(`${param.label}:${maTypeLabel}`);
			} else {
				paramParts.push(`${param.label}:${value}`);
			}
		}
	});

	return paramParts.join(" | ");
};

interface IndicatorConfigShowItemProps {
	indicator: SelectedIndicator;
	handleId: string;
	handleColor: string;
}

export function IndicatorConfigShowItem({
	indicator,
	handleId,
	handleColor,
}: IndicatorConfigShowItemProps) {
	const priceSource = indicator.indicatorConfig.priceSource as PriceSource;

	return (
		<div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative">
			<div className="flex items-center gap-2 justify-between w-full">
				{/* flex-1 表示占满剩余空间 */}
				<div className="flex flex-col gap-1 flex-1">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">
							{getIndicatorLabel(indicator.indicatorType)}
						</span>
					</div>
					<div className="text-xs text-muted-foreground">
						{getIndicatorParams(
							indicator.indicatorType,
							indicator.indicatorConfig,
						)}
						{priceSource && ` | ${getPriceSourceLabel(priceSource)}`}
					</div>
				</div>
				<div className="text-xs text-muted-foreground font-bold">
					<Badge variant="outline" className="border-gray-400">
						指标 {indicator.configId}
					</Badge>
				</div>
			</div>
			<BaseHandle
				id={handleId}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-2"
			/>
		</div>
	);
}
