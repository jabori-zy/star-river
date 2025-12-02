import type React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getKlineIntervalLabel } from "@/types/kline";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import { IndicatorConfigShowItem } from "./indicator-config-show-item";

interface BacktestModeShowProps {
	id: string;
	data: IndicatorNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({
	data,
	handleColor,
}) => {
	const { t } = useTranslation();
	const exchangeModeConfig = data?.backtestConfig?.exchangeModeConfig;

	return (
		<div className="space-y-3">
			{/* 指标信息 */}
			<div className="space-y-2">
				{!exchangeModeConfig?.selectedIndicators ||
				exchangeModeConfig.selectedIndicators.length === 0 ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-sm font-bold text-muted-foreground">
							{t("indicatorNode.technicalIndicators")}
						</Label>
						<span className="text-sm text-red-500">
							{t("indicatorNode.noIndicatorConfig")}
						</span>
					</div>
				) : (
					<div>
						<div className="flex items-center gap-2">
							<Label className="text-sm font-bold text-muted-foreground">
								{t("indicatorNode.technicalIndicators")}
							</Label>
							<Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
								{exchangeModeConfig.selectedIndicators.length}
							</Badge>
						</div>
						<div className="flex flex-col gap-2 mt-2">
							{exchangeModeConfig.selectedIndicators.map((indicator) => (
								<IndicatorConfigShowItem
									key={indicator.outputHandleId}
									indicator={indicator}
									handleId={indicator.outputHandleId}
									handleColor={handleColor}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			{/* k线信息 */}
			<div className="space-y-2">
				{!exchangeModeConfig?.selectedAccount ||
				!exchangeModeConfig?.selectedSymbol ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-sm font-bold text-muted-foreground">
							{t("indicatorNode.dataSource")}
						</Label>
						<span className="text-sm text-red-500">
							{t("indicatorNode.noConfig")}
						</span>
					</div>
				) : (
					<div>
						<Label className="text-sm font-bold text-muted-foreground">
							{t("indicatorNode.dataSource")}
						</Label>
						<div className="flex flex-col gap-2 bg-gray-100 p-2 rounded-md mt-1">
							<div className="flex flex-row items-center justify-between gap-2 pr-2">
								<span className="text-xs font-bold">
									{t("indicatorNode.symbol")}:
								</span>
								<span className="text-xs">
									{exchangeModeConfig.selectedSymbol.symbol}
								</span>
							</div>
							<div className="flex flex-row items-center justify-between gap-2 pr-2">
								<span className="text-xs font-bold">
									{t("indicatorNode.interval")}:
								</span>
								<span className="text-xs">
									{getKlineIntervalLabel(
										exchangeModeConfig.selectedSymbol.interval,
									)}
								</span>
							</div>
							<div className="flex flex-row items-center justify-between gap-2 pr-2">
								<span className="text-xs font-bold">
									{t("indicatorNode.exchange")}:
								</span>
								<span className="text-xs">
									{exchangeModeConfig.selectedAccount.exchange}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default BacktestModeShow;
