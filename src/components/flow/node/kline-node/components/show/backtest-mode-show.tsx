import type React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { KlineNodeBacktestConfig } from "@/types/node/kline-node";
import { SymbolItem } from "./kline-config-show-item";

interface BacktestModeShowProps {
	handleColor: string;
	backtestConfig: KlineNodeBacktestConfig;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({
	handleColor,
	backtestConfig,
}) => {
	const { t } = useTranslation();
	const selectedAccount = backtestConfig?.exchangeModeConfig?.selectedAccount;
	const selectedSymbols =
		backtestConfig?.exchangeModeConfig?.selectedSymbols || [];
	const localTimeRange = backtestConfig?.exchangeModeConfig?.timeRange || null;

	return (
		<div className="space-y-2">
			{/* 交易对展示 */}
			<div className="space-y-2">
				{selectedSymbols.length === 0 ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-xm font-bold text-muted-foreground">
							{t("klineNode.symbol")}
						</Label>
						<span className="text-sm text-red-500">
							{t("klineNode.noSymbol")}
						</span>
					</div>
				) : (
					<div>
						<div className="flex items-center gap-2">
							<Label className="text-xm font-bold text-muted-foreground">
								{t("klineNode.symbol")}
							</Label>
							{/* <Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
								{selectedSymbols.length}
							</Badge> */}
						</div>
						<div className="flex flex-col gap-2 mt-2">
							{selectedSymbols.map((symbol, index) => (
								<SymbolItem
									key={`${symbol.symbol}-${symbol.interval}-${index}`}
									symbol={symbol}
									handleColor={handleColor}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			{/* 数据源展示 */}
			<div className="space-y-2">
				{!selectedAccount || !selectedAccount.accountName ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-xm font-bold text-muted-foreground">
							{t("klineNode.dataSource")}
						</Label>
						<span className="text-sm text-red-500">
							{t("klineNode.noDataSource")}
						</span>
					</div>
				) : (
					<div>
						<Label className="text-xm font-bold text-muted-foreground">
							{t("klineNode.dataSource")}
						</Label>
						<div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md mt-1">
							<span className="text-xs">
								{selectedAccount.accountName} ({selectedAccount.exchange})
							</span>
						</div>
					</div>
				)}
			</div>
			{/* 回测时间范围展示 */}
			<div className="space-y-2">
				{!localTimeRange?.startDate || !localTimeRange?.endDate ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-xm font-bold text-muted-foreground">
							{t("klineNode.timeRange")}
						</Label>
						<span className="text-sm text-red-500">
							{t("klineNode.noTimeRange")}
						</span>
					</div>
				) : (
					<div>
						<Label className="text-xm font-bold text-muted-foreground">
							{t("klineNode.timeRange")}
						</Label>
						<div className="flex flex-col gap-1 text-sm bg-gray-100 p-2 rounded-md mt-2">
							<div className="flex items-center gap-2">
								<span className="text-gray-600">
									{t("klineNode.startTime")}:
								</span>
								<span className="font-medium">{localTimeRange.startDate}</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-gray-600">{t("klineNode.endTime")}:</span>
								<span className="font-medium">{localTimeRange.endDate}</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default BacktestModeShow;
