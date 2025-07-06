// import RealtimeTickingStockCharts from "@/components/chart/SciChart";
import { Ellipsis, Trash2, Search, ChartSpline } from "lucide-react";
import StockCharts from "@/components/chart/stock-chart";
// import StockChart from "@/components/chart/stock-chart-new";
// import SyncMultiChart from "@/components/chart/Demo";
// import RealtimeTickingStockCharts from "@/components/chart/SciChart";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { BacktestChart } from "@/types/chart/backtest-chart";
import SymbolListDialog from "../symbol-list-dialog";
import IndicatorListDialog from "../indicator-list-dialog";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

interface ChartCardProps {
    chartConfig: BacktestChart;
    strategyId: number;
    onDelete: (chartId: number) => void;
    onUpdate: (chartId: number, klineCacheKeyStr: string, chartName: string) => void;
    onAddIndicator: (chartId: number, indicatorKey: string) => void;
}

interface ChartCardRef {
    clearChartData: () => void;
}

const ChartCard = forwardRef<ChartCardRef, ChartCardProps>(({ chartConfig, strategyId, onDelete, onUpdate, onAddIndicator }, ref) => {
    const [isSymbolDialogOpen, setIsSymbolDialogOpen] = useState(false);
    const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] = useState(false);
    const stockChartsRef = useRef<{ clearChartData: () => void }>(null);

    // 暴露清空方法给父组件
    useImperativeHandle(ref, () => ({
        clearChartData: () => {
            if (stockChartsRef.current) {
                stockChartsRef.current.clearChartData();
            }
        }
    }));

    // 处理kline选择
    const handleKlineSelect = (klineCacheKeyStr: string, chartName: string) => {
        onUpdate(chartConfig.id, klineCacheKeyStr, chartName);
    };

    // 处理指标添加
    const handleIndicatorAdd = (indicatorKey: string) => {
        onAddIndicator(chartConfig.id, indicatorKey);
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
            <div className="flex-1 w-full overflow-hidden bg-gray-50" >
                <StockCharts
                    ref={stockChartsRef}
                    chartId={chartConfig.id} 
                    klineKeyStr={chartConfig.klineCacheKeyStr}
                    indicatorKeyStrs={chartConfig.indicatorCacheKeyStrs} 
                />
            </div>

            {/* Symbol选择Dialog */}
            <SymbolListDialog
                open={isSymbolDialogOpen}
                onOpenChange={setIsSymbolDialogOpen}
                strategyId={strategyId}
                selectedKlineCacheKeyStr={chartConfig.klineCacheKeyStr}
                onKlineSelect={handleKlineSelect}
            />

            {/* Indicator添加Dialog */}
            <IndicatorListDialog
                open={isIndicatorDialogOpen}
                onOpenChange={setIsIndicatorDialogOpen}
                strategyId={strategyId}
                selectedKlineCacheKeyStr={chartConfig.klineCacheKeyStr}
                selectedIndicatorKeys={chartConfig.indicatorCacheKeyStrs}
                onIndicatorAdd={handleIndicatorAdd}
            />
        </div>
    );
});

ChartCard.displayName = 'ChartCard';

export default ChartCard;