import { SciChartSurface, SciChartVerticalGroup, NumberRange, AxisBase2D } from "scichart";
import { SciChartReact, SciChartNestedOverview, TResolvedReturnType } from "scichart-react";
import React, { useEffect, useRef, useState } from "react";
import { ChartGroupLoader } from "./chart-group-loader";
import { useBacktestStrategyMarketDataStore } from "@/store/useBacktestStrategyDataStore";
import { Kline } from "@/types/kline";
import { AxisSynchroniser } from "./axis-synchroniser";
import { initKlineChart } from "./kline-chart/init-kline-chart";
import initTestChart from "./test-chart/init-test-chart";
import KlineChart from "./kline-chart";
import TestChart from "./test-chart";
import { getIndicatorChartConfig } from "@/types/indicator/indicator-chart-config";

interface StockChartsProps {
    chartId: number;
    klineKeyStr: string;
    indicatorKeyStrs: string[];
}

export default function StockCharts({ chartId, klineKeyStr, indicatorKeyStrs }: StockChartsProps) {
    const [mainChart, setMainChart] = useState<SciChartSurface>();
    // const [createChart] = useState(createChartApi);

    // 图表组
    const verticalGroupRef = useRef<SciChartVerticalGroup>(new SciChartVerticalGroup());
    const axisSynchroniserRef = React.useRef<AxisSynchroniser>(new AxisSynchroniser(new NumberRange(200, 500)));

    const chartControlsRef = useRef<{
        setData: (symbolName: string, kline: Kline[]) => void;
        onNewTrade: (newKline: Kline) => void;
        setXRange: (startDate: Date, endDate: Date) => void;
    }>(undefined);

    const handleAddAxis = (axis: AxisBase2D) => {
        axisSynchroniserRef.current.addAxis(axis);
    }

    const handleAddSurfaceToGroup = (surface: SciChartSurface) => {
        verticalGroupRef.current.addSurfaceToGroup(surface);
    }

    // 主图指标
    const mainChartIndicatorKeyStrs = indicatorKeyStrs.filter(indicatorKeyStr => getIndicatorChartConfig(indicatorKeyStr)?.isInMainChart);
    // 子图指标
    const subChartIndicatorKeyStrs = indicatorKeyStrs.filter(indicatorKeyStr => !getIndicatorChartConfig(indicatorKeyStr)?.isInMainChart);

    console.log("mainChartIndicatorKeyStrs", mainChartIndicatorKeyStrs);

    return (
        <ChartGroupLoader onInit={() => {}}>
            <div>
                {/*The panel hosting the price chart*/}
                {/* <SciChartReact
                    initChart={initKlineChart}
                    style={{ flexBasis: 400, flexGrow: 0, flexShrink: 1 }}
                    onInit={(initResult: TResolvedReturnType<typeof initKlineChart>) => {
                        const { sciChartSurface, controls } = initResult;
                        setMainChart(sciChartSurface);
                        chartControlsRef.current = controls;
                        axisSynchroniserRef.current.addAxis(sciChartSurface.xAxes.get(0));
                        verticalGroupRef.current.addSurfaceToGroup(sciChartSurface);
                    }}
                /> */}
                <KlineChart
                    chartId={chartId}
                    klineKeyStr={klineKeyStr}
                    indicatorKeyStrs={mainChartIndicatorKeyStrs}
                    setMainChart={setMainChart}
                    addAxis={handleAddAxis}
                    addSurfaceToGroup={handleAddSurfaceToGroup}
                />
                {/*动态渲染指标子图*/}
                {subChartIndicatorKeyStrs.map((indicatorKeyStr, index) => (
                    <TestChart
                        key={`indicator-${index}-${indicatorKeyStr}`}
                        indicatorKeyStr={indicatorKeyStr}
                        indicatorName={`指标${index + 1}`}
                        addSurfaceToGroup={handleAddSurfaceToGroup}
                        addAxis={handleAddAxis}
                    />
                ))}
                {/* <SciChartReact
                    initChart={initTestChart}
                    style={{ flexBasis: 100, flexGrow: 1, flexShrink: 1 }}
                    onInit={(initResult: TResolvedReturnType<typeof initTestChart>) => {
                        const { sciChartSurface } = initResult;
                        verticalGroupRef.current.addSurfaceToGroup(sciChartSurface);
                        axisSynchroniserRef.current.addAxis(sciChartSurface.xAxes.get(0));
                    }}
                /> */}
                {/* Panel hosting the overview control */}
                {/* <div style={{ flexBasis: "70px" }}>
                    {mainChart ? (
                        <SciChartReact
                            initChart={createChart.drawOverview(mainChart)}
                            style={{ width: "100%", height: "100%" }}
                        />
                    ) : null}
                </div> */}
            </div>
        </ChartGroupLoader>
    );
}
