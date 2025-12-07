import { AlertCircle, Loader2, PlusCircle, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { LayoutMode } from "@/types/chart";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import LayoutControl from "../layout-control";

interface ChartManageButtonProps {
	onAddChart: (klineKeyStr: string) => void;
	saveChartConfig: () => void;
	isSaving: boolean;
	showAlert?: boolean;
	alertMessage?: string;
	strategyChartConfig: BacktestStrategyChartConfig;
	updateLayout: (layout: LayoutMode) => void;
}

const ChartManageButton = ({
	onAddChart,
	saveChartConfig,
	isSaving,
	showAlert = false,
	alertMessage = "",
	strategyChartConfig,
	updateLayout,
}: ChartManageButtonProps) => {
	const { t } = useTranslation();
	// Handle adding chart
	const handleAddChart = () => {
		if (strategyChartConfig.charts.length === 0) {
			// If no charts, show error or prompt
			console.warn("没有可复制的图表配置");
			return;
		}

		// Copy the last chart's configuration
		const lastChart =
			strategyChartConfig.charts[strategyChartConfig.charts.length - 1];

		onAddChart(lastChart.klineChartConfig.klineKeyStr);
	};

	return (
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
				<PlusCircle className="h-4 w-4 flex-shrink-0" />
				<span className="hidden lg:inline">
					{t("desktop.backtestPage.addChart")}
				</span>
			</Button>
			<Button variant="default" onClick={saveChartConfig} disabled={isSaving}>
				{isSaving ? (
					<Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
				) : (
					<Save className="w-4 h-4 flex-shrink-0" />
				)}
				<span className="hidden lg:inline">
					{isSaving ? t("common.saving") : t("desktop.backtestPage.saveChart")}
				</span>
			</Button>
		</div>
	);
};

export default ChartManageButton;
