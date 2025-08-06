import { useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { chartOptions } from "./chart-config";
import { useBacktestChart } from "@/hooks/chart";
import { useIndicatorLegend } from "@/hooks/chart";
import { useSubchartIndicatorLegend } from "@/hooks/chart/use-subchart-indicator-legend";
import { KlineLegend } from "./kline-legend";
import { IndicatorLegend } from "./indicator-legend";
import { useBacktestChartStore } from "./backtest-chart-store";
import { CandlestickData } from "lightweight-charts";
import { useKlineLegend } from "@/hooks/chart/use-kline-legend";


interface BacktestChartNewProps {
    strategyId: number;
    chartId: number
}

const BacktestChartNew = ({ strategyId, chartId }: BacktestChartNewProps) => {
    console.log("图表刷新了");

    // 图表容器的引用
    const chartContainerRef = useRef<HTMLDivElement>(null);

    


    // 使用 backtest chart hooks
    const { chartConfig, klineLegendData: legendData } = useBacktestChart({
        strategyId,
        chartId,
        chartContainerRef,
        chartOptions,
    });

	return (
        <div className="relative w-full h-full">
            {/* 图表容器div */}
            <div ref={chartContainerRef} id="chart-container" className="w-full h-full" />

            {/* K线图例 */}
            <KlineLegend
                klineSeriesData={legendData}
                klineKeyStr={chartConfig.klineChartConfig.klineKeyStr}
                chartId={chartId}
            />

            {/* 主图指标图例 */}
            {chartConfig.indicatorChartConfigs
                .filter(indicatorConfig => indicatorConfig.isInMainChart)
                .map((indicatorConfig, index) => {
                    // 为每个主图指标创建对应的 legend hooks
                    const MainChartIndicatorLegendComponent = () => {
                        const { legendData: indicatorLegendData, onCrosshairMove } = useIndicatorLegend({
                            chartId,
                            indicatorKeyStr: indicatorConfig.indicatorKeyStr,
                        });

                        // 订阅图表的鼠标移动事件
                        const { getChartRef } = useBacktestChartStore(chartId);
                        useEffect(() => {
                            const chart = getChartRef();
                            if (!chart || !onCrosshairMove) return;

                            // 订阅鼠标移动事件
                            chart.subscribeCrosshairMove(onCrosshairMove);

                            // 清理函数：取消订阅
                            return () => {
                                chart.unsubscribeCrosshairMove(onCrosshairMove);
                            };
                        }, [getChartRef, onCrosshairMove]);

                        return (
                            <IndicatorLegend
                                indicatorLegendData={indicatorLegendData}
                                indicatorKeyStr={indicatorConfig.indicatorKeyStr}
                                chartId={chartId}
                                style={{
                                    // 主图指标：从40px开始，每个间隔30px
                                    top: `${40 + index * 30}px`,
                                    left: '0px',
                                }}
                            />
                        );
                    };

                    return <MainChartIndicatorLegendComponent key={indicatorConfig.indicatorKeyStr} />;
                })}

            {/* 子图指标图例 - 使用专门的 hook 渲染到对应的 Pane 中 */}
            {chartConfig.indicatorChartConfigs
                .filter(config => !config.isInMainChart)
                .map((indicatorConfig) => {
                    // 子图指标使用专门的 hook 渲染到 Pane 中
                    const SubChartIndicatorLegend = () => {
                        useSubchartIndicatorLegend({
                            chartId,
                            indicatorKeyStr: indicatorConfig.indicatorKeyStr,
                        });

                        // 这个组件本身不渲染任何内容，legend 会被渲染到 Pane 中
                        return null;
                    };

                    return <SubChartIndicatorLegend key={indicatorConfig.indicatorKeyStr} />;
                })}
        </div>
    );
};

export default BacktestChartNew;