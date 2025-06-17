import React from "react";
import { IndicatorNodeData, IndicatorNodeBacktestExchangeConfig } from "@/types/node/indicator-node";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IndicatorItem } from "./index";

interface BacktestModeShowProps {
    data: IndicatorNodeData;
}

// 获取时间周期的中文标签
const getIntervalLabel = (interval: string) => {
    const intervalMap: Record<string, string> = {
        '1m': '1分钟',
        '5m': '5分钟',
        '15m': '15分钟',
        '30m': '30分钟',
        '1h': '1小时',
        '4h': '4小时',
        '1d': '1天',
        '1w': '1周',
    };
    return intervalMap[interval] || interval;
};

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ data }) => {
    const exchangeConfig = data?.backtestConfig?.exchangeConfig as IndicatorNodeBacktestExchangeConfig;
    
    return (
        <div className="space-y-3">
            {/* 指标信息 */}
            <div className="space-y-2">
                {!exchangeConfig?.selectedIndicators || exchangeConfig.selectedIndicators.length === 0 ? (
                    <div className="flex items-center justify-between gap-2 rounded-md">
                        <Label className="text-sm font-bold text-muted-foreground">计算指标</Label>
                        <span className="text-sm text-red-500">未配置</span>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm font-bold text-muted-foreground">计算指标</Label>
                            <Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
                                {exchangeConfig.selectedIndicators.length}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                            {exchangeConfig.selectedIndicators.map((indicator, index) => (
                                <IndicatorItem
                                    key={`${indicator.type}-${index}`}
                                    indicator={indicator}
                                    handleId={`${indicator.type}-${index}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* k线信息 */}
            <div className="space-y-2">
                {!exchangeConfig?.exchange || !exchangeConfig?.symbol || !exchangeConfig?.interval ? (
                    <div className="flex items-center justify-between gap-2 rounded-md">
                        <Label className="text-sm font-bold text-muted-foreground">数据源</Label>
                        <span className="text-sm text-red-500">未配置</span>
                    </div>
                ) : (
                    <div>
                        <Label className="text-sm font-bold text-muted-foreground">数据源</Label>
                        <div className="flex flex-col gap-2 bg-gray-100 p-2 rounded-md mt-1">
                            <div className="flex flex-row items-center justify-between gap-2 pr-2">
                                <span className="text-xs font-bold">交易所:</span>
                                <span className="text-xs">{exchangeConfig.exchange}</span>
                            </div>
                            <div className="flex flex-row items-center justify-between gap-2 pr-2">
                                <span className="text-xs font-bold">交易对:</span>
                                <span className="text-xs">{exchangeConfig.symbol}</span>
                            </div>
                            <div className="flex flex-row items-center justify-between gap-2 pr-2">
                                <span className="text-xs font-bold">时间周期:</span>
                                <span className="text-xs">{getIntervalLabel(exchangeConfig.interval)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            
        </div>
    );
}

export default BacktestModeShow;