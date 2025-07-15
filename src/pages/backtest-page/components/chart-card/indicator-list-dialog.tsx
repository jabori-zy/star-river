import { useState, useEffect, useCallback, useMemo } from "react";
import Dialog from "@/components/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BacktestKlineKey, BacktestIndicatorKey } from "@/types/symbol-key";
import { getStrategyCacheKeys } from "@/service/strategy";
import { parseKey } from "@/utils/parse-key";
import { SubChartConfig, IndicatorChartConfig } from "@/types/chart";
import { INDICATOR_CHART_CONFIG_MAP } from "@/types/indicator/indicator-chart-config";
import { BacktestChart } from "@/types/chart/backtest-chart";

interface IndicatorListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    strategyId: number;
    chartConfig: BacktestChart;
    onMainChartIndicatorAdd: (chartId: number, indicatorKeyStr: string, indicatorChartConfig: IndicatorChartConfig) => void;
    onSubChartIndicatorAdd: (chartId: number, subChartConfig: SubChartConfig) => void;
}

interface IndicatorOption {
    key: string;
    label: string;
    data: BacktestIndicatorKey;
}

export default function IndicatorListDialog({
    chartConfig,
    open,
    onOpenChange,
    strategyId,
    onMainChartIndicatorAdd,
    onSubChartIndicatorAdd
}: IndicatorListDialogProps) {
    const [cacheKeys, setCacheKeys] = useState<Record<string, BacktestKlineKey | BacktestIndicatorKey>>({});
    const [loading, setLoading] = useState(false);

    // 选中的指标缓存键
    const [selectedIndicatorKey, setSelectedIndicatorKey] = useState<string | undefined>(undefined);

    const [isSelectOpen, setIsSelectOpen] = useState(false);

    // 获取策略缓存键
    const fetchCacheKeys = useCallback(async () => {
        setLoading(true);
        try {
            const keys = await getStrategyCacheKeys(strategyId);
            const parsedKeyMap: Record<string, BacktestKlineKey | BacktestIndicatorKey> = {};
            
            keys.forEach(keyString => {
                parsedKeyMap[keyString] = parseKey(keyString) as BacktestKlineKey | BacktestIndicatorKey;
            });
            
            setCacheKeys(parsedKeyMap);
        } catch (error) {
            console.error('获取缓存键失败:', error);
        } finally {
            setLoading(false);
        }
    }, [strategyId]);

    // 计算可添加的指标选项（允许多次添加）
    const availableIndicatorOptions = useMemo((): IndicatorOption[] => {
        if (!chartConfig.klineChartConfig.klineKeyStr || !cacheKeys[chartConfig.klineChartConfig.klineKeyStr]) return [];
        
        const selectedKlineCacheKey = cacheKeys[chartConfig.klineChartConfig.klineKeyStr] as BacktestKlineKey;
        const options: IndicatorOption[] = [];
        
        Object.entries(cacheKeys).forEach(([key, value]) => {
            if (key.startsWith("backtest_indicator|")) {
                const indicatorData = value as BacktestIndicatorKey;
                
                // 确保交易所、交易对和时间周期完全一致（移除已添加的指标过滤）
                if (
                    indicatorData.exchange === selectedKlineCacheKey.exchange &&
                    indicatorData.symbol === selectedKlineCacheKey.symbol &&
                    indicatorData.interval === selectedKlineCacheKey.interval
                ) {
                    const label = `${indicatorData.indicatorType.toUpperCase()} (${indicatorData.indicatorConfig.period})`;
                    options.push({
                        key,
                        label,
                        data: indicatorData
                    });
                }
            }
        });
        
        return options;
    }, [cacheKeys, chartConfig.klineChartConfig.klineKeyStr]);

    // 当dialog打开时获取缓存数据并重置选择
    useEffect(() => {
        if (open) {
            fetchCacheKeys();
            setSelectedIndicatorKey(""); // 重置选择
        }
    }, [open, fetchCacheKeys]);

    // 处理添加指标
    const handleAddIndicator = () => {
        if (selectedIndicatorKey) {
            const indicatorData = cacheKeys[selectedIndicatorKey] as BacktestIndicatorKey;
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
        setSelectedIndicatorKey("");
        onOpenChange(false);
    };

    // 渲染指标选项
    const renderIndicatorOption = (option: IndicatorOption) => (
        <div className="flex items-center gap-2">
            <Badge variant="outline">{option.data.indicatorType.toUpperCase()}</Badge>
            <span className="font-medium">周期: {option.data.indicatorConfig.period}</span>
        </div>
    );

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
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-gray-500">正在加载指标数据...</div>
                    </div>
                ) : (
                    <>
                        {availableIndicatorOptions.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">选择指标</label>
                                    <Select
                                        value={selectedIndicatorKey}
                                        onValueChange={(value) => {
                                            setIsSelectOpen(false);
                                            setSelectedIndicatorKey(value);
                                        }}
                                        open={isSelectOpen}
                                        onOpenChange={(open) => {
                                            setIsSelectOpen(open);
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="选择要添加的指标">
                                                {selectedIndicatorKey && cacheKeys[selectedIndicatorKey] && 
                                                    renderIndicatorOption({
                                                        key: selectedIndicatorKey,
                                                        label: "",
                                                        data: cacheKeys[selectedIndicatorKey] as BacktestIndicatorKey
                                                    })}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent
                                            className="max-h-[200px] overflow-y-auto min-w-[300px] max-w-[400px]"
                                            onCloseAutoFocus={(e) => {
                                                e.preventDefault();
                                            }}
                                            onPointerDownOutside={() => {
                                                setIsSelectOpen(false);
                                            }}
                                        >
                                            {availableIndicatorOptions.map((option) => (
                                                <SelectItem key={option.key} value={option.key}>
                                                    {renderIndicatorOption(option)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-8 text-gray-500">
                                {chartConfig.klineChartConfig.klineKeyStr 
                                    ? "该交易对暂无可用指标"
                                    : "请先选择交易对"
                                }
                            </div>
                        )}
                    </>
                )}
            </div>
        </Dialog>
    );
}
