import { ESeriesType, EThemeProviderType, ISciChart2DDefinition } from "scichart";
import { createCandlestickChart, sciChartOverview } from "./createCandlestickChart";

import { ExampleDataProvider } from "./exampleDataProvider";
import { Observable } from "rxjs";
import { binanceSocketClient } from "./binanceSocketClient";
import { useState, useRef, useCallback } from "react";
import { SciChartReact, SciChartNestedOverview, TResolvedReturnType } from "scichart-react";
import { useBacktestStrategyMarketDataStore } from "@/store/useBacktestStrategyDataStore";
import { useEffect } from "react";
import { Kline } from "@/types/kline";
import { drawKlineChart } from "./kline-chart/init-kline-chart";

interface RealtimeTickingStockChartsProps {
    chartId: number;
    klineCacheKeyStr: string;
    indicatorCacheKeyStrs: string[];
}

export default function RealtimeTickingStockCharts({ chartId, klineCacheKeyStr, indicatorCacheKeyStrs }: RealtimeTickingStockChartsProps) {
    // 获取最新K线数据
    const latestKlineData = useBacktestStrategyMarketDataStore(
        state => state.getLatestMarketData(klineCacheKeyStr)
    );

    const chartControlsRef = useRef<{
        setData: (symbolName: string, kline: Kline[]) => void;
        onNewTrade: (newKline: Kline) => void;
        setXRange: (startDate: Date, endDate: Date) => void;
    }>(undefined);

    // 处理数据更新
    useEffect(() => {
        // 如果最新K线数据为空，则不进行更新
        if (!latestKlineData || latestKlineData.length === 0) return;
        // 取最新一条数据
        if (chartControlsRef.current) {
            chartControlsRef.current.onNewTrade({
                timestamp: latestKlineData[0], 
                open: latestKlineData[1],
                high: latestKlineData[2],
                low: latestKlineData[3],
                close: latestKlineData[4],
                volume: latestKlineData[5],
            });
        }
    }, [latestKlineData]);

    

    const initFunc = drawKlineChart();  

    return (
            <SciChartReact
                key={"realtime-ticking-stock-charts"}
                initChart={initFunc}
                onInit={(initResult: TResolvedReturnType<typeof initFunc>) => {
                    const { controls } = initResult;
                    chartControlsRef.current = controls;
                }}
                style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}
                innerContainerProps={{ style: { flex: "1", minHeight: 0 } }}
            >
                <SciChartNestedOverview
                    style={{ height: "72px", flexShrink: 0 }}
                    options={sciChartOverview}
                />
            </SciChartReact>
    );
}