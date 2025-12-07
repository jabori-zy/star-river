import { Position } from "@xyflow/react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Badge } from "@/components/ui/badge";
import {
	getPriceSourceDisplayName,
	type IndicatorType,
	MAType,
	type PriceSource,
} from "@/types/indicator";
import {
	getIndicatorConfig,
	getIndicatorDisplayName,
} from "@/types/indicator/indicator-config";
import type { SelectedIndicator } from "@/types/node/indicator-node";

// MA type option mapping
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

// Get display label for indicator type from configuration
const getIndicatorLabel = (type: IndicatorType): string => {
	return getIndicatorDisplayName(type);
};

// Get Chinese label for price source
const getPriceSourceLabel = (
	priceSource: PriceSource,
	t: TFunction,
): string => {
	return getPriceSourceDisplayName(priceSource, t);
};

// Get indicator parameter display text based on new configuration structure
const getIndicatorParams = (
	indicatorType: IndicatorType,
	indicatorConfig: Record<string, unknown>,
	t: TFunction,
): string => {
	const configInstance = getIndicatorConfig(indicatorType);
	if (!configInstance) return "";

	// Build display text (exclude price source, display separately)
	const paramParts: string[] = [];

	Object.entries(configInstance.params).forEach(([key, param]) => {
		const value = indicatorConfig[key];
		if (value !== undefined && key !== "priceSource") {
			if (key === "maType") {
				const maTypeLabel = MA_TYPE_LABELS[value as MAType] || value;
				paramParts.push(`${t(param.label)}:${maTypeLabel}`);
			} else {
				paramParts.push(`${t(param.label)}:${value}`);
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
	const { t } = useTranslation();
	return (
		<div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative">
			<div className="flex items-center gap-2 justify-between w-full">
				{/* flex-1 means filling remaining space */}
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
							t,
						)}
						{priceSource && ` | ${getPriceSourceLabel(priceSource, t)}`}
					</div>
				</div>
				<div className="text-xs text-muted-foreground font-bold">
					<Badge variant="outline" className="border-gray-400">
						{t("indicatorNode.indicator")} {indicator.configId}
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
