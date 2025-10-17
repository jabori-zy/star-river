// import RealtimeTickingStockCharts from "@/components/chart/SciChart";
import { ChartSpline, Ellipsis, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import BacktestChart from "@/components/chart/backtest-chart";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorChartConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import AddIndicatorDialog from "./add-indicator-dialog";
import SymbolListDialog from "./symbol-list-dialog";

interface ChartCardProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

const ChartCard: React.FC<ChartCardProps> = ({ chartConfig, strategyId }) => {
	// 使用store中的方法
	const { deleteChart, addIndicator, changeKline } =
		useBacktestChartConfigStore();

	const [isSymbolDialogOpen, setIsSymbolDialogOpen] = useState(false);
	const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] = useState(false);

	// 处理kline选择
	const handleKlineSelect = (klineCacheKeyStr: string) => {
		changeKline(chartConfig.id, klineCacheKeyStr);
	};

	// 处理指标添加
	const handleIndicatorAdd = (indicatorChartConfig: IndicatorChartConfig) => {
		addIndicator(chartConfig.id, indicatorChartConfig);
	};

	return (
		<div className="flex flex-col h-full min-h-0 overflow-hidden">
			<div className="flex items-center justify-between px-2 mb-2 flex-shrink-0">
				<div className="flex flex-row items-center gap-2">
					<Button
						className="flex flex-row items-center gap-2 text-sm font-medium"
						variant="ghost"
						onClick={() => setIsSymbolDialogOpen(true)}
					>
						<Search className="w-4 h-4 text-gray-500" />
						{chartConfig.chartName}
					</Button>
					{/* 纵向的分界线 */}
					<div className="w-[1px] h-4 bg-gray-300" />
					<Button
						className="flex flex-row items-center gap-2 text-sm font-medium"
						variant="ghost"
						onClick={() => setIsIndicatorDialogOpen(true)}
					>
						<ChartSpline className="w-4 h-4 text-gray-500" />
						指标
					</Button>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger>
						<Ellipsis />
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={() => deleteChart(chartConfig.id)}>
							<Trash2 className="w-4 h-4 text-red-500" />
							<div className="text-red-500">删除图表</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="flex-1 w-full h-full">
				<BacktestChart strategyId={strategyId} chartConfig={chartConfig} />
			</div>

			{/* Symbol选择Dialog */}
			<SymbolListDialog
				open={isSymbolDialogOpen}
				onOpenChange={setIsSymbolDialogOpen}
				strategyId={strategyId}
				selectedKlineCacheKeyStr={chartConfig.klineChartConfig.klineKeyStr}
				onKlineSelect={handleKlineSelect}
			/>

			{/* Indicator添加Dialog */}
			<AddIndicatorDialog
				chartConfig={chartConfig}
				open={isIndicatorDialogOpen}
				onOpenChange={setIsIndicatorDialogOpen}
				strategyId={strategyId}
				onIndicatorAdd={handleIndicatorAdd}
			/>
		</div>
	);
};

ChartCard.displayName = "ChartCard";

export default ChartCard;
