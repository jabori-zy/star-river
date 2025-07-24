import { useState, useEffect } from "react";
import { BacktestIndicatorKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import { SubChartConfig, IndicatorChartConfig } from "@/types/chart";
import { INDICATOR_CHART_CONFIG_MAP } from "@/types/indicator/indicator-chart-config";
import { BacktestChart } from "@/types/chart/backtest-chart";
import IndicatorSelector from "@/components/indicator-selector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface IndicatorListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    strategyId: number;
    chartConfig: BacktestChart;
    onMainChartIndicatorAdd: (chartId: number, indicatorKeyStr: string, indicatorChartConfig: IndicatorChartConfig) => void;
    onSubChartIndicatorAdd: (chartId: number, subChartConfig: SubChartConfig) => void;
}

export default function AddIndicatorDialog({
    chartConfig,
    open,
    onOpenChange,
    strategyId,
    onMainChartIndicatorAdd,
    onSubChartIndicatorAdd
}: IndicatorListDialogProps) {
    // 选中的指标缓存键
    const [selectedIndicatorKey, setSelectedIndicatorKey] = useState<string | undefined>(undefined);

    // 当dialog打开时重置选择
    useEffect(() => {
        if (open) {
            setSelectedIndicatorKey(undefined); // 重置选择
        }
    }, [open]);

    // 处理添加指标
    const handleAddIndicator = () => {
        if (selectedIndicatorKey) {
            // 解析指标数据
            const indicatorData = parseKey(selectedIndicatorKey) as BacktestIndicatorKey;
            const indicatorConfig = INDICATOR_CHART_CONFIG_MAP[indicatorData.indicatorType];

            if (indicatorConfig) {
                // 添加指标配置到副图
                const subChartId = chartConfig.subChartConfigs.length + 1;

                // 添加到主图
                if (indicatorConfig.isInMainChart) {
                    onMainChartIndicatorAdd(chartConfig.id, selectedIndicatorKey, indicatorConfig);
                } else {
                    // 添加到副图
                    onSubChartIndicatorAdd(chartConfig.id, {
                        mainChartId: chartConfig.id,
                        subChartId: subChartId,
                        indicatorChartConfigs: {[selectedIndicatorKey]: indicatorConfig},
                    });
                }
            }

            onOpenChange(false);
        }
    };

    // 处理取消
    const handleCancel = () => {
        setSelectedIndicatorKey(undefined);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>添加指标</DialogTitle>
                    <DialogDescription>
                        选择要添加到图表的技术指标。指标可以添加到主图或副图中。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {chartConfig.klineChartConfig.klineKeyStr ? (
                        <div className="grid gap-2">
                            <Label htmlFor="indicator-selector" className="text-left">
                                选择指标
                            </Label>
                            <IndicatorSelector
                                klineKeyStr={chartConfig.klineChartConfig.klineKeyStr}
                                selectedIndicatorKey={selectedIndicatorKey}
                                onIndicatorSelect={setSelectedIndicatorKey}
                                strategyId={strategyId}
                                placeholder="选择要添加的指标"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-8 text-gray-500">
                            请先选择交易对
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                    >
                        取消
                    </Button>
                    <Button 
                        onClick={handleAddIndicator}
                        disabled={!selectedIndicatorKey}
                    >
                        添加指标
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
