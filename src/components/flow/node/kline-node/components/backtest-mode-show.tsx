import React from "react";
import {KlineNodeBacktestConfig, SelectedSymbol} from "@/types/node/kline-node"
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock } from "lucide-react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";

interface BacktestModeShowProps {
    backtestConfig: KlineNodeBacktestConfig;
}

// 时间周期选项映射
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

function SymbolItem({ symbol }: { symbol: SelectedSymbol }) {
    return (
        <div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative">
            <div className="flex items-center gap-2 ">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{symbol.symbol}</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{getIntervalLabel(symbol.interval)}</span>
            </div>
            <BaseHandle
                id={symbol.handleId}
                type="source"
                position={Position.Right}
                handleColor="!bg-red-400"
                className="translate-x-2 -translate-y-0.75"
            />
        </div>
    )
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ backtestConfig }) => {
    const selectedDataSource = backtestConfig?.exchangeConfig?.selectedDataSource;
    const selectedSymbols = backtestConfig?.exchangeConfig?.selectedSymbols || [];
    const timeRange = backtestConfig?.exchangeConfig?.timeRange || { startDate: "", endDate: "" };

    return (
        <div className="space-y-2">
            {/* 交易对展示 */}
            <div className="space-y-2">
                {selectedSymbols.length === 0 ? (
                    <div className="flex items-center justify-between gap-2 rounded-md">
                        <Label className="text-xm font-bold text-muted-foreground">交易对</Label>
                        <span className="text-sm text-red-500">未配置</span>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-2">
                            <Label className="text-xm font-bold text-muted-foreground">交易对</Label>
                            <Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
                                {selectedSymbols.length}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                            {selectedSymbols.map((symbol, index) => (
                                <SymbolItem key={`${symbol.symbol}-${symbol.interval}-${index}`} symbol={symbol} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 数据源展示 */}
            <div className="space-y-2">
                {!selectedDataSource || !selectedDataSource.accountName ? (
                    <div className="flex items-center justify-between gap-2 rounded-md">
                        <Label className="text-xm font-bold text-muted-foreground">数据源</Label>
                        <span className="text-sm text-red-500">未配置</span>
                    </div>
                ) : (
                    <div>
                        <Label className="text-xm font-bold text-muted-foreground">数据源</Label>
                        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md mt-1">
                            <span className="text-xs">{selectedDataSource.accountName} ({selectedDataSource.exchange})</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <Label className="text-xm font-bold text-muted-foreground">回测时间范围</Label>
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md mt-1">
                    <span className="text-xs">{timeRange.startDate} ~ {timeRange.endDate}</span>
                </div>
            </div>
        </div>
    )
}

export default BacktestModeShow;