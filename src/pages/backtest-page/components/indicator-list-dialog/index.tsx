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
import { BacktestKlineCacheKey, BacktestIndicatorCacheKey } from "@/types/cache";
import { getStrategyCacheKeys } from "@/service/strategy";
import { parseCacheKey } from "@/utils/parseCacheKey";

interface IndicatorListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    strategyId: number;
    selectedKlineCacheKeyStr: string;
    selectedIndicatorKeys: string[];
    onIndicatorAdd: (indicatorKey: string) => void;
}

interface IndicatorOption {
    key: string;
    label: string;
    data: BacktestIndicatorCacheKey;
}

export default function IndicatorListDialog({
    open,
    onOpenChange,
    strategyId,
    selectedKlineCacheKeyStr,
    selectedIndicatorKeys,
    onIndicatorAdd
}: IndicatorListDialogProps) {
    const [cacheKeys, setCacheKeys] = useState<Record<string, BacktestKlineCacheKey | BacktestIndicatorCacheKey>>({});
    const [loading, setLoading] = useState(false);
    const [selectedIndicatorKey, setSelectedIndicatorKey] = useState<string>("");
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

    // 计算可添加的指标选项（排除已添加的指标）
    const availableIndicatorOptions = useMemo((): IndicatorOption[] => {
        if (!selectedKlineCacheKeyStr || !cacheKeys[selectedKlineCacheKeyStr]) return [];
        
        const selectedKlineCacheKey = cacheKeys[selectedKlineCacheKeyStr] as BacktestKlineCacheKey;
        const options: IndicatorOption[] = [];
        
        Object.entries(cacheKeys).forEach(([key, value]) => {
            if (key.startsWith("backtest_indicator|")) {
                const indicatorData = value as BacktestIndicatorCacheKey;
                
                // 确保交易所、交易对和时间周期完全一致，并且未被添加
                if (
                    indicatorData.exchange === selectedKlineCacheKey.exchange &&
                    indicatorData.symbol === selectedKlineCacheKey.symbol &&
                    indicatorData.interval === selectedKlineCacheKey.interval &&
                    !selectedIndicatorKeys.includes(key) // 排除已添加的指标
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
    }, [cacheKeys, selectedKlineCacheKeyStr, selectedIndicatorKeys]);

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
            onIndicatorAdd(selectedIndicatorKey);
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
                                <div className="grid gap-3">
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
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    {selectedKlineCacheKeyStr 
                                        ? selectedIndicatorKeys.length > 0 
                                            ? "该交易对的所有指标都已添加"
                                            : "该交易对暂无可用指标"
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
                        disabled={!selectedIndicatorKey}
                    >
                        添加指标
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
