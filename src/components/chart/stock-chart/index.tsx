import { SciChartSurface, SciChartVerticalGroup, NumberRange, AxisBase2D } from "scichart";
import { SciChartReact, SciChartNestedOverview, TResolvedReturnType } from "scichart-react";
import React, { useEffect, useRef, useState } from "react";
import { ChartGroupLoader } from "./chart-group-loader";
import { useBacktestStrategyMarketDataStore } from "@/store/useBacktestStrategyDataStore";
import { Kline } from "@/types/kline";
import { AxisSynchroniser } from "./axis-synchroniser";
import { initKlineChart } from "./kline-chart/init-kline-chart";
import initTestChart from "./indicator-chart/init-test-chart";
import KlineChart from "./kline-chart";
import IndicatorChart from "./indicator-chart";
import { getIndicatorChartConfig } from "@/types/indicator/indicator-chart-config";
import { drawOverview } from "./utils";

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

    // console.log("mainChartIndicatorKeyStrs", mainChartIndicatorKeyStrs);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <ChartGroupLoader onInit={() => {}}>
                <KlineChart
                    chartId={chartId}
                    klineKeyStr={klineKeyStr}
                    indicatorKeyStrs={mainChartIndicatorKeyStrs}
                    setMainChart={setMainChart}
                    addAxis={handleAddAxis}
                    addSurfaceToGroup={handleAddSurfaceToGroup}
                />
                {/* 分界线 用于分割主图和子图 宽度为1px 颜色为gray-500 */}
                <div className="w-full h-1 bg-gray-500" />

                {/*动态渲染指标子图*/}
                {subChartIndicatorKeyStrs.map((indicatorKeyStr, index) => (
                    <IndicatorChart
                        key={`indicator-${index}-${indicatorKeyStr}`}
                        indicatorKeyStr={indicatorKeyStr}
                        indicatorName={`指标${index + 1}`}
                        addSurfaceToGroup={handleAddSurfaceToGroup}
                        addAxis={handleAddAxis}
                    />
                ))}
                {/* Panel hosting the overview control */}
                {/* <div style={{ flexBasis: "70px" }}>
                    {mainChart ? (
                        <SciChartReact
                            initChart={drawOverview(mainChart)}
                            style={{ width: "100%", height: "100%" }}
                        />
                    ) : null}
                </div> */}
            </ChartGroupLoader>
        </div>
    );
}
