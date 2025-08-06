import React, { useEffect } from "react";
import BacktestChartNew from "@/components/chart/backtest-chart-new";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorChartConfig } from "@/types/chart";
import { SeriesType } from "@/types/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TestNewChartDebugger: React.FC = () => {
    const { 
        addChart, 
        addIndicator, 
        getChartConfig,
        chartConfig: strategyChartConfig 
    } = useBacktestChartConfigStore();

    // 测试用的图表ID和策略ID
    const testChartId = 999;
    const testStrategyId = 1;

    // 初始化测试图表配置
    useEffect(() => {
        // 检查是否已经有测试图表
        const existingChart = getChartConfig(testChartId);
        if (!existingChart) {
            // 创建测试图表
            addChart("symbol:BTCUSDT|interval:1m", "调试器测试图表");
            
            // 添加一些测试指标
            setTimeout(() => {
                // 主图指标 - MA20
                const ma20Config: IndicatorChartConfig = {
                    indicatorKeyStr: "symbol:BTCUSDT|interval:1m|indicator:MA|params:{\"period\":20}",
                    isInMainChart: true,
                    isDelete: false,
                    seriesConfigs: [{
                        name: "MA20",
                        type: SeriesType.LINE,
                        indicatorValueKey: "value",
                        color: "#FF6B6B",
                        lineWidth: 2,
                        visible: true
                    }]
                };

                // 主图指标 - MA50
                const ma50Config: IndicatorChartConfig = {
                    indicatorKeyStr: "symbol:BTCUSDT|interval:1m|indicator:MA|params:{\"period\":50}",
                    isInMainChart: true,
                    isDelete: false,
                    seriesConfigs: [{
                        name: "MA50",
                        type: SeriesType.LINE,
                        indicatorValueKey: "value",
                        color: "#4ECDC4",
                        lineWidth: 2,
                        visible: true
                    }]
                };

                // 子图指标 - RSI
                const rsiConfig: IndicatorChartConfig = {
                    indicatorKeyStr: "symbol:BTCUSDT|interval:1m|indicator:RSI|params:{\"period\":14}",
                    isInMainChart: false,
                    isDelete: false,
                    seriesConfigs: [{
                        name: "RSI",
                        type: SeriesType.LINE,
                        indicatorValueKey: "value",
                        color: "#9B59B6",
                        lineWidth: 2,
                        visible: true
                    }]
                };

                // 子图指标 - MACD
                const macdConfig: IndicatorChartConfig = {
                    indicatorKeyStr: "symbol:BTCUSDT|interval:1m|indicator:MACD|params:{\"fastPeriod\":12,\"slowPeriod\":26,\"signalPeriod\":9}",
                    isInMainChart: false,
                    isDelete: false,
                    seriesConfigs: [
                        {
                            name: "MACD",
                            type: SeriesType.LINE,
                            indicatorValueKey: "macd",
                            color: "#E74C3C",
                            lineWidth: 2,
                            visible: true
                        },
                        {
                            name: "Signal",
                            type: SeriesType.LINE,
                            indicatorValueKey: "signal",
                            color: "#3498DB",
                            lineWidth: 2,
                            visible: true
                        },
                        {
                            name: "Histogram",
                            type: SeriesType.COLUMN,
                            indicatorValueKey: "histogram",
                            color: "#95A5A6",
                            lineWidth: 1,
                            visible: true
                        }
                    ]
                };

                // 子图指标 - Volume
                const volumeConfig: IndicatorChartConfig = {
                    indicatorKeyStr: "symbol:BTCUSDT|interval:1m|indicator:VOLUME|params:{}",
                    isInMainChart: false,
                    isDelete: false,
                    seriesConfigs: [{
                        name: "Volume",
                        type: SeriesType.COLUMN,
                        indicatorValueKey: "value",
                        color: "#F39C12",
                        lineWidth: 1,
                        visible: true
                    }]
                };

                // 添加指标到图表
                addIndicator(testChartId, ma20Config);
                addIndicator(testChartId, ma50Config);
                addIndicator(testChartId, rsiConfig);
                addIndicator(testChartId, macdConfig);
                addIndicator(testChartId, volumeConfig);
            }, 100);
        }
    }, [addChart, addIndicator, getChartConfig]);

    const currentChart = getChartConfig(testChartId);

    return (
        <div className="h-screen flex flex-col p-4 bg-gray-100">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        新图表组件调试器测试
                        <Badge variant="outline">测试环境</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            这个页面用于测试新图表组件的调试器功能。调试面板位于图表右上角。
                        </p>
                        <div className="flex gap-4 text-sm">
                            <div>
                                <span className="font-medium">图表ID:</span> {testChartId}
                            </div>
                            <div>
                                <span className="font-medium">策略ID:</span> {testStrategyId}
                            </div>
                            {currentChart && (
                                <>
                                    <div>
                                        <span className="font-medium">主图指标:</span> {currentChart.indicatorChartConfigs.filter(c => c.isInMainChart && !c.isDelete).length}
                                    </div>
                                    <div>
                                        <span className="font-medium">子图指标:</span> {currentChart.indicatorChartConfigs.filter(c => !c.isInMainChart && !c.isDelete).length}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="mt-4">
                            <h4 className="font-medium mb-2">调试功能测试：</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• 点击右上角的"调试面板 (New)"按钮打开调试器</li>
                                <li>• 测试两种删除方式：🔴 删除配置（推荐）、🟠 只删除Pane（保留配置）</li>
                                <li>• 测试🟣 清空Pane内Series功能</li>
                                <li>• 测试指标可见性控制</li>
                                <li>• 查看控制台输出的调试信息</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex-1">
                <CardContent className="p-0 h-full">
                    {currentChart ? (
                        <BacktestChartNew 
                            strategyId={testStrategyId} 
                            chartId={testChartId} 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">正在初始化图表...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TestNewChartDebugger;
