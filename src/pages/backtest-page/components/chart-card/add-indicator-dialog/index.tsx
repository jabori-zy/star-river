import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import IndicatorSelector from "@/pages/backtest-page/components/chart-card/add-indicator-dialog/indicator-selector";
import type { IndicatorChartConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { getIndciatorChartBaseConfigFromKeyStr } from "@/types/indicator/indicator-config";

interface IndicatorListDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	strategyId: number;
	chartConfig: BacktestChartConfig;
	onIndicatorAdd: (indicatorChartConfig: IndicatorChartConfig) => void;
}

export default function AddIndicatorDialog({
	chartConfig,
	open,
	onOpenChange,
	strategyId,
	onIndicatorAdd,
}: IndicatorListDialogProps) {
	const { t } = useTranslation();
	// 选中的指标缓存键
	const [selectedIndicatorKey, setSelectedIndicatorKey] = useState<
		string | undefined
	>(undefined);

	// 当dialog打开时重置选择
	useEffect(() => {
		if (open) {
			setSelectedIndicatorKey(undefined); // 重置选择
		}
	}, [open]);

	// 处理添加指标
	const handleAddIndicator = () => {
		if (selectedIndicatorKey) {
			// 解析指标数据
			// const indicatorData = parseKey(selectedIndicatorKey) as IndicatorKey;
			const indicatorChartBaseConfig =
				getIndciatorChartBaseConfigFromKeyStr(selectedIndicatorKey);

			if (indicatorChartBaseConfig) {
				// 添加指标配置
				// 添加到主图
				onIndicatorAdd({
					indicatorKeyStr: selectedIndicatorKey,
					isDelete: false,
					...indicatorChartBaseConfig,
				});
			}

			onOpenChange(false);
		}
	};

	// 处理取消
	const handleCancel = () => {
		setSelectedIndicatorKey(undefined);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("desktop.backtestPage.addIndicator")}</DialogTitle>
					<DialogDescription>
						{t("desktop.backtestPage.addIndicatorDescription")}
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{chartConfig.klineChartConfig.klineKeyStr ? (
						<div className="grid gap-2">
							<Label htmlFor="indicator-selector" className="text-left">
								{t("desktop.backtestPage.indicator")}
							</Label>
							<IndicatorSelector
								klineKeyStr={chartConfig.klineChartConfig.klineKeyStr}
								selectedIndicatorKey={selectedIndicatorKey}
								onIndicatorSelect={setSelectedIndicatorKey}
								strategyId={strategyId}
								placeholder={t("desktop.backtestPage.addIndicatorPlaceholder")}
							/>
						</div>
					) : (
						<div className="flex items-center justify-center py-8 text-gray-500">
							请先选择交易对
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel}>
						{t("common.cancel")}
					</Button>
					<Button onClick={handleAddIndicator} disabled={!selectedIndicatorKey}>
						{t("common.save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
