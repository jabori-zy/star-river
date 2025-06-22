import React from "react";
import {KlineNodeBacktestConfig} from "@/types/node/kline-node"
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SymbolItem } from "../index";

interface BacktestModeShowProps {
    backtestConfig: KlineNodeBacktestConfig;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ backtestConfig }) => {
    const selectedDataSource = backtestConfig?.exchangeConfig?.selectedAccount;
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
                {!timeRange.startDate || !timeRange.endDate ? (
                    <div className="flex items-center justify-between gap-2 rounded-md">
                        <Label className="text-xm font-bold text-muted-foreground">回测时间范围</Label>
                        <span className="text-sm text-red-500">未配置</span>
                    </div>
                ) : (
                    <div>
                        <Label className="text-xm font-bold text-muted-foreground">回测时间范围</Label>
                        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md mt-1">
                            <span className="text-xs">{timeRange.startDate} ~ {timeRange.endDate}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BacktestModeShow;