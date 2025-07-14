import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BacktestKlineCacheKey, BacktestIndicatorCacheKey } from "@/types/cache";
import { getStrategyCacheKeys } from "@/service/strategy";
import { parseCacheKey } from "@/utils/parseCacheKey";
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
    data: BacktestIndicatorCacheKey;
}

export default function IndicatorListDialog({
    chartConfig,
    open,
    onOpenChange,
    strategyId,
    onMainChartIndicatorAdd,
    onSubChartIndicatorAdd
}: IndicatorListDialogProps) {
    const [cacheKeys, setCacheKeys] = useState<Record<string, BacktestKlineCacheKey | BacktestIndicatorCacheKey>>({});
    const [loading, setLoading] = useState(false);

    // 选中的指标缓存键
    const [selectedIndicatorKey, setSelectedIndicatorKey] = useState<string | undefined>(undefined);

    // 主图和副图的勾选状态
    const [isMainChartChecked, setIsMainChartChecked] = useState<boolean>(false);
    const [isSubChartChecked, setIsSubChartChecked] = useState<boolean>(false);

    const [isSelectOpen, setIsSelectOpen] = useState(false);

    // 获取策略缓存键
    const fetchCacheKeys = useCallback(async () => {
        setLoading(true);
        try {
            const keys = await getStrategyCacheKeys(strategyId);
            const parsedKeyMap: Record<string, BacktestKlineCacheKey | BacktestIndicatorCacheKey> = {};
            
            keys.forEach(keyString => {
                parsedKeyMap[keyString] = parseCacheKey(keyString) as BacktestKlineCacheKey | BacktestIndicatorCacheKey;
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
        if (!chartConfig.klineChartConfig.klineCacheKeyStr || !cacheKeys[chartConfig.klineChartConfig.klineCacheKeyStr]) return [];
        
        const selectedKlineCacheKey = cacheKeys[chartConfig.klineChartConfig.klineCacheKeyStr] as BacktestKlineCacheKey;
        const options: IndicatorOption[] = [];
        
        Object.entries(cacheKeys).forEach(([key, value]) => {
            if (key.startsWith("backtest_indicator|")) {
                const indicatorData = value as BacktestIndicatorCacheKey;
                
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
    }, [cacheKeys, chartConfig.klineChartConfig.klineCacheKeyStr]);

    // 当dialog打开时获取缓存数据并重置选择
    useEffect(() => {
        if (open) {
            fetchCacheKeys();
            setSelectedIndicatorKey(""); // 重置选择
            setIsMainChartChecked(false);
            setIsSubChartChecked(false);
        }
    }, [open, fetchCacheKeys]);

    // 当选择指标变化时，根据指标类型设置默认勾选状态
    useEffect(() => {
        if (selectedIndicatorKey && cacheKeys[selectedIndicatorKey]) {
            const indicatorData = cacheKeys[selectedIndicatorKey] as BacktestIndicatorCacheKey;
            const indicatorConfig = INDICATOR_CHART_CONFIG_MAP[indicatorData.indicatorType];
            
            if (indicatorConfig) {
                // 根据配置的 isInMainChart 设置默认勾选
                setIsMainChartChecked(indicatorConfig.isInMainChart);
                setIsSubChartChecked(!indicatorConfig.isInMainChart);
            }
        } else {
            // 重置勾选状态
            setIsMainChartChecked(false);
            setIsSubChartChecked(false);
        }
    }, [selectedIndicatorKey, cacheKeys]);

    // 处理添加指标
    const handleAddIndicator = () => {
        if (selectedIndicatorKey && (isMainChartChecked || isSubChartChecked)) {
            const indicatorData = cacheKeys[selectedIndicatorKey] as BacktestIndicatorCacheKey;
            const indicatorConfig = INDICATOR_CHART_CONFIG_MAP[indicatorData.indicatorType];
            
            if (indicatorConfig) {
                // 根据勾选状态添加指标配置
                const configs: Record<string, IndicatorChartConfig> = {};
                
                // 根据选择添加到主图或副图
                configs[selectedIndicatorKey] = {
                    ...indicatorConfig,
                    isInMainChart: isMainChartChecked
                };

                console.log("configs", configs);
                
                const subChartId = chartConfig.subChartConfigs.length + 1;

                // 添加到主图
                if (isMainChartChecked) {
                    onMainChartIndicatorAdd(chartConfig.id, selectedIndicatorKey, configs[selectedIndicatorKey]);
                } else {
                    // 添加到副图
                    onSubChartIndicatorAdd(chartConfig.id, {
                        mainChartId: chartConfig.id,
                        subChartId: subChartId,
                        indicatorChartConfigs: configs,
                    });
                }
            }
            
            onOpenChange(false);
        }
    };

    // 处理取消
    const handleCancel = () => {
        setSelectedIndicatorKey("");
        setIsMainChartChecked(false);
        setIsSubChartChecked(false);
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>添加指标</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-sm text-gray-500">正在加载指标数据...</div>
                        </div>
                    ) : (
                        <>
                            {availableIndicatorOptions.length > 0 ? (
                                <div className="grid gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">选择指标</label>
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
                                                            data: cacheKeys[selectedIndicatorKey] as BacktestIndicatorCacheKey
                                                        })}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent
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
                                    
                                    {selectedIndicatorKey && (
                                        <div className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center space-x-6">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="main-chart"
                                                        checked={isMainChartChecked}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setIsMainChartChecked(true);
                                                                setIsSubChartChecked(false);
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="main-chart" className="text-sm font-medium">
                                                        添加到主图
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="sub-chart"
                                                        checked={isSubChartChecked}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setIsSubChartChecked(true);
                                                                setIsMainChartChecked(false);
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="sub-chart" className="text-sm font-medium">
                                                        添加到副图
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    {chartConfig.klineChartConfig.klineCacheKeyStr 
                                        ? "该交易对暂无可用指标"
                                        : "请先选择交易对"
                                    }
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                        取消
                    </Button>
                    <Button 
                        onClick={handleAddIndicator}
                        disabled={!selectedIndicatorKey || (!isMainChartChecked && !isSubChartChecked)}
                    >
                        添加指标
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
