import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, PlusCircle } from "lucide-react";
import { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";

interface AddChartButtonProps {
    onAddChart: (klineCacheKeyStr: string, chartName: string) => void;
    showAlert?: boolean;
    alertMessage?: string;
    strategyChartConfig: BacktestStrategyChartConfig;
}

const AddChartButton = ({ 
    onAddChart, 
    showAlert = false, 
    alertMessage = "", 
    strategyChartConfig
}: AddChartButtonProps) => {

    // 处理添加图表
    const handleAddChart = () => {
        if (strategyChartConfig.charts.length === 0) {
            // 如果没有图表，显示错误或提示
            console.warn('没有可复制的图表配置');
            return;
        }

        // 复制最后一个图表的配置
        const lastChart = strategyChartConfig.charts[strategyChartConfig.charts.length - 1];
        const newChartName = `${lastChart.chartName}`;
        
        onAddChart(
            lastChart.klineChartConfig.klineCacheKeyStr,
            newChartName
        );
    };

    return (
        <>
            <div className="flex items-center gap-3">
                {showAlert && (
                    <Alert variant="destructive" className="w-auto py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{alertMessage}</AlertDescription>
                    </Alert>
                )}
                
                <Button 
                    variant="outline" 
                    className="flex items-center gap-1" 
                    onClick={handleAddChart}
                >
                    <PlusCircle className="h-4 w-4" />
                    添加图表
                </Button>
            </div>
        </>
    );
};

export default AddChartButton;