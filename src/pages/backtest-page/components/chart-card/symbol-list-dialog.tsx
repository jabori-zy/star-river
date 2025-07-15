import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BacktestKlineKey, BacktestIndicatorKey } from "@/types/symbol-key";
import { getStrategyCacheKeys } from "@/service/strategy";
import { parseKey } from "@/utils/parse-key";

interface SymbolListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    strategyId: number;
    selectedKlineCacheKeyStr?: string;
    onKlineSelect: (klineCacheKeyStr: string, chartName: string) => void;
}

export default function SymbolListDialog({
    open,
    onOpenChange,
    strategyId,
    selectedKlineCacheKeyStr,
    onKlineSelect
}: SymbolListDialogProps) {
    const [klineOptions, setKlineOptions] = useState<{ key: string; data: BacktestKlineKey }[]>([]);
    const [loading, setLoading] = useState(false);

    // 获取可用的kline数据
    const fetchKlineOptions = useCallback(async () => {
        setLoading(true);
        try {
            const keys = await getStrategyCacheKeys(strategyId);
            const parsedKeyMap: Record<string, BacktestKlineKey | BacktestIndicatorKey> = {};
            
            keys.forEach(keyString => {
                parsedKeyMap[keyString] = parseKey(keyString) as BacktestKlineKey | BacktestIndicatorKey;
            });

            // 过滤出kline选项
            const options: { key: string; data: BacktestKlineKey }[] = [];
            Object.entries(parsedKeyMap).forEach(([key, value]) => {
                if (key.startsWith("backtest_kline|")) {
                    options.push({
                        key,
                        data: value as BacktestKlineKey
                    });
                }
            });
            
            setKlineOptions(options);
        } catch (error) {
            console.error('获取kline选项失败:', error);
        } finally {
            setLoading(false);
        }
    }, [strategyId]);

    // 当dialog打开时获取kline数据
    useEffect(() => {
        if (open) {
            fetchKlineOptions();
        }
    }, [open, fetchKlineOptions]);

    // 处理kline选择
    const handleKlineSelect = (klineCacheKeyStr: string) => {
        // 找到对应的kline数据
        const selectedOption = klineOptions.find(option => option.key === klineCacheKeyStr);
        const chartName = selectedOption 
            ? `${selectedOption.data.symbol} ${selectedOption.data.interval}`
            : klineCacheKeyStr;
        
        onKlineSelect(klineCacheKeyStr, chartName);
        onOpenChange(false);
    };

    // 渲染kline项目
    const renderKlineItem = (klineCacheKey: BacktestKlineKey) => (
        <div className="flex items-center gap-2">
            <Badge variant="outline">{klineCacheKey.exchange}</Badge>
            <span className="font-medium">{klineCacheKey.symbol}</span>
            <Badge variant="secondary">{klineCacheKey.interval}</Badge>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>选择K线数据</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-sm text-gray-500">正在加载K线数据...</div>
                        </div>
                    ) : (
                        <div className="grid gap-2 max-h-96 overflow-y-auto">
                            {klineOptions.map((option) => (
                                <Button
                                    key={option.key}
                                    variant={selectedKlineCacheKeyStr === option.key ? "secondary" : "outline"}
                                    className={`flex items-center justify-start gap-2 h-auto p-3 ${
                                        selectedKlineCacheKeyStr === option.key 
                                            ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" 
                                            : ""
                                    }`}
                                    onClick={() => handleKlineSelect(option.key)}
                                >
                                    {renderKlineItem(option.data)}
                                </Button>
                            ))}
                            {klineOptions.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    暂无可用的K线数据
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
