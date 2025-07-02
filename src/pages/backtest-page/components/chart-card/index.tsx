// import RealtimeTickingStockCharts from "@/components/chart/SciChart";
import { Ellipsis, Trash2 } from "lucide-react";
import StockCharts from "@/components/chart/SciChart/stock-charts";
import SyncMultiChart from "@/components/chart/Demo";
import RealtimeTickingStockCharts from "@/components/chart/SciChart";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { BacktestChart } from "@/types/chart/backtest-chart";

interface ChartCardProps {
    chartConfig: BacktestChart;
    onDelete: (chartId: number) => void;
}



export default function ChartCard({ chartConfig, onDelete }: ChartCardProps) {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            
            <div className="flex items-center justify-between px-2 mb-2">
                <div className="text-sm font-medium">
                    {chartConfig.chartName}
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
            <div className="w-full h-full overflow-hidden  bg-white" >
                {/* <RealtimeTickingStockCharts 
                    chartId={chartConfig.id} 
                    klineCacheKeyStr={chartConfig.klineCacheKeyStr} 
                    indicatorCacheKeyStrs={chartConfig.indicatorCacheKeyStrs} /> */}
                <StockCharts 
                    chartId={chartConfig.id} 
                    klineKeyStr={chartConfig.klineCacheKeyStr}
                    indicatorKeyStrs={chartConfig.indicatorCacheKeyStrs} 
                />

            </div>

        </div>
        
    )
}