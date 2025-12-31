// import RealtimeTickingStockCharts from "@/components/chart/SciChart";
import { ChartSpline, Ellipsis, Group, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import BacktestChart from "@/components/chart/backtest-chart";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorChartConfig, OperationChartConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import AddIndicatorDialog from "./add-indicator-dialog";
import AddOperationDialog from "./add-operation-dialog";
import SymbolListDialog from "./symbol-list-dialog";

interface ChartCardProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

const ChartCard: React.FC<ChartCardProps> = ({ chartConfig, strategyId }) => {
	const { t } = useTranslation();
	// Use methods from store
	const { deleteChart, addIndicator, addOperation, changeKline } =
		useBacktestChartConfigStore();

	const [isSymbolDialogOpen, setIsSymbolDialogOpen] = useState(false);
	const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] = useState(false);
	const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);

	// Handle kline selection
	const handleKlineSelect = (klineCacheKeyStr: string) => {
		changeKline(chartConfig.id, klineCacheKeyStr);
	};

	// Handle indicator addition
	const handleIndicatorAdd = (indicatorChartConfig: IndicatorChartConfig) => {
		addIndicator(chartConfig.id, indicatorChartConfig);
	};

	// Handle operation addition
	const handleOperationAdd = (operationChartConfig: OperationChartConfig) => {
		addOperation(chartConfig.id, operationChartConfig);
	};

	return (
		<div className="flex flex-col h-full min-h-0 overflow-hidden">
			<div className="flex items-center justify-between px-2 mb-2 shrink-0">
				<div className="flex flex-row items-center gap-2">
					<Button
						className="flex flex-row items-center gap-2 text-sm font-medium"
						variant="ghost"
						onClick={() => setIsSymbolDialogOpen(true)}
					>
						<Search className="w-4 h-4 text-gray-500" />
						{chartConfig.chartName}
					</Button>
					{/* Vertical divider line */}
					<div className="w-px h-4 bg-gray-300" />
					<Button
						className="flex flex-row items-center gap-2 text-sm font-medium"
						variant="ghost"
						onClick={() => setIsIndicatorDialogOpen(true)}
					>
						<ChartSpline className="w-4 h-4 text-gray-500" />
						{t("desktop.backtestPage.indicator")}
					</Button>
					<div className="w-px h-4 bg-gray-300" />
					<Button
						className="flex flex-row items-center gap-2 text-sm font-medium"
						variant="ghost"
						onClick={() => setIsOperationDialogOpen(true)}
					>
						<Group className="w-4 h-4 text-gray-500" />
						{t("desktop.backtestPage.operation")}
					</Button>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger>
						<Ellipsis />
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={() => deleteChart(chartConfig.id)}>
							<Trash2 className="w-4 h-4 text-red-500" />
							<div className="text-red-500">
								{t("desktop.backtestPage.deleteChart")}
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="flex-1 w-full h-full">
				<BacktestChart strategyId={strategyId} chartConfig={chartConfig} />
			</div>

			{/* Symbol selection Dialog */}
			<SymbolListDialog
				open={isSymbolDialogOpen}
				onOpenChange={setIsSymbolDialogOpen}
				strategyId={strategyId}
				selectedKlineCacheKeyStr={chartConfig.klineChartConfig.klineKeyStr}
				onKlineSelect={handleKlineSelect}
			/>

			{/* Indicator addition Dialog */}
			<AddIndicatorDialog
				chartConfig={chartConfig}
				open={isIndicatorDialogOpen}
				onOpenChange={setIsIndicatorDialogOpen}
				strategyId={strategyId}
				onIndicatorAdd={handleIndicatorAdd}
			/>

			{/* Operation addition Dialog */}
			<AddOperationDialog
				chartConfig={chartConfig}
				open={isOperationDialogOpen}
				onOpenChange={setIsOperationDialogOpen}
				strategyId={strategyId}
				onOperationAdd={handleOperationAdd}
			/>
		</div>
	);
};

ChartCard.displayName = "ChartCard";

export default ChartCard;
