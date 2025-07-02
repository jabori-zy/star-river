import { SciChartReact, TResolvedReturnType } from "scichart-react";
import { AxisBase2D, SciChartSurface } from "scichart";
import React, { useEffect, useRef } from "react";
import { initKlineChart } from "./init-kline-chart";
import { Kline } from "@/types/kline";
import { IndicatorValue } from "@/types/indicator";
import { useBacktestKlineDataStore } from "@/store/backtest-replay-store/use-backtest-kline-store";
import { useBacktestIndicatorDataStore } from "@/store/backtest-replay-store/use-backtest-indicator-store";


interface KlineChartProps {
    chartId: number;
    klineKeyStr: string;
    indicatorKeyStrs: string[];
    setMainChart: (sciChartSurface: SciChartSurface) => void;
    addAxis: (axis: AxisBase2D) => void;
    addSurfaceToGroup: (surface: SciChartSurface) => void;
}


export default function KlineChart({ klineKeyStr, indicatorKeyStrs, setMainChart, addAxis, addSurfaceToGroup }: KlineChartProps) {
    
    const latestKline = useBacktestKlineDataStore(
        state => state.getLatestKlineData(klineKeyStr) as Kline
    );

    const chartControlsRef = useRef<{
        setData: (symbolName: string, kline: Kline[]) => void;
        onNewKlineData: (newKline: Kline) => void;
        setXRange: (startDate: Date, endDate: Date) => void;
        onNewIndicatorData: (newIndicators: Record<string, IndicatorValue>) => void;   
    }>(undefined);

    // 处理数据更新
    useEffect(() => {
        // 如果没有最新数据，则不进行更新
        if (!latestKline) return;

        console.log("chartControlsRef.current", chartControlsRef.current);
        // 取最新一条数据
        if (chartControlsRef.current) {
            console.log("latestKlineData", latestKline);
            
            // 直接在 effect 内获取最新的指标数据，避免组件级状态依赖
            const store = useBacktestIndicatorDataStore.getState();
            const latestIndicatorData: Record<string, IndicatorValue> = {};
            
            indicatorKeyStrs.forEach(indicatorKeyStr => {
                const data = store.getLatestIndicatorData(indicatorKeyStr) as IndicatorValue;
                if (data) {
                    latestIndicatorData[indicatorKeyStr] = data;
                }
            });
            
            console.log("latestIndicatorData", latestIndicatorData);
            
            chartControlsRef.current.onNewKlineData(latestKline);
            chartControlsRef.current.onNewIndicatorData(latestIndicatorData);
        }
    }, [latestKline, indicatorKeyStrs]);
    

    return (
        <SciChartReact
            initChart={(rootElement: string | HTMLDivElement) => initKlineChart(rootElement, indicatorKeyStrs)}
            style={{ flexBasis: 400, flexGrow: 0, flexShrink: 1 }}
            onInit={(initResult: TResolvedReturnType<typeof initKlineChart>) => {
                const { sciChartSurface, controls } = initResult;
                setMainChart(sciChartSurface);
                chartControlsRef.current = controls;
                // axisSynchroniserRef.current.addAxis(sciChartSurface.xAxes.get(0));
                addAxis(sciChartSurface.xAxes.get(0));
                // verticalGroupRef.current.addSurfaceToGroup(sciChartSurface);
                addSurfaceToGroup(sciChartSurface);

            }}
        />
    );
}
