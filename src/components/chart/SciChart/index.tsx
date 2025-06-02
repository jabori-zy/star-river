import { ESeriesType, EThemeProviderType, ISciChart2DDefinition } from "scichart";
import { createCandlestickChart, sciChartOverview } from "./createCandlestickChart";
import { TPriceBar } from "./createCandlestickChart";
import { ExampleDataProvider } from "./exampleDataProvider";
import { Observable } from "rxjs";
import { binanceSocketClient } from "./binanceSocketClient";
import { useState, useRef, useCallback } from "react";
import { SciChartReact, SciChartNestedOverview, TResolvedReturnType } from "scichart-react";
import { useBacktestStrategyDataStore } from "@/store/useBacktestStrategyDataStore";
import { useEffect } from "react";

export type TRealtimePriceBar = {
    symbol: string;
    interval: string;
    eventTime: number;
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number; // Total volume
    closeTime: number;
    lastTradeSize: number; // Last trade size
    lastTradeBuyOrSell: boolean; // When true, buy, else sell
};

export const drawChart = () => async (rootElement: string | HTMLDivElement) => {
    const { sciChartSurface, controls } = await createCandlestickChart(rootElement);

    const endDate = new Date(Date.now());
    const startDate = new Date();
    startDate.setMinutes(endDate.getMinutes() - 300);
    
    const priceBar = ExampleDataProvider.getRandomCandles(300, 60000, startDate, 60);


    return { 
        sciChartSurface, 
        // subscription, 
        controls 
    };
};


export default function RealtimeTickingStockCharts() {
    const latestKlineData = useBacktestStrategyDataStore(
        state => state.getLatestData('history_kline|metatrader5(Exness-MT5Trial5)|BTCUSDm|1m|2025-05-30|2025-05-31')
    );

    // 处理数据更新
    useEffect(() => {
        if (!latestKlineData || latestKlineData.length === 0) return;
        // 取最新一条数据
        // 这里需要把你的数据格式转换成 TPriceBar 格式
        if (chartControlsRef.current) {
            chartControlsRef.current.onNewTrade({
                date: latestKlineData[0], 
                open: latestKlineData[1],
                high: latestKlineData[2],
                low: latestKlineData[3],
                close: latestKlineData[4],
                volume: latestKlineData[5],
            });
        }
    }, [latestKlineData]);

    const chartControlsRef = useRef<{
        setData: (symbolName: string, priceBars: TPriceBar[]) => void;
        onNewTrade: (priceBar: TPriceBar) => void;
        setXRange: (startDate: Date, endDate: Date) => void;
    }>(undefined);

    const initFunc = drawChart();

    return (
            <SciChartReact
                key={"realtime-ticking-stock-charts"}
                initChart={initFunc}
                onInit={(initResult: TResolvedReturnType<typeof initFunc>) => {
                    const { controls } = initResult;
                    chartControlsRef.current = controls;
                    // const { subscription, controls } = initResult;
                    // chartControlsRef.current = controls;

                    // return () => {
                    //     subscription.unsubscribe();
                    // };
                }}
                style={{ display: "flex", flexDirection: "column", width: "100%", flex: "auto" }}
                innerContainerProps={{ style: { flexBasis: "80%", flexGrow: 1, flexShrink: 1 } }}
            >
                <SciChartNestedOverview
                    style={{ flexBasis: "3%", flexGrow: 1, flexShrink: 1 }}
                    options={sciChartOverview}
                />
            </SciChartReact>
    );
}