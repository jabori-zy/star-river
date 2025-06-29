import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, PlusCircle } from "lucide-react";
import ChartConfigDialog from "./chart-config-dialog";

interface AddChartButtonProps {
    onAddChart: (klineCacheKeyStr: string, indicatorCacheKeyStrs: string[], chartName: string) => void;
    showAlert?: boolean;
    alertMessage?: string;
    disabled?: boolean;
    strategyId?: number;
}

const AddChartButton = ({ 
    onAddChart, 
    showAlert = false, 
    alertMessage = "", 
    disabled = false,
    strategyId = 1 // 默认策略ID，应该从props传入
}: AddChartButtonProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    // 打开添加图表对话框
    const openAddChartDialog = () => {
        setDialogOpen(true);
    };

    // 处理图表配置确认
    const handleChartConfigConfirm = (klineCacheKeyStr: string, indicatorCacheKeyStrs: string[], chartName: string) => {
        onAddChart(klineCacheKeyStr, indicatorCacheKeyStrs, chartName);
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
                    onClick={openAddChartDialog}
                    disabled={disabled}
                >
                    <PlusCircle className="h-4 w-4" />
                    添加图表
                </Button>
            </div>

            {/* 图表配置对话框 */}
            <ChartConfigDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleChartConfigConfirm}
                strategyId={strategyId}
            />
        </>
    );
};

export default AddChartButton;