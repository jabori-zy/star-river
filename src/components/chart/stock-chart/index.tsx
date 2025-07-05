import { SciChartSurface, SciChartVerticalGroup, NumberRange, AxisBase2D } from "scichart";
import { SciChartReact } from "scichart-react";
import React, { useRef, useState } from "react";
import { ChartGroupLoader } from "./chart-group-loader";
import { AxisSynchroniser } from "./axis-synchroniser";
import KlineChart from "./kline-chart";
import IndicatorChart from "./indicator-chart";
import { getIndicatorChartConfig } from "@/types/indicator/indicator-chart-config";
import { drawOverview } from "./utils";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface StockChartsProps {
    chartId: number;
    klineKeyStr: string;
    indicatorKeyStrs: string[];
}

export default function StockCharts({ chartId, klineKeyStr, indicatorKeyStrs }: StockChartsProps) {
    const [mainChart, setMainChart] = useState<SciChartSurface>();

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

    // 计算各个图表的高度占比
    const calculateChartSizes = () => {
        const subChartCount = subChartIndicatorKeyStrs.length;
        
        if (subChartCount === 0) {
            // 只有主图，占满100%
            return { mainChartSize: 100, subChartSize: 0 };
        } else if (subChartCount === 1) {
            // 一个子图：主图80%，子图20%
            return { mainChartSize: 80, subChartSize: 20 };
        } else if (subChartCount === 2) {
            // 两个子图：主图70%，子图各15%
            return { mainChartSize: 70, subChartSize: 15 };
        } else {
            // 三个及以上子图：主图60%，子图平分剩余40%
            const remainingSize = 40;
            const subChartSize = remainingSize / subChartCount;
            return { mainChartSize: 60, subChartSize: subChartSize };
        }
    };

    const { mainChartSize, subChartSize } = calculateChartSizes();

    // 当只有一个k线图时，不需要分界线
    if (subChartIndicatorKeyStrs.length === 0) {
        return (
            <div className="w-full h-full flex flex-col overflow-hidden">
                <ChartGroupLoader onInit={() => {}}>
                    <div className="flex-1">
                        <KlineChart
                            chartId={chartId}
                            klineKeyStr={klineKeyStr}
                            indicatorKeyStrs={mainChartIndicatorKeyStrs}
                            setMainChart={setMainChart}
                            addAxis={handleAddAxis}
                            addSurfaceToGroup={handleAddSurfaceToGroup}
                        />
                    </div>
                    {/* Panel hosting the overview control */}
                    <div style={{ flexBasis: "70px" }}>
                        {mainChart ? (
                            <SciChartReact
                                initChart={drawOverview(mainChart)}
                                style={{ width: "100%", height: "100%" }}
                            />
                        ) : null}
                    </div>
                </ChartGroupLoader>
            </div>
        );
    }

    // 有子图时，使用ResizablePanelGroup
    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <ChartGroupLoader onInit={() => {}}>
                <div className="flex-1">
                    <ResizablePanelGroup direction="vertical" className="h-full">
                        {/* 主图 */}
                        <ResizablePanel defaultSize={mainChartSize} minSize={30}>
                            <KlineChart
                                chartId={chartId}
                                klineKeyStr={klineKeyStr}
                                indicatorKeyStrs={mainChartIndicatorKeyStrs}
                                setMainChart={setMainChart}
                                addAxis={handleAddAxis}
                                addSurfaceToGroup={handleAddSurfaceToGroup}
                            />
                        </ResizablePanel>

                        {/* 子图 */}
                        {subChartIndicatorKeyStrs.map((indicatorKeyStr, index) => (
                            <React.Fragment key={`indicator-${index}-${indicatorKeyStr}`}>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={subChartSize} minSize={10}>
                                    <IndicatorChart
                                        indicatorKeyStr={indicatorKeyStr}
                                        indicatorName={`指标${index + 1}`}
                                        addSurfaceToGroup={handleAddSurfaceToGroup}
                                        addAxis={handleAddAxis}
                                    />
                                </ResizablePanel>
                            </React.Fragment>
                        ))}
                    </ResizablePanelGroup>
                </div>
                {/* Panel hosting the overview control */}
                <div style={{ flexBasis: "70px" }}>
                    {mainChart ? (
                        <SciChartReact
                            initChart={drawOverview(mainChart)}
                            style={{ width: "100%", height: "100%" }}
                        />
                    ) : null}
                </div>
            </ChartGroupLoader>
        </div>
    );
}
