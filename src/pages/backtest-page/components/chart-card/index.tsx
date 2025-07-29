	// import RealtimeTickingStockCharts from "@/components/chart/SciChart";
import { ChartSpline, Ellipsis, Search, Trash2 } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import StockCharts from "@/components/chart/stock-chart";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IndicatorChartConfig, SubChartConfig } from "@/types/chart";
import type { BacktestChart } from "@/types/chart/backtest-chart";
import AddIndicatorDialog from "./add-indicator-dialog";
import SymbolListDialog from "./symbol-list-dialog";
import { BacktestChart as BacktestChartComponent } from "@/components/chart/backtest-chart";

interface ChartCardProps {
	chartConfig: BacktestChart;
	strategyId: number;
	onDelete: (chartId: number) => void;
	onUpdate: (
		chartId: number,
		klineCacheKeyStr: string,
		chartName: string,
	) => void;
	onAddMainChartIndicator: (
		chartId: number,
		indicatorKeyStr: string,
		indicatorChartConfig: IndicatorChartConfig,
	) => void;
	onAddSubChartIndicator: (
		chartId: number,
		subChartConfig: SubChartConfig,
	) => void;
	onDeleteSubChart: (subChartId: number) => void;
}

interface ChartCardRef {
	clearChartData: () => void;
}

const ChartCard = forwardRef<ChartCardRef, ChartCardProps>(
	(
		{
			chartConfig,
			strategyId,
			onDelete,
			onUpdate,
			onAddMainChartIndicator,
			onAddSubChartIndicator,
			onDeleteSubChart,
		},
		ref,
	) => {
		const [isSymbolDialogOpen, setIsSymbolDialogOpen] = useState(false);
		const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] = useState(false);
		const stockChartsRef = useRef<{ clearChartData: () => void }>(null);

		// 暴露清空方法给父组件
		useImperativeHandle(ref, () => ({
			clearChartData: () => {
				if (stockChartsRef.current) {
					stockChartsRef.current.clearChartData();
				}
			},
		}));

		// 处理kline选择
		const handleKlineSelect = (klineCacheKeyStr: string, chartName: string) => {
			onUpdate(chartConfig.id, klineCacheKeyStr, chartName);
		};

		// 处理指标添加
		const handleMainChartIndicatorAdd = (
			chartId: number,
			indicatorKeyStr: string,
			indicatorChartConfig: IndicatorChartConfig,
		) => {
			onAddMainChartIndicator(chartId, indicatorKeyStr, indicatorChartConfig);
		};

		const handleSubChartIndicatorAdd = (
			chartId: number,
			subChartConfig: SubChartConfig,
		) => {
			onAddSubChartIndicator(chartId, subChartConfig);
		};

		return (
			<div className="flex flex-col h-full overflow-hidden">
				<div className="flex items-center justify-between px-2 mb-2">
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
							<DropdownMenuItem onClick={() => onDelete(chartConfig.id)}>
								<Trash2 className="w-4 h-4 text-red-500" />
								<div className="text-red-500">删除图表</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="flex-1 w-full overflow-hidden bg-gray-50">
					{/* <StockCharts
						ref={stockChartsRef}
						strategyId={strategyId}
						chartConfig={chartConfig}
						onDeleteSubChart={onDeleteSubChart}
					/> */}
					<BacktestChartComponent />
				</div>

				{/* Symbol选择Dialog */}
				<SymbolListDialog
					open={isSymbolDialogOpen}
					onOpenChange={setIsSymbolDialogOpen}
					strategyId={strategyId}
					onKlineSelect={handleKlineSelect}
				/>

				{/* Indicator添加Dialog */}
				<AddIndicatorDialog
					chartConfig={chartConfig}
					open={isIndicatorDialogOpen}
					onOpenChange={setIsIndicatorDialogOpen}
					strategyId={strategyId}
					onMainChartIndicatorAdd={handleMainChartIndicatorAdd}
					onSubChartIndicatorAdd={handleSubChartIndicatorAdd}
				/>
			</div>
		);
	},
);

ChartCard.displayName = "ChartCard";

export default ChartCard;
