import { AlertCircle, Loader2, PlusCircle, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import LayoutControl from "../layout-control";
import type { LayoutMode } from "@/types/chart";

interface ChartManageButtonProps {
	onAddChart: (klineCacheKeyStr: string, chartName: string) => void;
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
	// 处理添加图表
	const handleAddChart = () => {
		if (strategyChartConfig.charts.length === 0) {
			// 如果没有图表，显示错误或提示
			console.warn("没有可复制的图表配置");
			return;
		}

		// 复制最后一个图表的配置
		const lastChart =
			strategyChartConfig.charts[strategyChartConfig.charts.length - 1];
		const newChartName = `${lastChart.chartName}`;

		onAddChart(lastChart.klineChartConfig.klineKeyStr, newChartName);
	};

	return (
		<div className="flex items-center gap-3">
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
				<PlusCircle className="h-4 w-4" />
				添加图表
			</Button>
			<Button variant="default" onClick={saveChartConfig} disabled={isSaving}>
					{isSaving ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<Save className="w-4 h-4" />
					)}
					{isSaving ? "保存中..." : "保存图表"}
				</Button>
		</div>
	);
};

export default ChartManageButton;
