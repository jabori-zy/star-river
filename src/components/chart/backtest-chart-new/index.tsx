import { useRef } from "react";
import { chartOptions } from "./chart-config";
import { useBacktestChart } from "@/hooks/chart";
import { useIndicatorLegend } from "@/hooks/chart";
import { SubchartIndicatorLegend } from "./subchart-indicator-legend";
import { KlineLegend } from "./kline-legend";
import { IndicatorLegend } from "./indicator-legend";


interface BacktestChartNewProps {
    strategyId: number;
    chartId: number
}

const BacktestChartNew = ({ strategyId, chartId }: BacktestChartNewProps) => {

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
                    // 🔑 简化主图指标 legend - 不再重复订阅事件
                    const MainChartIndicatorLegendComponent = () => {
                        const { legendData: indicatorLegendData } = useIndicatorLegend({
                            chartId,
                            indicatorKeyStr: indicatorConfig.indicatorKeyStr,
                        });

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

            {/* 子图指标图例 - 使用 Portal 方式渲染到对应的 Pane 中 */}
            {chartConfig.indicatorChartConfigs
                .filter(config => !config.isInMainChart)
                .map((indicatorConfig) => (
                    <SubchartIndicatorLegend
                        key={indicatorConfig.indicatorKeyStr}
                        chartId={chartId}
                        indicatorKeyStr={indicatorConfig.indicatorKeyStr}
                    />
                ))}
        </div>
    );
};

export default BacktestChartNew;