import { AlertCircle, Loader2, PlusCircle, Save } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { LayoutMode } from "@/types/chart";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import LayoutControl from "../layout-control";
import SymbolListDialog from "../symbol-list-dialog";

interface ChartManageButtonProps {
	strategyId: number;
	onAddChart: (klineKeyStr: string) => void;
	saveChartConfig: () => void;
	isSaving: boolean;
	showAlert?: boolean;
	alertMessage?: string;
	strategyChartConfig: BacktestStrategyChartConfig;
	updateLayout: (layout: LayoutMode) => void;
}

const ChartManageButton = ({
	strategyId,
	onAddChart,
	saveChartConfig,
	isSaving,
	showAlert = false,
	alertMessage = "",
	strategyChartConfig,
	updateLayout,
}: ChartManageButtonProps) => {
	const { t } = useTranslation();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Handle adding chart - open dialog to select kline
	const handleAddChart = () => {
		setIsDialogOpen(true);
	};

	// Handle kline selection from dialog
	const handleKlineSelect = (klineKeyStr: string) => {
		onAddChart(klineKeyStr);
		setIsDialogOpen(false);
	};

	return (
		<>
			<div className="flex items-center gap-1 md:gap-2 lg:gap-3">
				{showAlert && (
					<Alert variant="destructive" className="w-auto py-2">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{alertMessage}</AlertDescription>
					</Alert>
				)}
				{strategyChartConfig.charts.length > 1 && (
					<LayoutControl
						value={strategyChartConfig.layout || "vertical"}
						onChange={updateLayout}
					/>
				)}

				<Button
					variant="outline"
					className="flex items-center gap-1"
					onClick={handleAddChart}
				>
					<PlusCircle className="h-4 w-4 shrink-0" />
					<span className="hidden lg:inline">
						{t("desktop.backtestPage.addChart")}
					</span>
				</Button>
				<Button variant="default" onClick={saveChartConfig} disabled={isSaving}>
					{isSaving ? (
						<Loader2 className="w-4 h-4 animate-spin shrink-0" />
					) : (
						<Save className="w-4 h-4 shrink-0" />
					)}
					<span className="hidden lg:inline">
						{isSaving ? t("common.saving") : t("desktop.backtestPage.saveChart")}
					</span>
				</Button>
			</div>

			{/* Kline selection Dialog */}
			<SymbolListDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				strategyId={strategyId}
				onKlineSelect={handleKlineSelect}
			/>
		</>
	);
};

export default ChartManageButton;
