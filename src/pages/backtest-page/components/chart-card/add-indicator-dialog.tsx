import { useState, useEffect } from "react";
import Dialog from "@/components/dialog";
import { BacktestIndicatorKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import { SubChartConfig, IndicatorChartConfig } from "@/types/chart";
import { INDICATOR_CHART_CONFIG_MAP } from "@/types/indicator/indicator-chart-config";
import { BacktestChart } from "@/types/chart/backtest-chart";
import IndicatorSelector from "@/components/indicator-selector";

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
        <Dialog
            isOpen={open}
            onClose={handleCancel}
            title="添加指标"
            onSave={handleAddIndicator}
            onCancel={handleCancel}
            saveText="添加指标"
            cancelText="取消"
            saveDisabled={!selectedIndicatorKey}
            className="w-full max-w-sm"
        >
            <div className="flex flex-col gap-4 py-4 px-4">
                {chartConfig.klineChartConfig.klineKeyStr ? (
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">选择指标</label>
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
        </Dialog>
    );
}
